package com.example.cranium.replay

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class ReplayGuardTest {
    @Test
    fun `test replay attack detection`() {
        val guard = InMemoryReplayGuard()
        val hash = "sha256:req-abc"
        val nonce = 42L
        val ts = System.currentTimeMillis()

        val first = guard.checkAndRecord(hash, nonce, ts)
        assertEquals(ReplayStatus.ACCEPTED_NEW, first)

        // Attempt replay
        val second = guard.checkAndRecord(hash, nonce, ts)
        assertEquals(ReplayStatus.REJECTED_DUPLICATE_NONCE, second)
    }
}
