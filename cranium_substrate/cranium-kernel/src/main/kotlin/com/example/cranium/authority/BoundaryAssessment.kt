package com.example.cranium.authority

data class BoundaryAssessment(
    val isWithinBounds: Boolean,
    val violations: List<BoundaryViolation> = emptyList()
)
