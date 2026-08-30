package com.example.core.substrate

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.ConcurrentHashMap

/**
 * SubstrateCore serves as the central coordination bus for Cranium Substrate.
 * Manages active cognitive atoms, resonance propagation, dialectic deliberation,
 * and output evaluation against protected canon lanes.
 */
class SubstrateCore(
    val semanticEngine: SemanticEngine = SemanticEngine(),
    val contradictionEngine: ContradictionEngine = ContradictionEngine(semanticEngine),
    val deliberationEngine: DeliberationEngine = DeliberationEngine(contradictionEngine),
    val resonanceField: ResonanceField = ResonanceField(semanticEngine),
    val outputEvaluator: OutputEvaluator = OutputEvaluator(contradictionEngine)
) {
    private val memoryStore = ConcurrentHashMap<String, CognitiveAtom>()
    private val _systemHealth = MutableStateFlow(SubstrateHealth.NOMINAL)
    val systemHealth: Flow<SubstrateHealth> = _systemHealth.asStateFlow()

    enum class SubstrateHealth {
        NOMINAL,
        DELIBERATING,
        RESOLVING_DISSONANCE,
        CRITICAL_BREACH
    }

    data class ExecutionReceipt(
        val sessionId: String,
        val inputPrompt: String,
        val finalSynthesizedOutput: String,
        val activeAtomsCount: Int,
        val deliberationSteps: Int,
        val evaluationResult: OutputEvaluator.EvaluationResult,
        val latencyMs: Long
    )

    fun registerAtom(atom: CognitiveAtom) {
        memoryStore[atom.id] = atom
        resonanceField.injectAtom(atom)
    }

    fun getAllAtoms(): List<CognitiveAtom> = memoryStore.values.toList()

    fun getAtomsInLane(lane: CanonLane): List<CognitiveAtom> {
        return memoryStore.values.filter { it.lane == lane }
    }

    suspend fun executeCognitiveCycle(
        prompt: String,
        candidateOutput: String
    ): ExecutionReceipt {
        val startTime = System.currentTimeMillis()
        _systemHealth.value = SubstrateHealth.DELIBERATING

        // 1. Ingest input as Working Memory Atom
        val promptAtom = CognitiveAtom(
            proposition = prompt,
            lane = CanonLane.WORKING_MEMORY,
            provenance = CognitiveAtom.Provenance.OBSERVATION
        )
        registerAtom(promptAtom)

        // 2. Resonate and fetch activated network
        val activatedAtoms = resonanceField.propagateActivation()
        val pool = (activatedAtoms + getAllAtoms().filter { it.lane.isProtected }).distinctBy { it.id }

        // 3. Deliberate to resolve contradictions
        _systemHealth.value = SubstrateHealth.RESOLVING_DISSONANCE
        val deliberation = deliberationEngine.deliberate(pool, prompt)

        // 4. Evaluate generated candidate against verified axioms
        val eval = outputEvaluator.evaluateOutput(candidateOutput, deliberation.finalAtoms)

        _systemHealth.value = if (eval.isPassed) SubstrateHealth.NOMINAL else SubstrateHealth.CRITICAL_BREACH
        val latency = System.currentTimeMillis() - startTime

        return ExecutionReceipt(
            sessionId = promptAtom.id,
            inputPrompt = prompt,
            finalSynthesizedOutput = candidateOutput,
            activeAtomsCount = deliberation.finalAtoms.size,
            deliberationSteps = deliberation.iterationsExecuted,
            evaluationResult = eval,
            latencyMs = latency
        )
    }
}
