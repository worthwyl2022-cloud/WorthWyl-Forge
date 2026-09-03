package com.example.cranium.kernel

sealed class DomainEvent {
    data class AtomIngested(val atomId: String, val kind: String, val timestamp: Long) : DomainEvent()
    data class AuthorityEscalated(val from: String, val to: String, val requestId: String) : DomainEvent()
    data class ContradictionQuarantined(val atomId: String, val reason: String) : DomainEvent()
    data class CanonCommitted(val entityId: String, val hash: String) : DomainEvent()
}
