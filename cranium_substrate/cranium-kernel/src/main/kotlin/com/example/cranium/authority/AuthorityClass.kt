package com.example.cranium.authority

data class AuthorityClass(
    val level: AuthorityLevel,
    val domain: String,
    val isProtected: Boolean = false
)
