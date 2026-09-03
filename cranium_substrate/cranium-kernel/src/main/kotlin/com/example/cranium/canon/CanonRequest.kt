package com.example.cranium.canon

data class CanonRequest(
    val entityId: String,
    val content: String,
    val authorDomain: String,
    val isPermanent: Boolean = true
)
