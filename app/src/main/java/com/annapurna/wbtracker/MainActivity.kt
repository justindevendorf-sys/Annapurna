package com.annapurna.wbtracker

import android.os.Bundle
import android.webkit.CookieManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.annapurna.wbtracker.ui.WbApp
import com.annapurna.wbtracker.ui.theme.WbTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            WbTheme {
                WbApp()
            }
        }
    }

    override fun onPause() {
        super.onPause()
        // Persist the sign-in cookie so the next launch skips the login page.
        CookieManager.getInstance().flush()
    }
}
