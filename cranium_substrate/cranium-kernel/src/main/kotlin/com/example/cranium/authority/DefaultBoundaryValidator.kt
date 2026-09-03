package com.example.cranium.authority

class DefaultBoundaryValidator : BoundaryValidator {
    override fun validateBoundary(request: AuthorityTransitionRequest): BoundaryAssessment {
        val violations = mutableListOf<BoundaryViolation>()
        if (request.toLevel.rank > request.fromLevel.rank + 1 && request.source != AuthoritySource.USER_DIRECTIVE) {
            violations.add(BoundaryViolation("ESCALATION_SPIKE", "Non-directive source cannot elevate more than 1 authority tier", 3))
        }
        if (request.toLevel == AuthorityLevel.SYSTEM_CORE && request.source != AuthoritySource.CONSTITUTIONAL_AXIOM) {
            violations.add(BoundaryViolation("CORE_PROTECTION", "System core rank is immutable to runtime transition", 4))
        }
        return BoundaryAssessment(violations.isEmpty(), violations)
    }
}
