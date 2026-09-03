package com.example.cranium.authority

class DefaultAuthorityRuleEvaluator(
    private val boundaryValidator: BoundaryValidator = DefaultBoundaryValidator(),
    private val verifier: AuthorizationVerifier = DefaultAuthorizationVerifier()
) : AuthorityRuleEvaluator {
    override fun evaluate(request: AuthorityTransitionRequest): TransitionDecision {
        val boundary = boundaryValidator.validateBoundary(request)
        if (!boundary.isWithinBounds) {
            return TransitionDecision.REJECTED_MONOTONICITY_VIOLATION
        }
        val ver = verifier.verify(request)
        if (!ver.isValid) {
            return TransitionDecision.REJECTED_INSUFFICIENT_EVIDENCE
        }
        return TransitionDecision.APPROVED
    }
}
