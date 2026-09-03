# Cranium Kernel — Property & Invariant Registry
**Layer Class:** Directive-Governed Cognitive Substrate & Formal Authority Kernel
**Commit:** `c21778f0a9b8660f16c80e41b06061cf04587df5`
**Substrate Role:** Operational Sovereign Execution & Memory Invariant Governance

---

## 1. Core Invariants (Mathematically Enforced)

| Invariant | Scope | Enforcement Mechanism |
|---|---|---|
| **Authority Monotonicity** | State Machine | Prevents unauthorized authority escalation; transitions require explicit cryptographic evidence. |
| **No Isolated Subject** | Cognitive Field | Every cognitive atom in working memory must possess verifiable provenance and causal links. |
| **Protected Lane** | Memory Isolation | Canon, constitutional constraints, and immune records cannot be overwritten by provisional generation. |
| **Quarantine Write-Back Gate** | Generation Boundary | Generated tokens remain provisional in quarantine until validated against NLI contradiction checks. |
| **Monotonic Replay Guard** | Execution Stream | Rejects duplicate, stale, or re-ordered state transition requests via SHA-256 hash chaining. |

---

## 2. Authority Classifications

- **SYSTEM_CORE (Level 4):** Immutable axioms, constitutional constraints, immune definitions.
- **DIRECTIVE_AUTHORITY (Level 3):** Human operator explicit intent, verified canon additions.
- **DELIBERATIVE_GATE (Level 2):** Evaluator consensus, contradiction filters, causal coherence.
- **PROVISIONAL_EPHEMERAL (Level 1):** Unverified LLM output, quarantined candidate tokens.
- **UNTRUSTED_EXTERNAL (Level 0):** Raw prompt inputs, third-party network payloads.

---

## 3. Cryptographic Verification & Receipts

Every authority transition, quarantine promotion, and immune incident emits an immutable `AuthorityReceipt` containing:
- Pre-state and post-state SHA-256 root hashes.
- Evidence references and timestamp.
- Evaluation status (`APPROVED`, `REJECTED`, `QUARANTINED`, `PROTECTED`).
