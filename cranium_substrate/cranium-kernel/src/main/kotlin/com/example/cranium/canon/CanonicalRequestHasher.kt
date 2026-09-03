package com.example.cranium.canon

import com.example.cranium.hash.Sha256RequestHasher

class CanonicalRequestHasher(private val hasher: Sha256RequestHasher = Sha256RequestHasher()) {
    fun hashCanon(req: CanonRequest): CanonHash {
        val h = hasher.hashString("CANON|${req.entityId}|${req.authorDomain}|${req.content}")
        return CanonHash(req.entityId, h.hexValue, 1)
    }
}
