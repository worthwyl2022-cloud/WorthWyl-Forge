package com.example.core.substrate

/**
 * Canon Lanes partition cognitive atoms into strictly bounded semantic channels
 * to prevent domain bleeding, hallucinations, and unauthorized role elevation.
 */
enum class CanonLane(
    val laneName: String,
    val priorityWeight: Double,
    val isProtected: Boolean
) {
    SYSTEM_AXIOM("system.axiom", 1.0, true),
    ENTERPRISE_POLICY("enterprise.policy", 0.95, true),
    FACTUAL_KNOWLEDGE("factual.knowledge", 0.85, false),
    USER_PREFERENCE("user.preference", 0.75, false),
    WORKING_MEMORY("working.memory", 0.65, false),
    GENERAL("general.epistemic", 0.50, false),
    HYPOTHETICAL("hypothetical.sandbox", 0.20, false);

    companion object {
        fun fromTag(tag: String): CanonLane {
            return entries.firstOrNull { it.laneName.equals(tag, ignoreCase = true) } ?: GENERAL
        }
    }
}
