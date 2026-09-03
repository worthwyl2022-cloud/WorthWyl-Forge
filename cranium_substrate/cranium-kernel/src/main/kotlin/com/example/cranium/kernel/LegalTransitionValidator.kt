package com.example.cranium.kernel

class LegalTransitionValidator(private val invariantValidator: KernelInvariantValidator = DefaultKernelInvariantValidator()) {
    fun isTransitionLegal(state: KernelState): Boolean {
        val results = invariantValidator.validateAll(state)
        return results.all { it.isSatisfied }
    }
}
