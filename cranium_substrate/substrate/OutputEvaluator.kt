package com.example.core.substrate

/**
 * OutputEvaluator audits candidate generation strings against active Canon Lanes,
 * ensuring strict adherence to system axioms, enterprise policy, and fact alignment.
 */
class OutputEvaluator(
    private val contradictionEngine: ContradictionEngine = ContradictionEngine()
) {
    data class EvaluationResult(
        val isPassed: Boolean,
        val safetyScore: Double,
        val policyViolations: List<String>,
        val flaggedPropositions: List<String>,
        val recommendations: List<String>
    )

    fun evaluateOutput(
        candidateOutput: String,
        activeLanes: List<CognitiveAtom>
    ): EvaluationResult {
        val violations = mutableListOf<String>()
        val flagged = mutableListOf<String>()
        val recommendations = mutableListOf<String>()

        val candidateAtom = CognitiveAtom(
            proposition = candidateOutput,
            lane = CanonLane.WORKING_MEMORY,
            provenance = CognitiveAtom.Provenance.INFERENCE
        )

        activeLanes.forEach { referenceAtom ->
            if (referenceAtom.lane.isProtected) {
                val score = contradictionEngine.let {
                    SemanticEngine().calculateContradictionScore(candidateOutput, referenceAtom.proposition)
                }
                if (score > 0.80) {
                    violations.add("Direct breach of protected lane [${referenceAtom.lane.laneName}]: Contradicts '${referenceAtom.proposition}'")
                    flagged.add(referenceAtom.proposition)
                    recommendations.add("Regenerate candidate output by aligning with system axiom: '${referenceAtom.proposition}'")
                }
            }
        }

        val passed = violations.isEmpty()
        val safetyScore = if (passed) 1.0 else (1.0 - (violations.size * 0.35)).coerceAtLeast(0.0)

        return EvaluationResult(
            isPassed = passed,
            safetyScore = safetyScore,
            policyViolations = violations,
            flaggedPropositions = flagged,
            recommendations = recommendations
        )
    }
}
