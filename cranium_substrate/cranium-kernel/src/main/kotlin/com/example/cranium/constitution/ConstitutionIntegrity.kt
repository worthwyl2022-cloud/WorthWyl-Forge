package com.example.cranium.constitution

data class ConstitutionIntegrity(
    val rootHash: String,
    val principleCount: Int,
    val isIntact: Boolean
)
