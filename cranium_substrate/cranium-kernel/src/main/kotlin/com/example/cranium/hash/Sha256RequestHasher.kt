package com.example.cranium.hash

import java.security.MessageDigest

class Sha256RequestHasher : RequestHasher {
    override fun hashString(input: String): RequestHash {
        val md = MessageDigest.getInstance("SHA-256")
        val bytes = md.digest(input.toByteArray(Charsets.UTF_8))
        val hex = bytes.joinToString("") { "%02x".format(it) }
        return RequestHash("SHA-256", hex)
    }
}
