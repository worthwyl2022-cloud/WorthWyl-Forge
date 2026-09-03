package com.example.cranium.authority

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class AuthorityTransitionEngineTest {
    @Test
    fun `test legal transition approval`() {
        val engine = DefaultAuthorityTransitionEngine()
        val req = AuthorityTransitionRequest(
            requestId = "req-001",
            fromLevel = AuthorityLevel.PROVISIONAL_EPHEMERAL,
            toLevel = AuthorityLevel.DELIBERATIVE_GATE,
            source = AuthoritySource.EVALUATOR_CONSENSUS,
            scope = AuthorizationScope("workspace"),
            evidence = listOf(EvidenceRef("ev-1", "ContradictionEngine", "sha256:abc")),
            nonce = 1001L
        )
        val result = engine.processTransition(req)
        assertEquals(TransitionDecision.APPROVED, result.decision)
        assertNotNull(result.stateDigest)
    }

    @Test
    fun `test unauthorized escalation rejection`() {
        val engine = DefaultAuthorityTransitionEngine()
        val req = AuthorityTransitionRequest(
            requestId = "req-002",
            fromLevel = AuthorityLevel.UNTRUSTED_EXTERNAL,
            toLevel = AuthorityLevel.DIRECTIVE_AUTHORITY, // illegal jump of 3 levels
            source = AuthoritySource.EPHEMERAL_LLM,
            scope = AuthorizationScope("workspace"),
            evidence = emptyList(),
            nonce = 1002L
        )
        val result = engine.processTransition(req)
        assertEquals(TransitionDecision.REJECTED_MONOTONICITY_VIOLATION, result.decision)
    }
}
