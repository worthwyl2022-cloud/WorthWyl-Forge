package com.example.cranium.kernel

interface KernelInvariantValidator {
    fun validateAll(state: KernelState): List<InvariantResult>
}
