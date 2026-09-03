package com.example.cranium.authority

data class AuthorizationVerificationResult(
    val isValid: Boolean,
    val reason: String? = null
)
