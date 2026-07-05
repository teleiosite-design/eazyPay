package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import android.nfc.NfcAdapter
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.runtime.collectAsState
import com.example.ui.EazyPayViewModel
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
    private var nfcAdapter: NfcAdapter? = null
    private var sharedViewModel: EazyPayViewModel? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        enableEdgeToEdge()
        setContent {
            val vm: EazyPayViewModel = viewModel()
            sharedViewModel = vm
            val themeMode by vm.themePreference.collectAsState()
            MyApplicationTheme(themeMode = themeMode) {
                EazyPayAppNavigator(viewModel = vm)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        sharedViewModel?.refreshProfile()
        nfcAdapter?.let { adapter ->
            val options = Bundle().apply {
                putInt(NfcAdapter.EXTRA_READER_PRESENCE_CHECK_DELAY, 250)
            }
            adapter.enableReaderMode(
                this,
                { tag ->
                    sharedViewModel?.onNfcTagDiscovered(tag)
                },
                NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK,
                options
            )
        }
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableReaderMode(this)
    }
}

@Composable
fun EazyPayAppNavigator(viewModel: EazyPayViewModel) {
    val navController = rememberNavController()
    
    // Store simple navigation params in memory
    var currentName by remember { mutableStateOf("") }
    var currentPhone by remember { mutableStateOf("") }
    var currentPassword by remember { mutableStateOf("") }
    val defaultRole = if (com.example.BuildConfig.FLAVOR == "merchant") "vendor" else "customer"
    var chosenRole by remember { mutableStateOf(defaultRole) }

    NavHost(
        navController = navController,
        startDestination = "splash",
        modifier = Modifier.fillMaxSize()
    ) {
        composable("splash") {
            SplashScreen(
                onNavigate = {
                    if (viewModel.isRegistered.value) {
                        val role = if (com.example.BuildConfig.FLAVOR == "merchant") {
                            "vendor"
                        } else if (com.example.BuildConfig.FLAVOR == "customer") {
                            "customer"
                        } else {
                            viewModel.currentRole.value
                        }
                        if (role == "customer") {
                            navController.navigate("customer_main") {
                                popUpTo("splash") { inclusive = true }
                            }
                        } else {
                            navController.navigate("vendor_main") {
                                popUpTo("splash") { inclusive = true }
                            }
                        }
                    } else {
                        navController.navigate("onboarding") {
                            popUpTo("splash") { inclusive = true }
                        }
                    }
                }
            )
        }
        
        composable("onboarding") {
            OnboardingScreen(
                onFinished = {
                    navController.navigate("register") {
                        popUpTo("onboarding") { inclusive = true }
                    }
                }
            )
        }
        
        composable("register") {
            val isLoading by viewModel.loading.collectAsState()
            val errorMessage by viewModel.apiError.collectAsState()
            RegisterScreen(
                isLoading = isLoading,
                errorMessage = errorMessage,
                onContinue = { name, phone, password, role ->
                    val forcedRole = if (com.example.BuildConfig.FLAVOR == "customer") {
                        "customer"
                    } else if (com.example.BuildConfig.FLAVOR == "merchant") {
                        "vendor"
                    } else {
                        role
                    }
                    currentName = name
                    currentPhone = phone
                    currentPassword = password
                    chosenRole = forcedRole
                    
                    viewModel.registerUserOnline(name, phone, password, forcedRole) {
                        viewModel.sendOtpOnline(phone, forcedRole) {
                            navController.navigate("otp")
                        }
                    }
                }
            )
        }
        
        composable("otp") {
            val isLoading by viewModel.loading.collectAsState()
            val errorMessage by viewModel.apiError.collectAsState()
            OtpScreen(
                phone = currentPhone,
                isLoading = isLoading,
                errorMessage = errorMessage,
                onVerified = { otp ->
                    viewModel.verifyOtpOnline(currentPhone, otp, chosenRole) {
                        navController.navigate("set_pin")
                    }
                }
            )
        }
        
        composable("set_pin") {
            val isLoading by viewModel.loading.collectAsState()
            val errorMessage by viewModel.apiError.collectAsState()
            SetPinScreen(
                isLoading = isLoading,
                errorMessage = errorMessage,
                onPinSet = { pin ->
                    viewModel.setPinOnline(currentPhone, pin, currentPassword, chosenRole) {
                        if (chosenRole == "customer") {
                            navController.navigate("customer_main") {
                                popUpTo("register") { inclusive = true }
                            }
                        } else {
                            navController.navigate("vendor_main") {
                                popUpTo("register") { inclusive = true }
                            }
                        }
                    }
                }
            )
        }
        
        composable("customer_main") {
            CustomerMainScreen(
                viewModel = viewModel,
                onSignOut = {
                    viewModel.setRegistered(false)
                    navController.navigate("register") {
                        popUpTo("customer_main") { inclusive = true }
                    }
                }
            )
        }
        
        composable("vendor_main") {
            VendorMainScreen(
                viewModel = viewModel,
                onSignOut = {
                    viewModel.setRegistered(false)
                    navController.navigate("register") {
                        popUpTo("vendor_main") { inclusive = true }
                    }
                }
            )
        }
    }
}
