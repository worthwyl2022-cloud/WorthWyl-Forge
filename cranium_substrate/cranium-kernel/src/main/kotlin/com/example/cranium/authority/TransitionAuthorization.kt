package com.example.cranium.authority

data class TransitionAuthorization(
    val requestId: String,
    val decision: TransitionDecision,
    val proofHash: String,
    val verifiedAt: Long = System.currentTimeMillis()
)
