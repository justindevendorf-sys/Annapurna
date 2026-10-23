package com.annapurna.wbtracker

import com.annapurna.wbtracker.features.Features
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FeaturesTest {
    @Test
    fun featureIdsAreUnique() {
        val ids = (Features.all + Features.website).map { it.id }
        assertEquals(ids.size, ids.toSet().size)
    }

    @Test
    fun prospectTrackerOpensTheTrackerPage() {
        assertEquals(
            "https://app.iamawealthbuilder.com/team/prospect-tracker",
            Features.prospects.url,
        )
    }

    @Test
    fun webPathsAreSitePaths() {
        (Features.all + Features.website).mapNotNull { it.webPath }.forEach {
            assertTrue("$it should start with /", it.startsWith("/"))
        }
    }
}
