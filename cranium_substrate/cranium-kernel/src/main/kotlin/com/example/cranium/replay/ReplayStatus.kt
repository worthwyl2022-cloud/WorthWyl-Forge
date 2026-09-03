package com.example.cranium.replay

enum class ReplayStatus {
    ACCEPTED_NEW,
    REJECTED_DUPLICATE_NONCE,
    REJECTED_STALE_TIMESTAMP,
    REJECTED_HASH_COLLISION
}
