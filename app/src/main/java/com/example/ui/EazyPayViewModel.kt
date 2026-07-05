package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class SupportChatMessage(
    val sender: String, // "User" or "Agent"
    val message: String,
    val timestamp: Long = System.currentTimeMillis()
)

class EazyPayViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = EazyPayRepository(application)

    init {
        refreshProfile()
    }

    val currentRole = repository.currentRole
    val isRegistered = repository.isRegistered
    val isBiometricEnabled = repository.isBiometricEnabled
    val themePreference = repository.themePreference
    val registeredCards = repository.registeredCards
    val isOffline = repository.isOffline
    val isSyncing = repository.isSyncing
    val customer = repository.customer
    val vendor = repository.vendor
    val userPin = repository.userPin
    val offers = repository.offers

    fun setThemePreference(mode: String) {
        repository.setThemePreference(mode)
    }
    val transactions = repository.transactions.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Interactive Demo / Payment States
    private val _demoActive = MutableStateFlow(false)
    val demoActive: StateFlow<Boolean> = _demoActive

    private val _demoStep = MutableStateFlow(1) // 1: Tap, 2: ID Read, 3: Amount, 4: PIN, 5: Confirmed
    val demoStep: StateFlow<Int> = _demoStep

    // Active Vendor Terminal State
    // 1: Waiting, 2: Card Detected, 3: Confirming customer PIN, 4: Payment Received
    private val _terminalState = MutableStateFlow(1)
    val terminalState: StateFlow<Int> = _terminalState

    private val _terminalAmount = MutableStateFlow("200")
    val terminalAmount: StateFlow<String> = _terminalAmount

    private val _terminalCustomer = MutableStateFlow<CustomerUser?>(null)
    val terminalCustomer: StateFlow<CustomerUser?> = _terminalCustomer

    private val _terminalCardPublicKey = MutableStateFlow("")
    val terminalCardPublicKey: StateFlow<String> = _terminalCardPublicKey

    private val _pinBuffer = MutableStateFlow("")
    val pinBuffer: StateFlow<String> = _pinBuffer

    private val _pinError = MutableStateFlow(false)
    val pinError: StateFlow<Boolean> = _pinError

    // Production-Ready PIN attempts, lockouts, support chat and dispute states
    private val _pinAttemptsRemaining = MutableStateFlow(3)
    val pinAttemptsRemaining: StateFlow<Int> = _pinAttemptsRemaining

    private val _isLockedOut = MutableStateFlow(false)
    val isLockedOut: StateFlow<Boolean> = _isLockedOut

    private val _disputedTransactions = MutableStateFlow<Set<Int>>(emptySet())
    val disputedTransactions: StateFlow<Set<Int>> = _disputedTransactions

    private val _chatMessages = MutableStateFlow<List<SupportChatMessage>>(listOf(
        SupportChatMessage("Agent", "Hello! Welcome to EazyPay Babcock Support. How can we help you today?")
    ))
    val chatMessages: StateFlow<List<SupportChatMessage>> = _chatMessages

    private var demoJob: Job? = null

    fun setRole(role: String) {
        viewModelScope.launch {
            repository.setRole(role)
        }
    }

    fun setRegistered(registered: Boolean, phone: String? = null, role: String? = null) {
        repository.setRegistered(registered, phone, role)
    }

    fun setBiometricEnabled(enabled: Boolean) {
        repository.setBiometricEnabled(enabled)
    }

    fun addNfcCard(cardName: String) {
        repository.addNfcCard(cardName)
    }

    fun removeNfcCard(cardName: String) {
        repository.removeNfcCard(cardName)
    }

    fun updateCustomerDetails(name: String, email: String, phone: String, department: String, level: String) {
        repository.updateCustomerDetails(name, email, phone, department, level)
    }

    fun toggleOffline() {
        viewModelScope.launch {
            val nextOffline = !isOffline.value
            repository.setOffline(nextOffline)
            if (!nextOffline) {
                // RESTORED CONNECTION -> Auto-sync!
                repository.syncPending()
            }
        }
    }

    fun topUpWallet(amount: Double) {
        viewModelScope.launch {
            repository.topUpWallet(amount)
        }
    }

    fun setPin(pin: String) {
        viewModelScope.launch {
            repository.setPin(pin)
        }
    }

    fun appendPinChar(char: Char, onPinComplete: () -> Unit) {
        if (_isLockedOut.value) return
        if (_pinBuffer.value.length < 4) {
            _pinBuffer.value = _pinBuffer.value + char
            if (_pinBuffer.value.length == 4) {
                verifyPinAndExecute(onPinComplete)
            }
        }
    }

    fun deletePinChar() {
        if (_isLockedOut.value) return
        if (_pinBuffer.value.isNotEmpty()) {
            _pinBuffer.value = _pinBuffer.value.dropLast(1)
        }
    }

    fun resetPinAttempts() {
        _pinAttemptsRemaining.value = 3
        _isLockedOut.value = false
        _pinBuffer.value = ""
    }

    fun disputeTransaction(id: Int) {
        _disputedTransactions.value = _disputedTransactions.value + id
    }

    fun sendChatMessage(msg: String) {
        if (msg.isBlank()) return
        viewModelScope.launch {
            _chatMessages.value = _chatMessages.value + SupportChatMessage("User", msg)
            delay(800)
            val reply = when {
                msg.contains("card", ignoreCase = true) || msg.contains("sticker", ignoreCase = true) -> 
                    "You can link your EazyPay NFC card or sticker instantly at the Babcock IT Support booth or via any registered Customer Union Agent device."
                msg.contains("charge", ignoreCase = true) || msg.contains("withdraw", ignoreCase = true) -> 
                    "Withdrawals are settled directly to your linked bank account (e.g. GTBank) within 24 hours. Contact our finance line if you experience any delay."
                msg.contains("offline", ignoreCase = true) -> 
                    "Yes! EazyPay uses advanced offline signed cryptographic ledger validation, ensuring payments execute securely with absolutely zero internet connectivity."
                msg.contains("failed", ignoreCase = true) || msg.contains("dispute", ignoreCase = true) ->
                    "We apologize for the inconvenience! Tap on any transaction in your History tab, select 'Dispute Transaction' and our administrative panel will review it."
                else -> 
                    "Thank you for contacting Babcock EazyPay Support. We have logged your request. One of our agents is reviewing your ticket and will respond shortly."
            }
            _chatMessages.value = _chatMessages.value + SupportChatMessage("Agent", reply)
        }
    }

    private fun verifyPinAndExecute(onPinComplete: () -> Unit) {
        viewModelScope.launch {
            if (_pinBuffer.value == userPin.value) {
                _pinError.value = false
                _pinAttemptsRemaining.value = 3 // reset attempts
                onPinComplete()
                _pinBuffer.value = ""
            } else {
                _pinError.value = true
                val remaining = (_pinAttemptsRemaining.value - 1).coerceAtLeast(0)
                _pinAttemptsRemaining.value = remaining
                if (remaining == 0) {
                    _isLockedOut.value = true
                }
                delay(800)
                _pinBuffer.value = ""
                _pinError.value = false
            }
        }
    }

    fun setTerminalAmount(amount: String) {
        _terminalAmount.value = amount
    }

    fun triggerTerminalScan() {
        viewModelScope.launch {
            _terminalState.value = 2 // Card Detected
            _terminalCustomer.value = customer.value
        }
    }

    fun resetTerminal() {
        _terminalState.value = 1
        _pinBuffer.value = ""
    }

    fun chargeCustomerFromTerminal(onComplete: () -> Unit) {
        viewModelScope.launch {
            _terminalState.value = 3 // Waiting for PIN
            // This is where customer enters PIN
        }
    }

    fun completeTerminalPayment() {
        viewModelScope.launch {
            val amount = _terminalAmount.value.toDoubleOrNull() ?: 200.0
            val targetCustomer = _terminalCustomer.value ?: customer.value
            val nonce = (100000..999999).random()
            
            val vendorNameStr = "Terminal: " + (vendor.value.name.ifEmpty { "Vendor" })
            repository.performNfcPayment(
                vendorName = vendorNameStr,
                amount = amount,
                isCustomerDebit = true,
                nonce = nonce,
                customerId = targetCustomer.id,
                vendorId = vendor.value.id,
                signature = "NFC_BYPASS"
            )
            repository.performNfcPayment(
                vendorName = "Payment from " + targetCustomer.name,
                amount = amount,
                isCustomerDebit = false,
                nonce = nonce,
                customerId = targetCustomer.id,
                vendorId = vendor.value.id,
                signature = "NFC_BYPASS"
            )
            
            _terminalState.value = 4 // Success
        }
    }

    fun withdrawFunds(amount: Double, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val success = repository.triggerWithdrawal(amount)
            onResult(success)
        }
    }

    // Demo flows purged to clean codebase.

    // --- PHYSICAL NFC AND QR CODE TRANSACTION CHANNELS ---

    private val _nfcWriteMode = MutableStateFlow(false)
    val nfcWriteMode: StateFlow<Boolean> = _nfcWriteMode

    private val _nfcWriteCardName = MutableStateFlow("")
    val nfcWriteCardName: StateFlow<String> = _nfcWriteCardName

    private val _nfcWriteStatus = MutableStateFlow<String?>(null)
    val nfcWriteStatus: StateFlow<String?> = _nfcWriteStatus

    fun startNfcWriteMode(cardName: String) {
        _nfcWriteCardName.value = cardName
        _nfcWriteMode.value = true
        _nfcWriteStatus.value = "Place new tag against back of device..."
    }

    fun stopNfcWriteMode() {
        _nfcWriteMode.value = false
        _nfcWriteCardName.value = ""
        _nfcWriteStatus.value = null
    }

    /**
     * Handles physical NFC tag taps detected by the foreground Activity.
     */
    fun onNfcTagDiscovered(tag: android.nfc.Tag) {
        viewModelScope.launch {
            if (_nfcWriteMode.value) {
                _nfcWriteStatus.value = "Registering: Writing cryptographic customer ID and public key..."
                val success = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
                    val passwordBytes = byteArrayOf(0x05, 0x0D, 0x1A, 0x00) // Derived password from brand color
                    val customerId = customer.value.id
                    val publicKeyBase64 = com.example.security.CryptographyManager.getPublicKeyBase64() ?: ""
                    com.example.nfc.NtagCardManager.writeAndLockCard(
                        tag = tag,
                        customerId = customerId,
                        publicKeyBase64 = publicKeyBase64,
                        passwordBytes = passwordBytes
                    )
                }

                if (success) {
                    _nfcWriteStatus.value = "✓ Card registered and password-locked successfully!"
                    repository.addNfcCard(_nfcWriteCardName.value)
                    delay(1500)
                    stopNfcWriteMode()
                } else {
                    _nfcWriteStatus.value = "❌ Programming failed. Ensure card is NTAG213."
                }
            } else if (_terminalState.value == 1) {
                // Read Mode: Merchant terminal waiting for tap
                val cardData = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
                    com.example.nfc.NtagCardManager.readCard(tag)
                }

                if (cardData != null) {
                    _terminalCustomer.value = CustomerUser(
                        id = cardData.customerId,
                        name = "Card ID: " + cardData.customerId,
                        email = "",
                        phone = "",
                        department = "",
                        level = "",
                        balance = 0.0
                    )
                    _terminalCardPublicKey.value = cardData.publicKeyBase64
                    _terminalState.value = 2 // Move to enter amount/confirm checkout
                }
            }
        }
    }

    /**
     * Generates a signed payment token QR payload for the customer.
     */
    fun generatePaymentQrPayload(amount: Double): String {
        val customerId = customer.value.id
        val nonce = (100000..999999).random() // Replay protection nonce
        val timestamp = System.currentTimeMillis()
        val payload = "$customerId|$nonce|$timestamp|$amount"
        val signature = com.example.security.CryptographyManager.signPayload(payload) ?: ""
        val publicKey = com.example.security.CryptographyManager.getPublicKeyBase64() ?: ""
        return "$payload|$signature|$publicKey"
    }

    /**
     * Parses and cryptographically validates a scanned payment QR Code payload offline.
     */
    fun processScannedQrCode(qrPayload: String, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                // Format: "customerId|nonce|timestamp|amount|signature|publicKeyBase64"
                val parts = qrPayload.split("|")
                if (parts.size >= 6) {
                    val customerId = parts[0]
                    val nonceStr = parts[1]
                    val timestampStr = parts[2]
                    val amountStr = parts[3]
                    val signatureBase64 = parts[4]
                    val publicKeyBase64 = parts[5]

                    val nonce = nonceStr.toIntOrNull() ?: 0
                    val amount = amountStr.toDoubleOrNull() ?: 0.0

                    // 1. Replay Protection
                    if (repository.isNonceDuplicate(nonce)) {
                        _pinError.value = true
                        onComplete(false)
                        return@launch
                    }

                    // 2. Cryptographic signature check
                    val payloadToVerify = "$customerId|$nonceStr|$timestampStr|$amountStr"
                    val isSignatureValid = com.example.security.CryptographyManager.verifySignature(
                        payload = payloadToVerify,
                        signatureBase64 = signatureBase64,
                        publicKeyBase64 = publicKeyBase64
                    )

                    if (isSignatureValid) {
                        _terminalAmount.value = amountStr
                        _terminalCustomer.value = CustomerUser(
                            id = customerId,
                            name = "Babcock Customer ($customerId)",
                            email = "s.union@babcock.edu.ng", phone = "", department = "", level = "",
                            balance = 0.0
                        )

                        // Deduct customer balance and add vendor earnings locally
                        val vendorNameStr = "Terminal: " + (vendor.value.name.ifEmpty { "Vendor" })
                        repository.performNfcPayment(
                            vendorName = vendorNameStr,
                            amount = amount,
                            isCustomerDebit = true,
                            nonce = nonce,
                            customerId = customerId,
                            vendorId = vendor.value.id,
                            signature = signatureBase64
                        )
                        repository.performNfcPayment(
                            vendorName = "Payment from $customerId (QR)",
                            amount = amount,
                            isCustomerDebit = false,
                            nonce = nonce,
                            customerId = customerId,
                            vendorId = vendor.value.id,
                            signature = signatureBase64
                        )

                        _terminalState.value = 4 // Payment Success!
                        onComplete(true)
                    } else {
                        _pinError.value = true
                        onComplete(false)
                    }
                } else {
                    onComplete(false)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                onComplete(false)
            }
        }
    }

    // API Onboarding States
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _apiError = MutableStateFlow<String?>(null)
    val apiError: StateFlow<String?> = _apiError

    fun registerUserOnline(name: String, phone: String, passwordPlain: String, role: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            _apiError.value = null
            try {
                if (role == "customer") {
                    // Generate EC keys locally
                    com.example.security.CryptographyManager.generateKeyPair()
                    val publicKey = com.example.security.CryptographyManager.getPublicKeyBase64() ?: ""
                    
                    val response = EazyPayApiClient.apiService.registerCustomer(
                        RegisterCustomerRequest(name = name, phone = phone, publicKeyBase64 = publicKey)
                    )
                    // Save details in repo
                    repository.updateCustomerDetails(response.name, "", response.phone, "", "")
                    repository.setRegistered(false, response.phone, "customer")
                    // Save active ID
                    val prefs = getApplication<Application>().getSharedPreferences("eazypay_prefs", android.content.Context.MODE_PRIVATE)
                    prefs.edit().putString("student_id", response.id).apply()
                } else {
                    val response = EazyPayApiClient.apiService.registerMerchant(
                        RegisterMerchantRequest(name = name, phone = phone, password = passwordPlain)
                    )
                    repository.updateVendorDetails(
                        name = response.name,
                        phone = response.phone,
                        id = response.id
                    )
                    repository.setRegistered(false, response.phone, "vendor")
                }
                _loading.value = false
                onSuccess()
            } catch (e: Exception) {
                _loading.value = false
                _apiError.value = e.message ?: "Registration failed"
                e.printStackTrace()
            }
        }
    }

    fun sendOtpOnline(phone: String, role: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            _apiError.value = null
            try {
                val res = EazyPayApiClient.apiService.sendOtp(SendOtpRequest(phone, role))
                _loading.value = false
                if (res.success) {
                    onSuccess()
                } else {
                    _apiError.value = "Failed to trigger OTP"
                }
            } catch (e: Exception) {
                _loading.value = false
                _apiError.value = e.message ?: "OTP trigger failed"
                e.printStackTrace()
            }
        }
    }

    fun verifyOtpOnline(phone: String, otp: String, role: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            _apiError.value = null
            try {
                val res = EazyPayApiClient.apiService.verifyOtp(VerifyOtpRequest(phone, otp, role))
                _loading.value = false
                if (res.success) {
                    onSuccess()
                } else {
                    _apiError.value = "Incorrect OTP code"
                }
            } catch (e: Exception) {
                _loading.value = false
                _apiError.value = e.message ?: "OTP verification failed"
                e.printStackTrace()
            }
        }
    }

    fun setPinOnline(phone: String, pin: String, passwordPlain: String, role: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            _apiError.value = null
            try {
                val res = if (role == "customer") {
                    EazyPayApiClient.apiService.setCustomerPin(SetPinRequest(phone, pin))
                } else {
                    EazyPayApiClient.apiService.setMerchantPin(SetPinRequest(phone, pin))
                }
                if (res.success) {
                    // Log in to obtain the JWT token and save it in SharedPreferences as "access_token"
                    val loginPass = if (role == "customer") pin else passwordPlain
                    val loginRes = EazyPayApiClient.apiService.login(LoginRequest(phone, loginPass))
                    val prefs = getApplication<Application>().getSharedPreferences("eazypay_prefs", android.content.Context.MODE_PRIVATE)
                    prefs.edit().putString("access_token", loginRes.accessToken).apply()
                    
                    repository.setPin(pin)
                    repository.setRegistered(true, phone, role)
                    _loading.value = false
                    onSuccess()
                } else {
                    _loading.value = false
                    _apiError.value = "Failed to configure PIN"
                }
            } catch (e: Exception) {
                _loading.value = false
                _apiError.value = e.message ?: "PIN setup failed"
                e.printStackTrace()
            }
        }
    }

    fun transferFundsOnline(recipientPhone: String, amount: Double, pin: String, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            _apiError.value = null
            try {
                val prefs = getApplication<Application>().getSharedPreferences("eazypay_prefs", android.content.Context.MODE_PRIVATE)
                val token = prefs.getString("access_token", "") ?: ""
                val bearerToken = "Bearer $token"
                val response = EazyPayApiClient.apiService.transferFunds(
                    token = bearerToken,
                    body = TransferRequest(recipientPhone = recipientPhone, amount = amount, pin = pin)
                )
                _loading.value = false
                if (response.success) {
                    refreshProfile()
                    onResult(true, response.message)
                } else {
                    _apiError.value = response.message
                    onResult(false, response.message)
                }
            } catch (e: Exception) {
                _loading.value = false
                val errMsg = e.message ?: "Transfer failed"
                _apiError.value = errMsg
                onResult(false, errMsg)
            }
        }
    }

    fun refreshProfile() {
        viewModelScope.launch {
            try {
                val role = currentRole.value
                if (role == "customer") {
                    val customerId = customer.value.id
                    if (customerId.isNotEmpty()) {
                        val profile = EazyPayApiClient.apiService.getCustomerProfile(customerId)
                        repository.updateCustomerDetails(profile.name, "", profile.phone, "", "")
                        repository.updateCustomerBalance(profile.balance)
                    }
                } else if (role == "vendor") {
                    val vendorId = vendor.value.id
                    if (vendorId.isNotEmpty()) {
                        val profile = EazyPayApiClient.apiService.getMerchantProfile(vendorId)
                        repository.updateVendorDetails(
                            name = profile.name,
                            phone = profile.phone,
                            id = profile.id
                        )
                        repository.updateVendorEarnings(profile.balance)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun syncAll() {
        viewModelScope.launch {
            repository.syncPending()
            refreshProfile()
        }
    }
}
