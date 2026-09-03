package com.example.cranium.canon

import java.util.concurrent.ConcurrentHashMap

class CanonLane {
    private val canonicalEntities = ConcurrentHashMap<String, String>()
    private val entityHashes = ConcurrentHashMap<String, CanonHash>()

    fun commitCanon(req: CanonRequest): CanonHash {
        val hasher = CanonicalRequestHasher()
        val hash = hasher.hashCanon(req)
        canonicalEntities[req.entityId] = req.content
        entityHashes[req.entityId] = hash
        return hash
    }

    fun getCanon(entityId: String): String? = canonicalEntities[entityId]
    fun getHash(entityId: String): CanonHash? = entityHashes[entityId]
    fun allCanonEntities(): Map<String, String> = canonicalEntities.toMap()
}
