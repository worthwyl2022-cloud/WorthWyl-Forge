package com.example.cranium.canon

data class CanonHash(
    val entityId: String,
    val sha256Digest: String,
    val version: Int
)
