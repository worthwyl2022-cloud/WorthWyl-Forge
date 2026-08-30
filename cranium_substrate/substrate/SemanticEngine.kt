package com.example.core.substrate

import kotlin.math.sqrt

/**
 * Semantic Engine handles vector embeddings, lexical negation mapping,
 * and high-dimensional cosine similarity calculations.
 */
class SemanticEngine {

    fun cosineSimilarity(vA: FloatArray, vB: FloatArray): Double {
        if (vA.isEmpty() || vB.isEmpty() || vA.size != vB.size) return 0.0
        var dot = 0.0
        var normA = 0.0
        var normB = 0.0
        for (i in vA.indices) {
            dot += vA[i] * vB[i]
            normA += vA[i] * vA[i]
            normB += vB[i] * vB[i]
        }
        if (normA == 0.0 || normB == 0.0) return 0.0
        return dot / (sqrt(normA) * sqrt(normB))
    }

    /**
     * Estimates contradiction score through negation heuristics and semantic contrast.
     */
    fun calculateContradictionScore(textA: String, textB: String): Double {
        val normA = textA.lowercase().trim()
        val normB = textB.lowercase().trim()

        val antonymPairs = listOf(
            "enable" to "disable",
            "allow" to "prohibit",
            "permit" to "deny",
            "true" to "false",
            "success" to "failure",
            "high" to "low",
            "online" to "offline",
            "secure" to "vulnerable"
        )

        for ((p1, p2) in antonymPairs) {
            if ((normA.contains(p1) && normB.contains(p2)) || (normA.contains(p2) && normB.contains(p1))) {
                return 0.95
            }
        }

        if (normA.contains("not ") && !normB.contains("not ") && normA.replace("not ", "") in normB) {
            return 0.92
        }
        if (normB.contains("not ") && !normA.contains("not ") && normB.replace("not ", "") in normA) {
            return 0.92
        }

        return 0.12
    }
}
