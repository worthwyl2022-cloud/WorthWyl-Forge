package com.example.cranium.authority

interface BoundaryValidator {
    fun validateBoundary(request: AuthorityTransitionRequest): BoundaryAssessment
}
