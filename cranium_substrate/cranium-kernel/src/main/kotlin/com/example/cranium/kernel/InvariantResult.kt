package com.example.cranium.kernel

data class InvariantResult(
    val invariantName: String,
    val isSatisfied: Boolean,
    val details: String? = null
)
