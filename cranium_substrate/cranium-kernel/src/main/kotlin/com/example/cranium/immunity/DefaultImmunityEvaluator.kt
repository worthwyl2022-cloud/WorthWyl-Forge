package com.example.cranium.immunity

import com.example.cranium.cognition.CognitiveAtom

class DefaultImmunityEvaluator : ImmunityEvaluator {
    override fun assess(atom: CognitiveAtom, canonPremises: List<String>): ThreatAssessment {
        val lowerText = atom.statement.lowercase()
        for (premise in canonPremises) {
            val pLower = premise.lowercase()
            if ((pLower.contains("cannot") && lowerText.contains("can")) ||
                (pLower.contains("never") && lowerText.contains("always")) ||
                (pLower.contains("always") && lowerText.contains("never"))) {
                return ThreatAssessment(
                    level = ThreatLevel.CANON_VIOLATION_CRITICAL,
                    threatClass = ThreatClass.POLARITY_INVERSION,
                    explanation = "Direct polarity contradiction with canon premise: "$premise"",
                    quarantined = true
                )
            }
        }
        return ThreatAssessment(ThreatLevel.NOMINAL, null, "Signal passes immunity evaluation", false)
    }
}
