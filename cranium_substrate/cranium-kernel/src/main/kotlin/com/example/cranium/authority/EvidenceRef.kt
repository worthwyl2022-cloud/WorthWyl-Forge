package com.example.cranium.authority

data class EvidenceRef(
    val id: String,
    val source: String,
    val sha256Digest: String,
    val timestamp: Long = System.currentTimeMillis()
)
