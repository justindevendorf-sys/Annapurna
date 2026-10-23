package com.annapurna.wbtracker.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val Navy = Color(0xFF1B3A6B)
private val NavyLight = Color(0xFFA9C7FF)
private val Gold = Color(0xFF8A6D00)
private val GoldLight = Color(0xFFE0B83C)

private val LightColors = lightColorScheme(
    primary = Navy,
    secondary = Gold,
)

private val DarkColors = darkColorScheme(
    primary = NavyLight,
    secondary = GoldLight,
)

@Composable
fun WbTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colors = when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColors
        else -> LightColors
    }
    MaterialTheme(colorScheme = colors, content = content)
}
