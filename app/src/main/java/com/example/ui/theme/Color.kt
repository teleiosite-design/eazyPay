package com.example.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

data class EazyPayColors(
    val background: Color,
    val surface: Color,
    val border: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val primaryTeal: Color = Color(0xFF00C9A7),
    val success: Color = Color(0xFF22C55E),
    val danger: Color = Color(0xFFEF4444),
    val warning: Color = Color(0xFFF59E0B)
)

val LocalEazyPayColors = staticCompositionLocalOf {
    // Default dark theme colors
    EazyPayColors(
        background = Color(0xFF0D1117),
        surface = Color(0xFF161D2A),
        border = Color(0xFF1E2D40),
        textPrimary = Color(0xFFF0F6FC),
        textSecondary = Color(0xFF8B9BB4),
        textMuted = Color(0xFF4A5568)
    )
}

val Background: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalEazyPayColors.current.background

val Surface: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalEazyPayColors.current.surface

val Border: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalEazyPayColors.current.border

val TextPrimary: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalEazyPayColors.current.textPrimary

val TextSecondary: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalEazyPayColors.current.textSecondary

val TextMuted: Color
    @Composable
    @ReadOnlyComposable
    get() = LocalEazyPayColors.current.textMuted

// Theme accents remain static to preserve EazyPay brand identity
val PrimaryTeal = Color(0xFF00C9A7)
val Success = Color(0xFF22C55E)
val Danger = Color(0xFFEF4444)
val Warning = Color(0xFFF59E0B)
