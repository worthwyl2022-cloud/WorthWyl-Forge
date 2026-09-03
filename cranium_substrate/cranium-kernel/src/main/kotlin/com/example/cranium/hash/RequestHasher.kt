package com.example.cranium.hash

interface RequestHasher {
    fun hashString(input: String): RequestHash
}
