package com.example.cranium.cognition

data class Provenance(
    val source: String,
    val sourceId: String,
    val timestamp: Long = System.currentTimeMillis(),
    val parentAtomIds: List<String> = emptyList()
)
