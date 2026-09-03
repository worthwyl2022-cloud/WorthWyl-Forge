package com.example.cranium.kernel

class NoIsolatedSubjectInvariant : KernelInvariant {
    override val name: String = "NoIsolatedSubject"
    override fun validate(state: KernelState): InvariantResult {
        val isolated = state.activeAtoms.filter { it.provenance.source.isBlank() }
        val valid = isolated.isEmpty()
        return InvariantResult(name, valid, if (valid) "All ${state.activeAtoms.size} atoms possess valid provenance" else "${isolated.size} atoms lack provenance trace")
    }
}
