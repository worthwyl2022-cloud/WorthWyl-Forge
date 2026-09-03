package com.example.cranium.security

import com.example.cranium.replay.InMemoryReplayGuard
import com.example.cranium.replay.ReplayStatus
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class StaleStateAttackTest {
    @Test
    fun `test stale timestamp rejection`() {
        val guard = InMemoryReplayGuard(maxTimeDriftMs = 5000)
        val hash = "sha256:stale-attack"
        val oldTs = System.currentTimeMillis() - 100_000 // 100s ago

        val res = guard.checkAndRecord(hash, 999L, oldTs)
        assertEquals(ReplayStatus.REJECTED_STALE_TIMESTAMP, res)
    }
}
