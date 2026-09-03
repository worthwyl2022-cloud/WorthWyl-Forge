package com.example.cranium.kernel

interface KernelInvariant {
    val name: String
    fun validate(state: KernelState): InvariantResult
}
