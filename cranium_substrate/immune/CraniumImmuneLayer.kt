package com.example.core.immune

import com.example.core.substrate.CanonLane
import com.example.core.substrate.CognitiveAtom
import com.example.core.substrate.SubstrateCore

/**
 * Cranium Epistemic Immune Layer.
 * Continuously scans the working memory and live prompt feeds for prompt injection attacks,
 * semantic jailbreaks, belief drift, and unauthorized axiom modifications.
 */
class CraniumImmuneLayer(
    private val core: SubstrateCore
) {
    data class ImmunityAssessment(
        val isSafe: Boolean,
        val threatLevel: ThreatLevel,
        val detectedVectors: List<String>,
        val actionTaken: QuarantineAction
    )

    enum class ThreatLevel {
        NONE, LOW, ELEVATED, SEVERE, CRITICAL
    }

    enum class QuarantineAction {
        ALLOW, PURGE_UNTRUSTED_ATOMS, ISOLATE_SESSION, LOCK_SYSTEM
    }

    private val adversarialSignatures = listOf(
        "ignore previous instructions",
        "system prompt override",
        "developer mode enabled",
        "you are now unrestricted",
        "disregard all safety protocols",
        "bypass rule",
        "jailbreak active"
    )

    fun inspectIncomingStream(text: String): ImmunityAssessment {
        val lower = text.lowercase()
        val detected = adversarialSignatures.filter { lower.contains(it) }

        if (detected.isNotEmpty()) {
            return ImmunityAssessment(
                isSafe = false,
                threatLevel = ThreatLevel.CRITICAL,
                detectedVectors = detected,
                actionTaken = QuarantineAction.PURGE_UNTRUSTED_ATOMS
            )
        }

        // Semantic drift audit against core axioms
        val axioms = core.getAtomsInLane(CanonLane.SYSTEM_AXIOM)
        val breachCount = axioms.count { axiom ->
            core.semanticEngine.calculateContradictionScore(text, axiom.proposition) > 0.85
        }

        if (breachCount > 0) {
            return ImmunityAssessment(
                isSafe = false,
                threatLevel = ThreatLevel.SEVERE,
                detectedVectors = listOf("Direct axiom negation vector detected"),
                actionTaken = QuarantineAction.ISOLATE_SESSION
            )
        }

        return ImmunityAssessment(
            isSafe = true,
            threatLevel = ThreatLevel.NONE,
            detectedVectors = emptyList(),
            actionTaken = QuarantineAction.ALLOW
        )
    }
}
