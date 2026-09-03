package com.example.cranium.replay

import java.util.concurrent.ConcurrentHashMap

class InMemoryReplayGuard(
    private val maxTimeDriftMs: Long = 60_000
) : ReplayGuard {
    private val seenHashes = ConcurrentHashMap.newKeySet<String>()
    private val seenNonces = ConcurrentHashMap.newKeySet<Long>()

    override fun checkAndRecord(requestHash: String, nonce: Long, timestamp: Long): ReplayStatus {
        val now = System.currentTimeMillis()
        if (Math.abs(now - timestamp) > maxTimeDriftMs) {
            return ReplayStatus.REJECTED_STALE_TIMESTAMP
        }
        if (seenNonces.contains(nonce)) {
            return ReplayStatus.REJECTED_DUPLICATE_NONCE
        }
        if (!seenHashes.add(requestHash)) {
            return ReplayStatus.REJECTED_HASH_COLLISION
        }
        seenNonces.add(nonce)
        return ReplayStatus.ACCEPTED_NEW
    }
}
