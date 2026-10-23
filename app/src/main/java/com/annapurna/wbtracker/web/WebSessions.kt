package com.annapurna.wbtracker.web

import android.content.Context
import android.webkit.CookieManager
import android.webkit.WebStorage
import com.annapurna.wbtracker.features.Feature

/** Owns one [WebPageState] per web-backed feature for the lifetime of the activity. */
class WebSessions(
    private val context: Context,
    private val fileChooser: FileChooserHost,
) {
    private val pages = mutableMapOf<String, WebPageState>()

    fun pageFor(feature: Feature): WebPageState {
        val url = requireNotNull(feature.url) { "${feature.id} has no web page" }
        return pages.getOrPut(feature.id) { WebPageState(context, url, fileChooser) }
    }

    /** Clears the site's cookies and storage, then sends every open page back to its start. */
    fun signOut() {
        CookieManager.getInstance().removeAllCookies(null)
        CookieManager.getInstance().flush()
        WebStorage.getInstance().deleteAllData()
        pages.values.forEach { page ->
            page.webView.clearCache(true)
            page.webView.clearHistory()
            page.goHome()
        }
    }

    fun destroyAll() {
        pages.values.forEach { it.destroy() }
        pages.clear()
    }
}
