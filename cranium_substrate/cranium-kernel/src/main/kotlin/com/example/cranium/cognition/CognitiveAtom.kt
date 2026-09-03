package com.example.cranium.cognition

data class CognitiveAtom(
    val id: String,
    val kind: AtomKind,
    val statement: String,
    val confidence: Double,
    val provenance: Provenance,
    val status: CognitiveStatus = CognitiveStatus.ACTIVE
)
