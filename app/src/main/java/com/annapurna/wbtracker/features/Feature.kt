package com.annapurna.wbtracker.features

import androidx.compose.ui.graphics.vector.ImageVector
import com.annapurna.wbtracker.AppConfig

enum class FeatureGroup(val title: String) {
    PROSPECTING("Prospecting"),
    CALENDARS("Calendars"),
    BPM("BPM"),
    EVENTS("Events"),
    TRACKERS("Trackers"),
}

/**
 * A tool in the app. A feature with a [webPath] opens that page of the Wealth Builder
 * site in-app; one without is listed as planned until its page or screen is wired up.
 */
data class Feature(
    val id: String,
    val title: String,
    val description: String,
    val group: FeatureGroup,
    val icon: ImageVector,
    val webPath: String? = null,
) {
    val isAvailable: Boolean get() = webPath != null
    val url: String? get() = webPath?.let { AppConfig.BASE_URL + it }
}
