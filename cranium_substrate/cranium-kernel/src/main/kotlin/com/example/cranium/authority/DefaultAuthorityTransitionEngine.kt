package com.example.cranium.authority

class DefaultAuthorityTransitionEngine(
    private val ruleEvaluator: AuthorityRuleEvaluator = DefaultAuthorityRuleEvaluator()
) : AuthorityTransitionEngine {
    override fun processTransition(request: AuthorityTransitionRequest): AuthorityTransition {
        val decision = ruleEvaluator.evaluate(request)
        return AuthorityTransition(
            id = "tx-${System.currentTimeMillis()}-${request.nonce}",
            request = request,
            decision = decision,
            stateDigest = "sha256:${request.requestId.hashCode() xor request.nonce.hashCode()}"
        )
    }
}
