package com.annapurna.wbtracker.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.annapurna.wbtracker.features.Feature

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ToolsScreen(features: List<Feature>, onOpen: (Feature) -> Unit) {
    Scaffold(topBar = { TopAppBar(title = { Text("Tools") }) }) { inner ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier
                .fillMaxSize()
                .padding(inner),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            features.groupBy { it.group }.forEach { (group, groupFeatures) ->
                item(key = group.name, span = { GridItemSpan(maxLineSpan) }) {
                    Text(
                        group.title,
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(top = 8.dp),
                    )
                }
                items(groupFeatures, key = { it.id }) { feature ->
                    FeatureTile(feature = feature, onClick = { onOpen(feature) })
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FeatureTile(feature: Feature, onClick: () -> Unit) {
    val colors = if (feature.isAvailable) {
        CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
            contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
        )
    } else {
        CardDefaults.cardColors()
    }
    Card(
        onClick = onClick,
        colors = colors,
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 112.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Icon(feature.icon, contentDescription = null)
            Text(feature.title, style = MaterialTheme.typography.titleSmall)
            if (!feature.isAvailable) {
                Text(
                    "Coming soon",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
