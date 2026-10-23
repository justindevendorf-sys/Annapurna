package com.annapurna.wbtracker.web

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

/**
 * One long-lived WebView plus the bits of its state the UI shows. Kept outside of any
 * single screen so switching tabs doesn't reload the page or lose unsaved form input.
 */
@Stable
class WebPageState(
    private val context: Context,
    val startUrl: String,
    fileChooser: FileChooserHost,
) {
    var progress by mutableIntStateOf(0)
        private set
    var isLoading by mutableStateOf(true)
        private set
    var canGoBack by mutableStateOf(false)
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set

    @SuppressLint("SetJavaScriptEnabled")
    val webView: WebView = WebView(context).apply {
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = true
            displayZoomControls = false
            allowFileAccess = false
            allowContentAccess = false
            setSupportMultipleWindows(false)
        }
        val cookies = CookieManager.getInstance()
        cookies.setAcceptCookie(true)
        cookies.setAcceptThirdPartyCookies(this, true)
        webViewClient = PageClient()
        webChromeClient = ChromeClient(fileChooser)
        setDownloadListener { url, _, _, _, _ -> openExternally(Uri.parse(url)) }
        loadUrl(startUrl)
    }

    val currentUrl: String get() = webView.url ?: startUrl

    fun reload() {
        errorMessage = null
        if (webView.url == null) webView.loadUrl(startUrl) else webView.reload()
    }

    fun goHome() {
        errorMessage = null
        webView.loadUrl(startUrl)
    }

    fun goBack() {
        errorMessage = null
        webView.goBack()
    }

    fun destroy() {
        webView.stopLoading()
        webView.destroy()
    }

    fun openExternally(uri: Uri) {
        try {
            context.startActivity(
                Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, "No app can open this link", Toast.LENGTH_SHORT).show()
        }
    }

    private inner class PageClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val uri = request.url
            return when (uri.scheme?.lowercase()) {
                // Web pages (including any sign-in redirects) stay in the app.
                "http", "https" -> false
                // tel:, mailto:, sms:, etc. go to the phone's dialer, email, or messages app.
                else -> {
                    openExternally(uri)
                    true
                }
            }
        }

        override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
            isLoading = true
        }

        override fun onPageFinished(view: WebView, url: String?) {
            isLoading = false
            CookieManager.getInstance().flush()
        }

        override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
            canGoBack = view.canGoBack()
        }

        override fun onReceivedError(
            view: WebView,
            request: WebResourceRequest,
            error: WebResourceError,
        ) {
            if (request.isForMainFrame) {
                errorMessage = error.description?.toString() ?: "The page couldn't be loaded."
            }
        }
    }

    private inner class ChromeClient(private val fileChooser: FileChooserHost) : WebChromeClient() {
        override fun onProgressChanged(view: WebView, newProgress: Int) {
            progress = newProgress
        }

        override fun onShowFileChooser(
            webView: WebView,
            filePathCallback: ValueCallback<Array<Uri>>,
            fileChooserParams: FileChooserParams,
        ): Boolean = fileChooser.show(filePathCallback, fileChooserParams)
    }
}
