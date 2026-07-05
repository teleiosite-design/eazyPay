package com.example.ui.screens

import androidx.compose.animation.*
import com.eazypay.app.BuildConfig
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import kotlinx.coroutines.delay

// 1. SPLASH SCREEN
@Composable
fun SplashScreen(
    onNavigate: () -> Unit
) {
    LaunchedEffect(Unit) {
        delay(2200)
        onNavigate()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(Surface, Background),
                    radius = 1200f
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .clip(CircleShape)
                    .background(PrimaryTeal.copy(alpha = 0.15f))
                    .border(2.dp, PrimaryTeal, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Nfc,
                    contentDescription = "Logo",
                    tint = PrimaryTeal,
                    modifier = Modifier.size(48.dp)
                )
            }
            Spacer(modifier = Modifier.height(20.dp))
            Text(
                text = "EazyPay",
                color = TextPrimary,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "One Tap. Zero Internet.",
                color = PrimaryTeal,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 1.sp
            )
        }
    }
}

// 2. ONBOARDING SCREEN
@Composable
fun OnboardingScreen(
    onFinished: () -> Unit
) {
    var step by remember { mutableStateOf(1) }

    val slides = listOf(
        Triple(
            "One Tap. Zero Internet.",
            "Complete payments instantly using secure NFC tap. No network coverage? No worries—it works completely offline.",
            Icons.Default.Sensors
        ),
        Triple(
            "Your campus, cashless.",
            "Pay keke riders, cafeteria staff, print shops, and more. A cohesive smart economy built entirely for your school.",
            Icons.Default.School
        ),
        Triple(
            "Safe. Instant. Offline.",
            "Cryptographically verified transactions prevent double spending and charge reversals. Completely safe, completely instant.",
            Icons.Default.Security
        )
    )

    val currentSlide = slides[step - 1]

    Scaffold(
        containerColor = Background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header Row (Skip button)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                if (step < 3) {
                    Text(
                        text = "Skip",
                        color = TextSecondary,
                        modifier = Modifier
                            .clickable { onFinished() }
                            .padding(8.dp),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                } else {
                    Spacer(modifier = Modifier.size(32.dp))
                }
            }

            // Slide Illustration
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .size(180.dp)
                        .clip(CircleShape)
                        .background(PrimaryTeal.copy(alpha = 0.08f))
                        .border(1.dp, Border, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = currentSlide.third,
                        contentDescription = "Slide Image",
                        tint = PrimaryTeal,
                        modifier = Modifier.size(80.dp)
                    )
                }

                Spacer(modifier = Modifier.height(40.dp))

                // Title & Subtitle
                Text(
                    text = currentSlide.first,
                    color = TextPrimary,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = currentSlide.second,
                    color = TextSecondary,
                    fontSize = 15.sp,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            // Footer controls
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Indicators
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 32.dp)
                ) {
                    repeat(3) { index ->
                        Box(
                            modifier = Modifier
                                .size(width = if (step == index + 1) 24.dp else 8.dp, height = 8.dp)
                                .clip(CircleShape)
                                .background(if (step == index + 1) PrimaryTeal else Border)
                        )
                    }
                }

                // Button
                Button(
                    onClick = {
                        if (step < 3) {
                            step += 1
                        } else {
                            onFinished()
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryTeal)
                ) {
                    Text(
                        text = if (step == 3) "Get Started" else "Next",
                        color = Background,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }
            }
        }
    }
}

