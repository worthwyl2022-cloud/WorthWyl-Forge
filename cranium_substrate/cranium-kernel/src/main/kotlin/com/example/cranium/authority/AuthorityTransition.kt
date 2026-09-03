package com.example.cranium.authority

data class AuthorityTransition(
    val id: String,
    val request: AuthorityTransitionRequest,
    val decision: TransitionDecision,
    val stateDigest: String
)
