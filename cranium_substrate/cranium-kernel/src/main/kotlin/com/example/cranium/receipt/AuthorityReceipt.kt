package com.example.cranium.receipt

data class AuthorityReceipt(
    val receiptId: String,
    val transitionRequestId: String,
    val preStateHash: String,
    val postStateHash: String,
    val proofDigest: String,
    val timestamp: Long = System.currentTimeMillis()
)
