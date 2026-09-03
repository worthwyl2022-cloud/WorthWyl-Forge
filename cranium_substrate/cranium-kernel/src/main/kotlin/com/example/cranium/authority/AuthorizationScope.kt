package com.example.cranium.authority

data class AuthorizationScope(
    val namespace: String,
    val readOnly: Boolean = false,
    val targetLanes: List<String> = listOf("working", "quarantine")
)
