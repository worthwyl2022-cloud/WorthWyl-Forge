package com.example.cranium.kernel

import com.example.cranium.cognition.CognitiveAtom
import com.example.cranium.authority.AuthorityLevel

data class KernelState(
    val currentAuthority: AuthorityLevel = AuthorityLevel.PROVISIONAL_EPHEMERAL,
    val activeAtoms: List<CognitiveAtom> = emptyList(),
    val quarantinedAtoms: List<CognitiveAtom> = emptyList(),
    val eventCount: Long = 0,
    val lastStateDigest: String = "genesis"
)
