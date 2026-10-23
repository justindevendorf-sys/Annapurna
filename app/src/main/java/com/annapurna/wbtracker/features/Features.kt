package com.annapurna.wbtracker.features

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.ThumbUp

/**
 * Every tool the app knows about. To turn a planned tool on, set its `webPath`
 * to the matching page on the site (e.g. "/team/licensing").
 */
object Features {
    val prospects = Feature(
        id = "prospects",
        title = "Prospect Tracker",
        description = "View, update, and add prospects.",
        group = FeatureGroup.PROSPECTING,
        icon = Icons.Filled.Person,
        webPath = "/team/prospect-tracker",
    )

    /** The whole site, used as a fallback for tools not yet built into the app. */
    val website = Feature(
        id = "website",
        title = "Wealth Builder",
        description = "The full Wealth Builder site.",
        group = FeatureGroup.PROSPECTING,
        icon = Icons.Filled.Home,
        webPath = "/",
    )

    val all: List<Feature> = listOf(
        prospects,
        Feature(
            id = "training-calendar",
            title = "Training Calendar",
            description = "Upcoming trainings for the team.",
            group = FeatureGroup.CALENDARS,
            icon = Icons.Filled.DateRange,
        ),
        Feature(
            id = "personal-calendar",
            title = "Personal Calendar",
            description = "Your own appointments and follow-ups.",
            group = FeatureGroup.CALENDARS,
            icon = Icons.Filled.AccountCircle,
        ),
        Feature(
            id = "bpm-check-in",
            title = "BPM Check-in",
            description = "Check in guests and associates at a BPM.",
            group = FeatureGroup.BPM,
            icon = Icons.Filled.CheckCircle,
        ),
        Feature(
            id = "bpm-invites",
            title = "BPM Invites",
            description = "Invite guests and associates to a BPM.",
            group = FeatureGroup.BPM,
            icon = Icons.Filled.Email,
        ),
        Feature(
            id = "bpm-scheduling",
            title = "BPM Scheduling",
            description = "Schedule upcoming BPMs.",
            group = FeatureGroup.BPM,
            icon = Icons.Filled.Call,
        ),
        Feature(
            id = "event-check-in",
            title = "Event Check-in",
            description = "Check in to events.",
            group = FeatureGroup.EVENTS,
            icon = Icons.Filled.LocationOn,
        ),
        Feature(
            id = "event-purchases",
            title = "Event Purchases",
            description = "Track event ticket purchases.",
            group = FeatureGroup.EVENTS,
            icon = Icons.Filled.ShoppingCart,
        ),
        Feature(
            id = "convention-tracking",
            title = "Convention Tracking",
            description = "Track convention registrations and attendance.",
            group = FeatureGroup.EVENTS,
            icon = Icons.Filled.Star,
        ),
        Feature(
            id = "licensing-tracker",
            title = "Licensing Tracker",
            description = "Follow each associate's licensing progress.",
            group = FeatureGroup.TRACKERS,
            icon = Icons.Filled.Build,
        ),
        Feature(
            id = "mission-tracker",
            title = "Mission Tracker",
            description = "Track progress toward mission goals.",
            group = FeatureGroup.TRACKERS,
            icon = Icons.Filled.Favorite,
        ),
        Feature(
            id = "production-tracker",
            title = "Production Tracker",
            description = "Track personal and team production.",
            group = FeatureGroup.TRACKERS,
            icon = Icons.Filled.ThumbUp,
        ),
    )

    fun byId(id: String): Feature? = (all + website).firstOrNull { it.id == id }
}
