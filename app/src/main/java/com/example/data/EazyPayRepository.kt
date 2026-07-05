package com.example.data

import android.content.Context
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.GlobalScope

data class CustomerUser(
    val id: String = "",
    val name: String = "Unregistered User",
    val balance: Double = 0.0,
    val phone: String = "",
    val email: String = "",
    val department: String = "",
    val level: String = ""
)

data class VendorUser(
    val id: String = "",
    val name: String = "Unregistered Vendor",
    val phone: String = "",
    val todayEarnings: Double = 0.0,
    val bankName: String = "",
    val accountNumber: String = ""
)

data class Offer(
    val id: String,
    val title: String,
    val subtitle: String,
    val category: String
)

class EazyPayRepository(context: Context) {
    private val db = AppDatabase.getDatabase(context)
    private val dao = db.transactionDao()
    private val prefs = context.getSharedPreferences("eazypay_prefs", Context.MODE_PRIVATE)

    // Active Role state: "customer" or "vendor"
    private val _currentRole = MutableStateFlow(prefs.getString("current_role", "customer") ?: "customer")
    val currentRole: StateFlow<String> = _currentRole

    // Registration state
    private val _isRegistered = MutableStateFlow(prefs.getBoolean("is_registered", false))
    val isRegistered: StateFlow<Boolean> = _isRegistered

    // Biometric payment authentication state
    private val _isBiometricEnabled = MutableStateFlow(prefs.getBoolean("is_biometric_enabled", false))
    val isBiometricEnabled: StateFlow<Boolean> = _isBiometricEnabled

    // Theme preference state: "system", "light", "dark"
    private val _themePreference = MutableStateFlow(prefs.getString("theme_preference", "system") ?: "system")
    val themePreference: StateFlow<String> = _themePreference

    fun setThemePreference(mode: String) {
        _themePreference.value = mode
        prefs.edit().putString("theme_preference", mode).apply()
    }

    // Registered physical NFC smart cards/stickers
    private val _registeredCards = MutableStateFlow(
        prefs.getString("registered_cards", "")?.split(",")?.filter { it.isNotEmpty() } ?: emptyList()
    )
    val registeredCards: StateFlow<List<String>> = _registeredCards

    // Offline state
    private val _isOffline = MutableStateFlow(false)
    val isOffline: StateFlow<Boolean> = _isOffline

    // Syncing state
    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing

    // Customer Wallet state
    private val _customer = MutableStateFlow(
        CustomerUser(
            id = prefs.getString("customer_id", "") ?: "",
            name = prefs.getString("customer_name", "Unregistered User") ?: "Unregistered User",
            balance = prefs.getFloat("customer_balance", 0.0f).toDouble(),
            phone = prefs.getString("customer_phone", "") ?: "",
            email = prefs.getString("customer_email", "") ?: "",
            department = prefs.getString("customer_department", "") ?: "",
            level = prefs.getString("customer_level", "") ?: ""
        )
    )
    val customer: StateFlow<CustomerUser> = _customer

    // Vendor Earnings state
    private val _vendor = MutableStateFlow(
        VendorUser(
            id = prefs.getString("vendor_id", "") ?: "",
            name = prefs.getString("vendor_name", "Unregistered Vendor") ?: "Unregistered Vendor",
            phone = prefs.getString("vendor_phone", "") ?: "",
            todayEarnings = prefs.getFloat("vendor_earnings", 0.0f).toDouble(),
            bankName = prefs.getString("vendor_bank", "") ?: "",
            accountNumber = prefs.getString("vendor_account", "") ?: ""
        )
    )
    val vendor: StateFlow<VendorUser> = _vendor

    // PIN State
    private val _userPin = MutableStateFlow(prefs.getString("user_pin", "") ?: "")
    val userPin: StateFlow<String> = _userPin

    // Offers
    val offers = listOf(
        Offer("1", "Mama Tee's Kitchen", "Get ₦50 back on 🍲 rice & swallow", "food"),
        Offer("2", "Campus Print Hub", "10 pages free on 🖨️ assignment prints", "print"),
        Offer("3", "Flash Deal", "2% airtime bonus 🛜 on instant top-up", "topup")
    )

    // Transactions list flow from database
    val transactions: Flow<List<TransactionEntity>> = dao.getAllTransactions()

