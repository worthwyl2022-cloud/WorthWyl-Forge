package com.example.cranium.immunity

data class ThreatAssessment(
    val level: ThreatLevel,
    val threatClass: ThreatClass?,
    val explanation: String,
    val quarantined: Boolean
)
