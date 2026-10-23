package com.annapurna.wbtracker.ui

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.annapurna.wbtracker.features.Feature
import com.annapurna.wbtracker.features.Features
import com.annapurna.wbtracker.web.WebSessions
import com.annapurna.wbtracker.web.rememberFileChooserHost

private object Routes {
    const val PROSPECTS = "prospects"
    const val WEBSITE = "website"
    const val TOOLS = "tools"
    const val FEATURE = "feature/{id}"
    fun feature(id: String) = "feature/$id"
}

private data class Tab(val route: String, val label: String, val icon: ImageVector)

private val tabs = listOf(
    Tab(Routes.PROSPECTS, "Prospects", Icons.Filled.Person),
    Tab(Routes.TOOLS, "Tools", Icons.AutoMirrored.Filled.List),
    Tab(Routes.WEBSITE, "Website", Icons.Filled.Home),
)

@Composable
fun WbApp() {
    val context = LocalContext.current
    val fileChooser = rememberFileChooserHost()
    val sessions = remember { WebSessions(context, fileChooser) }
    DisposableEffect(sessions) {
        onDispose { sessions.destroyAll() }
    }

    val nav = rememberNavController()
    val backStackEntry by nav.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    Scaffold(
        // Each screen draws its own top bar, so only the bottom bar is laid out here.
        contentWindowInsets = WindowInsets(0),
        bottomBar = {
            if (tabs.any { it.route == currentRoute }) {
                NavigationBar {
                    tabs.forEach { tab ->
                        NavigationBarItem(
                            selected = currentRoute == tab.route,
                            onClick = { nav.switchTab(tab.route) },
                            icon = { Icon(tab.icon, contentDescription = null) },
                            label = { Text(tab.label) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = Routes.PROSPECTS,
            modifier = Modifier
                .padding(padding)
                .consumeWindowInsets(padding),
        ) {
            composable(Routes.PROSPECTS) {
                WebFeatureScreen(
                    title = Features.prospects.title,
                    page = sessions.pageFor(Features.prospects),
                    onSignOut = sessions::signOut,
                )
            }
            composable(Routes.WEBSITE) {
                WebFeatureScreen(
                    title = Features.website.title,
                    page = sessions.pageFor(Features.website),
                    onSignOut = sessions::signOut,
                )
            }
            composable(Routes.TOOLS) {
                ToolsScreen(
                    features = Features.all,
                    onOpen = { feature -> nav.openFeature(feature) },
                )
            }
            composable(Routes.FEATURE) { entry ->
                val feature = entry.arguments?.getString("id")?.let(Features::byId)
                    ?: return@composable
                if (feature.isAvailable) {
                    WebFeatureScreen(
                        title = feature.title,
                        page = sessions.pageFor(feature),
                        onSignOut = sessions::signOut,
                        onBack = { nav.popBackStack() },
                    )
                } else {
                    ComingSoonScreen(
                        feature = feature,
                        onOpenWebsite = { nav.switchTab(Routes.WEBSITE) },
                        onBack = { nav.popBackStack() },
                    )
                }
            }
        }
    }
}

private fun NavHostController.switchTab(route: String) {
    navigate(route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}

private fun NavHostController.openFeature(feature: Feature) {
    if (feature.id == Features.prospects.id) {
        switchTab(Routes.PROSPECTS)
    } else {
        navigate(Routes.feature(feature.id))
    }
}