    init {
        // Initial seeding is performed in background
        kotlinx.coroutines.GlobalScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            seedInitialData()
        }
    }

    fun setRegistered(registered: Boolean, phone: String? = null, role: String? = null) {
        val editor = prefs.edit().putBoolean("is_registered", registered)
        if (role != null) {
            editor.putString("current_role", role)
            _currentRole.value = role
        }
        if (phone != null) {
            val formattedPhone = "+234 " + phone.removePrefix("+234").trim()
            if (role == "vendor") {
                val currentVendor = _vendor.value
                val newVendor = currentVendor.copy(id = "EP-V-" + phone.takeLast(4))
                _vendor.value = newVendor
                editor.putString("vendor_id", newVendor.id)
            } else {
                val currentCustomer = _customer.value
                val newCustomer = currentCustomer.copy(phone = formattedPhone, id = "EP-" + phone.takeLast(4))
                _customer.value = newCustomer
                editor.putString("customer_phone", formattedPhone)
                editor.putString("customer_id", newCustomer.id)
            }
        }
        editor.apply()
        _isRegistered.value = registered
    }

    fun setBiometricEnabled(enabled: Boolean) {
        _isBiometricEnabled.value = enabled
        prefs.edit().putBoolean("is_biometric_enabled", enabled).apply()
    }

    fun addNfcCard(cardName: String) {
        val current = _registeredCards.value.toMutableList()
        current.add(cardName)
        _registeredCards.value = current
        prefs.edit().putString("registered_cards", current.joinToString(",")).apply()
    }

    fun removeNfcCard(cardName: String) {
        val current = _registeredCards.value.toMutableList()
        current.remove(cardName)
        _registeredCards.value = current
        prefs.edit().putString("registered_cards", current.joinToString(",")).apply()
    }

    fun updateCustomerDetails(name: String, email: String, phone: String, department: String, level: String) {
        val updated = _customer.value.copy(
            name = name,
            email = email,
            phone = phone,
            department = department,
            level = level
        )
        _customer.value = updated
        prefs.edit()
            .putString("customer_name", name)
            .putString("customer_email", email)
            .putString("customer_phone", phone)
            .putString("customer_department", department)
            .putString("customer_level", level)
            .apply()
    }

    fun updateVendorDetails(name: String, phone: String, id: String? = null, bankName: String? = null, accountNumber: String? = null) {
        val currentVendor = _vendor.value
        val updated = currentVendor.copy(
            id = id ?: currentVendor.id,
            name = name,
            phone = phone.ifEmpty { currentVendor.phone },
            bankName = bankName ?: currentVendor.bankName.ifEmpty { "GTBank" }, // default fallback mock bank for testing
            accountNumber = accountNumber ?: currentVendor.accountNumber.ifEmpty { "0123456789" } // default fallback mock account
        )
        _vendor.value = updated
        val editor = prefs.edit()
            .putString("vendor_name", name)
            .putString("vendor_phone", phone)
        if (id != null) editor.putString("vendor_id", id)
        editor.putString("vendor_bank", updated.bankName)
        editor.putString("vendor_account", updated.accountNumber)
        editor.apply()
    }

    fun updateCustomerBalance(balance: Double) {
        val current = _customer.value
        val updated = current.copy(balance = balance)
        _customer.value = updated
        prefs.edit().putFloat("customer_balance", balance.toFloat()).apply()
    }

    fun updateVendorEarnings(earnings: Double) {
        val current = _vendor.value
        val updated = current.copy(todayEarnings = earnings)
        _vendor.value = updated
        prefs.edit().putFloat("vendor_earnings", earnings.toFloat()).apply()
    }

    fun setRole(role: String) {
        _currentRole.value = role
        prefs.edit().putString("current_role", role).apply()
    }

    fun setOffline(offline: Boolean) {
        _isOffline.value = offline
    }

    suspend fun setSyncing(syncing: Boolean) {
        _isSyncing.value = syncing
    }

    fun setPin(pin: String) {
        _userPin.value = pin
        prefs.edit().putString("user_pin", pin).apply()
    }

    suspend fun topUpWallet(amount: Double) {
        val currentCustomer = _customer.value
        val updatedCustomer = currentCustomer.copy(balance = currentCustomer.balance + amount)
        _customer.value = updatedCustomer
        prefs.edit().putFloat("customer_balance", updatedCustomer.balance.toFloat()).apply()
        
        // Add top-up transaction
        val status = if (_isOffline.value) "Pending" else "Synced"
        addTransaction(
            title = "Wallet Top-up",
            category = "topup",
            amount = amount,
            isDebit = false,
            status = status
        )
    }

    suspend fun addTransaction(
        title: String,
        category: String,
        amount: Double,
        isDebit: Boolean,
        status: String = if (_isOffline.value) "Pending" else "Synced",
        nonce: Int = 0,
        customerId: String = "",
        vendorId: String = "",
        signature: String = ""
    ) {
        dao.insertTransaction(
            TransactionEntity(
                title = title,
                category = category,
                timestamp = System.currentTimeMillis(),
                amount = amount,
                isDebit = isDebit,
                syncStatus = status,
                nonce = nonce,
                customerId = customerId,
                vendorId = vendorId,
                signature = signature
            )
        )

        // Adjust customer balance or vendor earnings locally
        if (isDebit) {
            val currentCustomer = _customer.value
            val updatedCustomer = currentCustomer.copy(balance = currentCustomer.balance - amount)
            _customer.value = updatedCustomer
            prefs.edit().putFloat("customer_balance", updatedCustomer.balance.toFloat()).apply()
        } else {
            if (category != "topup") { // Received money as payment
                val currentVendor = _vendor.value
                val updatedVendor = currentVendor.copy(todayEarnings = currentVendor.todayEarnings + amount)
                _vendor.value = updatedVendor
                prefs.edit().putFloat("vendor_earnings", updatedVendor.todayEarnings.toFloat()).apply()
            }
        }
    }

    suspend fun performNfcPayment(
        vendorName: String,
        amount: Double,
        isCustomerDebit: Boolean,
        nonce: Int = 0,
        customerId: String = "",
        vendorId: String = "",
        signature: String = ""
    ) {
        val status = if (_isOffline.value) "Pending" else "Synced"
        if (isCustomerDebit) {
            // Deduct from customer balance
            addTransaction(
                title = vendorName,
                category = "food", // default
                amount = amount,
                isDebit = true,
                status = status,
                nonce = nonce,
                customerId = customerId,
                vendorId = vendorId,
                signature = signature
            )
        } else {
            // Add to vendor earnings
            addTransaction(
                title = "Payment received",
                category = "food",
                amount = amount,
                isDebit = false,
                status = status,
                nonce = nonce,
                customerId = customerId,
                vendorId = vendorId,
                signature = signature
            )
        }
    }

    suspend fun getLatestNonce(): Int {
        return dao.getLatestNonce() ?: 0
    }

    suspend fun isNonceDuplicate(nonce: Int): Boolean {
        return dao.getTransactionByNonce(nonce) != null
    }

    suspend fun triggerWithdrawal(amount: Double): Boolean {
        val currentVendor = _vendor.value
        if (currentVendor.todayEarnings >= amount) {
            val updatedVendor = currentVendor.copy(todayEarnings = currentVendor.todayEarnings - amount)
            _vendor.value = updatedVendor
            prefs.edit().putFloat("vendor_earnings", updatedVendor.todayEarnings.toFloat()).apply()
            
            // Record a withdrawal transaction as debit for vendor
            addTransaction(
                title = "Bank Withdrawal",
                category = "topup",
                amount = amount,
                isDebit = true,
                status = if (_isOffline.value) "Pending" else "Synced"
            )
            return true
        }
        return false
    }

    suspend fun syncPending() {
        if (_isOffline.value) return
        _isSyncing.value = true
        try {
            val pendingList = dao.getPendingTransactions()
            if (pendingList.isNotEmpty()) {
                val token = prefs.getString("access_token", "") ?: ""
                val payloads = pendingList.map { tx ->
                    SyncTransactionPayload(
                        customerId = tx.customerId.ifEmpty { _customer.value.id },
                        vendorId = tx.vendorId.ifEmpty { _vendor.value.id },
                        amount = tx.amount,
                        nonce = tx.nonce,
                        timestamp = tx.timestamp,
                        signature = tx.signature
                    )
                }
                val bearerToken = "Bearer $token"
                EazyPayApiClient.apiService.syncTransactions(
                    token = bearerToken,
                    body = SyncTransactionsRequest(payloads)
                )
                dao.syncPendingTransactions()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            _isSyncing.value = false
        }
    }

    private suspend fun seedInitialData() {
        // Purged legacy mock transactions database seeding to start from a clean state.
    }
}
