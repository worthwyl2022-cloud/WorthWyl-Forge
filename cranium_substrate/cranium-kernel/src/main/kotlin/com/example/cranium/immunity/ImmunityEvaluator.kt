package com.example.cranium.immunity

import com.example.cranium.cognition.CognitiveAtom

interface ImmunityEvaluator {
    fun assess(atom: CognitiveAtom, canonPremises: List<String>): ThreatAssessment
}
