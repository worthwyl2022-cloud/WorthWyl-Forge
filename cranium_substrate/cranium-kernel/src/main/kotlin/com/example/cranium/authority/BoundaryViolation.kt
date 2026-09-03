package com.example.cranium.authority

data class BoundaryViolation(
    val violationCode: String,
    val description: String,
    val severity: Int
)
