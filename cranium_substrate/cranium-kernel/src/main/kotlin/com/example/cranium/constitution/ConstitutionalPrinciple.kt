package com.example.cranium.constitution

data class ConstitutionalPrinciple(
    val id: String,
    val title: String,
    val description: String,
    val weight: Double = 1.0
)
