package com.annapurna.wbtracker.web

import android.content.ActivityNotFoundException
import android.net.Uri
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

/** Lets a web page's `<input type="file">` open the system file picker. */
fun interface FileChooserHost {
    fun show(
        callback: ValueCallback<Array<Uri>>,
        params: WebChromeClient.FileChooserParams,
    ): Boolean
}

@Composable
fun rememberFileChooserHost(): FileChooserHost {
    val pending = remember { arrayOfNulls<ValueCallback<Array<Uri>>>(1) }
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartActivityForResult(),
    ) { result ->
        pending[0]?.onReceiveValue(
            WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data),
        )
        pending[0] = null
    }
    return remember(launcher) {
        FileChooserHost { callback, params ->
            // The WebView requires every callback to be answered, even a stale one.
            pending[0]?.onReceiveValue(null)
            pending[0] = callback
            try {
                launcher.launch(params.createIntent())
                true
            } catch (e: ActivityNotFoundException) {
                pending[0] = null
                false
            }
        }
    }
}
