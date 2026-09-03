package com.example.cranium.kernel

import com.example.cranium.cognition.CognitiveStatus

class ProtectedLaneInvariant : KernelInvariant {
    override val name: String = "ProtectedLane"
    override fun validate(state: KernelState): InvariantResult {
        val corrupted = state.quarantinedAtoms.filter { it.status == CognitiveStatus.PROTECTED_PERMANENT }
        val valid = corrupted.isEmpty()
        return InvariantResult(name, valid, if (valid) "Protected lane isolation intact" else "Illegal write to protected lane detected")
    }
}
