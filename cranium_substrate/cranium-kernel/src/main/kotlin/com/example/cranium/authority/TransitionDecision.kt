package com.example.cranium.authority

enum class TransitionDecision {
    APPROVED,
    REJECTED_MONOTONICITY_VIOLATION,
    REJECTED_INSUFFICIENT_EVIDENCE,
    REJECTED_PROTECTED_LANE,
    QUARANTINED
}
