package com.example.cranium.authority

interface AuthorizationVerifier {
    fun verify(request: AuthorityTransitionRequest): AuthorizationVerificationResult
}
