package com.example.cranium.replay

interface ReplayGuard {
    fun checkAndRecord(requestHash: String, nonce: Long, timestamp: Long): ReplayStatus
}