// 3. REGISTER SCREEN
@Composable
fun RegisterScreen(
    isLoading: Boolean = false,
    errorMessage: String? = null,
    onContinue: (name: String, phone: String, passwordPlain: String, role: String) -> Unit,
    onWatchDemo: () -> Unit = {},
    onQuickLogin: (role: String) -> Unit = {}
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val defaultRole = if (BuildConfig.FLAVOR == "merchant") "vendor" else "customer"
    var selectedRole by remember { mutableStateOf(defaultRole) }

    Scaffold(
        containerColor = Background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Welcome to EazyPay",
                    color = TextPrimary,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Register to start paying or receiving payments on campus instantly offline.",
                    color = TextSecondary,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Role selector
                Text(
                    text = "SELECT YOUR APP PROFILE",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Surface)
                        .border(1.dp, Border, RoundedCornerShape(12.dp))
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (selectedRole == "customer" || selectedRole == "student") PrimaryTeal else Color.Transparent)
                            .clickable { selectedRole = "customer" },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "🎓 Customer",
                            color = if (selectedRole == "customer" || selectedRole == "student") Background else TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (selectedRole == "vendor") PrimaryTeal else Color.Transparent)
                            .clickable { selectedRole = "vendor" },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "🛺 Vendor / Driver",
                            color = if (selectedRole == "vendor") Background else TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Name Input
                Text(
                    text = if (selectedRole == "vendor") "BUSINESS NAME" else "FULL NAME",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    placeholder = { Text(if (selectedRole == "vendor") "e.g. Campus Cafeteria" else "e.g. Jane Doe", color = TextMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = PrimaryTeal,
                        unfocusedBorderColor = Border,
                        focusedContainerColor = Surface,
                        unfocusedContainerColor = Surface
                    ),
                    singleLine = true,
                    enabled = !isLoading
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Phone Input
                Text(
                    text = "PHONE NUMBER",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    placeholder = { Text("e.g. 801 234 5678", color = TextMuted) },
                    prefix = { Text("+234 ", color = TextPrimary, fontWeight = FontWeight.Bold) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = PrimaryTeal,
                        unfocusedBorderColor = Border,
                        focusedContainerColor = Surface,
                        unfocusedContainerColor = Surface
                    ),
                    singleLine = true,
                    enabled = !isLoading
                )

                if (selectedRole == "vendor") {
                    Spacer(modifier = Modifier.height(16.dp))

                    // Password Input
                    Text(
                        text = "LOGIN PASSWORD",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = { Text("Enter a strong password", color = TextMuted) },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = PrimaryTeal,
                            unfocusedBorderColor = Border,
                            focusedContainerColor = Surface,
                            unfocusedContainerColor = Surface
                        ),
                        singleLine = true,
                        enabled = !isLoading
                    )
                }
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                // Live demo payment button (Investor Wow factor!)
                Card(
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    border = BorderStroke(1.dp, PrimaryTeal.copy(alpha = 0.3f)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp)
                        .clickable { onWatchDemo() }
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(PrimaryTeal.copy(alpha = 0.15f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Play",
                                tint = PrimaryTeal
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Synchronized Demo",
                                color = TextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Watch the split-screen offline payment flow",
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.ChevronRight,
                            contentDescription = "Arrow",
                            tint = TextSecondary
                        )
                    }
                }

                if (!errorMessage.isNullOrBlank()) {
                    Text(
                        text = errorMessage,
                        color = Danger,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                val canSubmit = name.isNotBlank() && phone.isNotBlank() && (selectedRole != "vendor" || password.isNotBlank())
                Button(
                    onClick = {
                        if (canSubmit && !isLoading) {
                            onContinue(name, phone, password, selectedRole)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryTeal),
                    enabled = canSubmit && !isLoading
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = Background,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.5.dp
                        )
                    } else {
                        Text(
                            text = "Continue",
                            color = Background,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedButton(
                    onClick = { onQuickLogin(selectedRole) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, PrimaryTeal),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = PrimaryTeal)
                ) {
                    Text(
                        text = "⚡ Quick Bypass (Skip Registration)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}

// 4. OTP SCREEN
@Composable
fun OtpScreen(
    phone: String,
    isLoading: Boolean = false,
    errorMessage: String? = null,
    onVerified: (otp: String) -> Unit
) {
    var otpCode by remember { mutableStateOf("") }
    var resendTimer by remember { mutableStateOf(45) }

    LaunchedEffect(Unit) {
        while (resendTimer > 0) {
            delay(1000)
            resendTimer -= 1
        }
    }

    Scaffold(
        containerColor = Background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Verify phone",
                    color = TextPrimary,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "We sent a 6-digit confirmation code to +234 $phone",
                    color = TextSecondary,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(40.dp))

                // OTP Cells
                OutlinedTextField(
                    value = otpCode,
                    onValueChange = { if (it.length <= 6) otpCode = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Enter 6-digit code", color = TextMuted) },
                    shape = RoundedCornerShape(12.dp),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = PrimaryTeal,
                        unfocusedBorderColor = Border,
                        focusedContainerColor = Surface,
                        unfocusedContainerColor = Surface
                    ),
                    singleLine = true,
                    textStyle = LocalTextStyle.current.copy(textAlign = TextAlign.Center),
                    enabled = !isLoading
                )

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = if (resendTimer > 0) "Didn't get code? Resend in 0:$resendTimer" else "Didn't get code? Resend Code",
                    color = if (resendTimer == 0) PrimaryTeal else TextSecondary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier
                        .clickable(enabled = resendTimer == 0 && !isLoading) { resendTimer = 45 }
                        .padding(4.dp)
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                if (!errorMessage.isNullOrBlank()) {
                    Text(
                        text = errorMessage,
                        color = Danger,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                Button(
                    onClick = { if (otpCode.length >= 6 && !isLoading) onVerified(otpCode) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryTeal),
                    enabled = otpCode.length >= 6 && !isLoading
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = Background,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.5.dp
                        )
                    } else {
                        Text(
                            text = "Verify & Proceed",
                            color = Background,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
            }
        }
    }
}

// 5. SET PIN SCREEN
@Composable
fun SetPinScreen(
    isLoading: Boolean = false,
    errorMessage: String? = null,
    onPinSet: (pin: String) -> Unit
) {
    var pin by remember { mutableStateOf("") }
    var confirmPin by remember { mutableStateOf("") }
    var isConfirmStep by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = Background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = if (isConfirmStep) "Confirm your PIN" else "Set 4-Digit PIN",
                    color = TextPrimary,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (isConfirmStep) "Re-enter your PIN to verify correctly" else "Create a transaction authorization PIN",
                    color = TextSecondary,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(48.dp))

                // Dots View
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 48.dp)
                ) {
                    val currentLength = if (isConfirmStep) confirmPin.length else pin.length
                    repeat(4) { idx ->
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .clip(CircleShape)
                                .background(if (idx < currentLength) PrimaryTeal else Border)
                        )
                    }
                }
            }

            Column(modifier = Modifier.fillMaxWidth()) {
                if (!errorMessage.isNullOrBlank()) {
                    Text(
                        text = errorMessage,
                        color = Danger,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                if (isLoading) {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryTeal, modifier = Modifier.size(36.dp))
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                } else {
                    PinKeypad(
                        onChar = { char ->
                            if (!isConfirmStep) {
                                if (pin.length < 4) {
                                    pin += char
                                    if (pin.length == 4) {
                                        isConfirmStep = true
                                    }
                                }
                            } else {
                                if (confirmPin.length < 4) {
                                    confirmPin += char
                                    if (confirmPin.length == 4) {
                                        if (pin == confirmPin) {
                                            onPinSet(pin)
                                        } else {
                                            // Reset confirm pin
                                            confirmPin = ""
                                        }
                                    }
                                }
                            }
                        },
                        onDelete = {
                            if (!isConfirmStep) {
                                if (pin.isNotEmpty()) pin = pin.dropLast(1)
                            } else {
                                if (confirmPin.isNotEmpty()) {
                                    confirmPin = confirmPin.dropLast(1)
                                } else {
                                    isConfirmStep = false
                                }
                            }
                        }
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}
