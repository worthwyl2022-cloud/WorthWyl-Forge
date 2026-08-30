package com.example.core.substrate

import java.time.Instant
import java.util.UUID

/**
 * Fundamental epistemic unit in the Cranium Substrate.
 * Encapsulates a semantic proposition, confidence score, source provenance,
 * decay kinetics, and dimensional embeddings.
 */
data class CognitiveAtom(
    val id: String = UUID.randomUUID().toString(),
    val proposition: String,
    val lane: CanonLane = CanonLane.GENERAL,
    val confidence: Double = 1.0,
    val valence: Double = 0.0,
    val timestamp: Instant = Instant.now(),
    val provenance: Provenance = Provenance.OBSERVATION,
    val entropyScore: Double = 0.0,
    val tags: Set<String> = emptySet(),
    val embedding: FloatArray = FloatArray(0),
    val metadata: Map<String, String> = emptyMap()
) {
    enum class Provenance {
        AXIOMATIC,      // Ground truth / Immutable policy
        DELIBERATION,   // Derived via multi-step cognitive consensus
        OBSERVATION,    // User or environmental prompt stream
        INFERENCE,      // Model generated deduction
        RETRIEVED       // Vector store / external index
    }

    /**
     * Compute temporal decay according to half-life lambda.
     */
    fun decayedConfidence(halfLifeSeconds: Double = 3600.0): Double {
        if (provenance == Provenance.AXIOMATIC) return 1.0
        val elapsedSeconds = (Instant.now().toEpochMilli() - timestamp.toEpochMilli()) / 1000.0
        val decay = Math.pow(0.5, elapsedSeconds / halfLifeSeconds)
        return (confidence * decay).coerceIn(0.0, 1.0)
    }

    fun isContradictoryTo(other: CognitiveAtom, threshold: Double = 0.85): Boolean {
        // Direct negation check
        val normalizedA = proposition.trim().lowercase()
        val normalizedB = other.proposition.trim().lowercase()
        if (normalizedA == "not ($normalizedB)" || normalizedB == "not ($normalizedA)") return true
        if (normalizedA.startsWith("no ") && normalizedB.startsWith("yes ")) return true
        return false
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as CognitiveAtom
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()
}
