package com.example.core.substrate

import java.util.concurrent.ConcurrentHashMap
import kotlin.math.exp

/**
 * ResonanceField models associative cognitive activations across active CognitiveAtoms.
 * Mimics spreading activation networks and latent semantic field propagation.
 */
class ResonanceField(
    private val semanticEngine: SemanticEngine = SemanticEngine(),
    private val decayFactor: Double = 0.15,
    private val activationThreshold: Double = 0.40
) {
    private val fieldNodes = ConcurrentHashMap<String, FieldNode>()

    data class FieldNode(
        val atom: CognitiveAtom,
        var activationEnergy: Double = 1.0,
        var lastUpdated: Long = System.currentTimeMillis()
    )

    fun injectAtom(atom: CognitiveAtom, initialEnergy: Double = 1.0) {
        fieldNodes[atom.id] = FieldNode(atom, initialEnergy)
    }

    fun propagateActivation(stimulusVector: FloatArray? = null, steps: Int = 2): List<CognitiveAtom> {
        if (fieldNodes.isEmpty()) return emptyList()

        // 1. Direct stimulus resonance
        if (stimulusVector != null && stimulusVector.isNotEmpty()) {
            fieldNodes.values.forEach { node ->
                if (node.atom.embedding.isNotEmpty()) {
                    val sim = semanticEngine.cosineSimilarity(stimulusVector, node.atom.embedding)
                    node.activationEnergy += (sim * 1.5).coerceAtLeast(0.0)
                }
            }
        }

        // 2. Inter-node associative spreading
        val nodes = fieldNodes.values.toList()
        for (step in 0 until steps) {
            for (i in nodes.indices) {
                for (j in i + 1 until nodes.size) {
                    val nodeA = nodes[i]
                    val nodeB = nodes[j]
                    
                    val sim = if (nodeA.atom.embedding.isNotEmpty() && nodeB.atom.embedding.isNotEmpty()) {
                        semanticEngine.cosineSimilarity(nodeA.atom.embedding, nodeB.atom.embedding)
                    } else if (nodeA.atom.lane == nodeB.atom.lane) {
                        0.5
                    } else {
                        0.1
                    }

                    if (sim > 0.3) {
                        val transfer = (nodeA.activationEnergy * sim * 0.1)
                        nodeB.activationEnergy += transfer
                        nodeA.activationEnergy += (nodeB.activationEnergy * sim * 0.1)
                    }
                }
            }
            
            // Energy decay
            nodes.forEach { it.activationEnergy *= (1.0 - decayFactor) }
        }

        return fieldNodes.values
            .filter { it.activationEnergy >= activationThreshold }
            .sortedByDescending { it.activationEnergy }
            .map { it.atom }
    }

    fun clear() {
        fieldNodes.clear()
    }

    fun activeNodeCount(): Int = fieldNodes.size
}
