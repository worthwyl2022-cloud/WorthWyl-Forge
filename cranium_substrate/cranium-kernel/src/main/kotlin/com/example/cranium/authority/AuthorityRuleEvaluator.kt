package com.example.cranium.authority

interface AuthorityRuleEvaluator {
    fun evaluate(request: AuthorityTransitionRequest): TransitionDecision
}
