package com.example.cranium.hash

interface CanonicalEncoder<T> {
    fun encode(value: T): String
}
