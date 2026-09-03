package com.example.cranium.constitution

data class ConstitutionalConstraint(
    val code: String,
    val rule: String,
    val isImmutable: Boolean = true
)
