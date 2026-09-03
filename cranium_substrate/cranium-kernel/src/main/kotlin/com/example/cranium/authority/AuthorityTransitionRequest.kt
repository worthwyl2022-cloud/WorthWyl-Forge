package com.example.cranium.authority

data class AuthorityTransitionRequest(
    val requestId: String,
    val fromLevel: AuthorityLevel,
    val toLevel: AuthorityLevel,
    val source: AuthoritySource,
    val scope: AuthorizationScope,
    val evidence: List<EvidenceRef>,
    val nonce: Long,
    val timestamp: Long = System.currentTimeMillis()
)
