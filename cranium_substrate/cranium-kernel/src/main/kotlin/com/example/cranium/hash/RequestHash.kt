package com.example.cranium.hash

data class RequestHash(
    val algorithm: String = "SHA-256",
    val hexValue: String
)
