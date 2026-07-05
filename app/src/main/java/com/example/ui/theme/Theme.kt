package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color

@Composable
fun MyApplicationTheme(
  themeMode: String = "system",
  content: @Composable () -> Unit,
) {
  val systemIsDark = isSystemInDarkTheme()
  val useDarkUI = when (themeMode) {
      "light" -> false
      "dark" -> true
      else -> systemIsDark
  }

  // Smart decoupling: background ALWAYS follows system theme setting
  val activeBackground = if (systemIsDark) Color(0xFF0D1117) else Color(0xFFF4F6F9)

  // Other components (cards, text, borders) follow app theme preference
  val activeColors = if (useDarkUI) {
      EazyPayColors(
          background = activeBackground,
          surface = Color(0xFF161D2A),
          border = Color(0xFF1E2D40),
          textPrimary = Color(0xFFF0F6FC),
          textSecondary = Color(0xFF8B9BB4),
          textMuted = Color(0xFF4A5568)
      )
  } else {
      EazyPayColors(
          background = activeBackground,
          surface = Color(0xFFFFFFFF),
          border = Color(0xFFE2E8F0),
          textPrimary = Color(0xFF0F172A),
          textSecondary = Color(0xFF475569),
          textMuted = Color(0xFF94A3B8)
      )
  }

  val colorScheme = if (useDarkUI) {
      darkColorScheme(
          primary = PrimaryTeal,
          onPrimary = activeBackground,
          secondary = PrimaryTeal,
          onSecondary = activeColors.textPrimary,
          background = activeBackground,
          onBackground = activeColors.textPrimary,
          surface = activeColors.surface,
          onSurface = activeColors.textPrimary,
          surfaceVariant = activeColors.border,
          onSurfaceVariant = activeColors.textSecondary,
          outline = activeColors.border,
          error = Danger
      )
  } else {
      lightColorScheme(
          primary = PrimaryTeal,
          onPrimary = activeBackground,
          secondary = PrimaryTeal,
          onSecondary = activeColors.textPrimary,
          background = activeBackground,
          onBackground = activeColors.textPrimary,
          surface = activeColors.surface,
          onSurface = activeColors.textPrimary,
          surfaceVariant = activeColors.border,
          onSurfaceVariant = activeColors.textSecondary,
          outline = activeColors.border,
          error = Danger
      )
  }

  CompositionLocalProvider(LocalEazyPayColors provides activeColors) {
      MaterialTheme(
          colorScheme = colorScheme,
          typography = Typography,
          content = content
      )
  }
}
