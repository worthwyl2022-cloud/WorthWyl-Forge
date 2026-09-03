package com.example.cranium.kernel

class DefaultKernelInvariantValidator(
    private val invariants: List<KernelInvariant> = listOf(
        AuthorityMonotonicityInvariant(),
        NoIsolatedSubjectInvariant(),
        ProtectedLaneInvariant()
    )
) : KernelInvariantValidator {
    override fun validateAll(state: KernelState): List<InvariantResult> {
        return invariants.map { it.validate(state) }
    }
}
