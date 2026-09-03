package com.example.cranium.kernel

class KernelStateReducer {
    fun reduce(currentState: KernelState, event: DomainEvent): KernelState {
        return when (event) {
            is DomainEvent.AtomIngested -> currentState.copy(
                eventCount = currentState.eventCount + 1,
                lastStateDigest = "sha256:state-${currentState.eventCount + 1}"
            )
            is DomainEvent.AuthorityEscalated -> currentState.copy(
                eventCount = currentState.eventCount + 1,
                lastStateDigest = "sha256:state-escalated-${currentState.eventCount + 1}"
            )
            is DomainEvent.ContradictionQuarantined -> currentState.copy(
                eventCount = currentState.eventCount + 1,
                lastStateDigest = "sha256:state-quarantined-${currentState.eventCount + 1}"
            )
            is DomainEvent.CanonCommitted -> currentState.copy(
                eventCount = currentState.eventCount + 1,
                lastStateDigest = "sha256:state-canon-${currentState.eventCount + 1}"
            )
        }
    }
}
