package com.example.cranium.authority

class DefaultAuthorizationVerifier : AuthorizationVerifier {
    override fun verify(request: AuthorityTransitionRequest): AuthorizationVerificationResult {
        if (request.toLevel.rank > request.fromLevel.rank && request.evidence.isEmpty()) {
            return AuthorizationVerificationResult(false, "Elevation requires at least one verified evidence reference")
        }
        return AuthorizationVerificationResult(true)
    }
}
