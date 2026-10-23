package com.annapurna.wbtracker.ui

import android.net.Uri
import android.view.ViewGroup
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.annapurna.wbtracker.web.WebPageState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WebFeatureScreen(
    title: String,
    page: WebPageState,
    onSignOut: () -> Unit,
    onBack: (() -> Unit)? = null,
) {
    // System back walks back through the site's pages before leaving the screen.
    BackHandler(enabled = page.canGoBack) { page.goBack() }

    var menuOpen by remember { mutableStateOf(false) }
    var confirmSignOut by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                navigationIcon = {
                    if (onBack != null) {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                },
                actions = {
                    IconButton(onClick = page::reload) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
                    }
                    Box {
                        IconButton(onClick = { menuOpen = true }) {
                            Icon(Icons.Filled.MoreVert, contentDescription = "More options")
                        }
                        DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                            DropdownMenuItem(
                                text = { Text("Back to start") },
                                onClick = {
                                    menuOpen = false
                                    page.goHome()
                                },
                            )
                            DropdownMenuItem(
                                text = { Text("Open in browser") },
                                onClick = {
                                    menuOpen = false
                                    page.openExternally(Uri.parse(page.currentUrl))
                                },
                            )
                            DropdownMenuItem(
                                text = { Text("Sign out") },
                                onClick = {
                                    menuOpen = false
                                    confirmSignOut = true
                                },
                            )
                        }
                    }
                },
            )
        },
    ) { inner ->
        Box(
            Modifier
                .fillMaxSize()
                .padding(inner)
                .consumeWindowInsets(inner)
                .imePadding(),
        ) {
            AndroidView(
                factory = {
                    // The WebView outlives this screen; detach it from wherever it was last shown.
                    page.webView.also { (it.parent as? ViewGroup)?.removeView(it) }
                },
                modifier = Modifier.fillMaxSize(),
            )
            if (page.isLoading) {
                LinearProgressIndicator(
                    progress = { page.progress / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter),
                )
            }
            page.errorMessage?.let { message ->
                LoadError(message = message, onRetry = page::reload)
            }
        }
    }

    if (confirmSignOut) {
        AlertDialog(
            onDismissRequest = { confirmSignOut = false },
            title = { Text("Sign out?") },
            text = { Text("You'll need to sign in to Wealth Builder again.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        confirmSignOut = false
                        onSignOut()
                    },
                ) { Text("Sign out") }
            },
            dismissButton = {
                TextButton(onClick = { confirmSignOut = false }) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun LoadError(message: String, onRetry: () -> Unit) {
    Surface(Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.padding(32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("Can't reach Wealth Builder", style = MaterialTheme.typography.titleLarge)
            Text(
                "Check your connection and try again.\n($message)",
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
            )
            Button(onClick = onRetry) { Text("Try again") }
        }
    }
}
