# Cranium Substrate™ — Diligence Evidence Pack Index
**Asset Class:** Governed Cognitive Substrate (GCS) Specification  
**Standard Version:** 1.0.0-PROD-FROZEN  
**Target Counterparties:** Enterprise AI Risk Officers, M&A Technical Diligence Teams, Lead Architects

---

## Executive Summary
This index connects every high-level architectural claim of **Cranium Substrate™** to an inspectable, deterministic, and executable proof artifact. Counterparties can reproduce and verify all invariants without relying on vendor assertions.

---

## 1. Traceability & Invariant Verification Matrix

| Claim ID | Architectural Invariant | Source Implementation | Frozen Fixture / Standard | Verification Command & Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **INV-001** | **State Write-Back Isolation**<br>Contradictions and unverified outputs never alter canonical memory. | `product/src/.../ProjectStore.kt` | `fixtures/fixture_quarantined_clash.json` | `python3 public/tools/verify_receipt.py public/benchmark/fixtures/fixture_quarantined_clash.json`<br>✅ Acceptance: `state_version_before === state_version_after`, memory mutation blocked. |
| **INV-002** | **Pre-Execution Adversarial Interception**<br>System invariants block injection before LLM adapter dispatch. | `immune/CraniumImmuneLayer.kt` | `fixtures/fixture_hard_blocked.json` | `python3 public/tools/verify_receipt.py public/benchmark/fixtures/fixture_hard_blocked.json`<br>✅ Acceptance: `model_identity` records interception, zero downstream model calls. |
| **INV-003** | **Affective Dynamic Deliberation**<br>Internal conflict modulates deliberation budget and temperature deterministically. | `substrate/DeliberationEngine.kt` | `schemas/receipt-v1.schema.json` | For conflict score $\ge 0.40$, deliberation rounds allocate to $3+$, temperature falls linearly to floor $0.20$. |
| **INV-004** | **Deterministic Cryptographic Chain**<br>Every deliberation cycle produces an RFC-8785 canonical digest. | `tools/verify_receipt.py` | `schemas/receipt-canonicalization.md` | `python3 public/tools/verify_receipt.py <receipt_file>`<br>✅ Acceptance: JCS digests match root `receipt_signature`. |

---

## 2. Evidence Artifact Manifest

| Category | Artifact Path | Description |
| :--- | :--- | :--- |
| **Formal Standard** | `public/schemas/receipt-v1.schema.json` | JSON Schema Draft 2020-12 machine validator specification. |
| **Canonicalization** | `public/schemas/receipt-canonicalization.md` | RFC-8785 JCS, SHA-256 Merkle chain, and Ed25519 signature scheme. |
| **Verification Tool** | `public/tools/verify_receipt.py` | Standalone Python validation utility. |
| **Clean Commit** | `public/benchmark/fixtures/fixture_clean_commit.json` | Verified non-contradiction fixture with successful state increment. |
| **Quarantine Clash** | `public/benchmark/fixtures/fixture_quarantined_clash.json` | High-conflict clash fixture with human arbitration rejection. |
| **Hard Block** | `public/benchmark/fixtures/fixture_hard_blocked.json` | Adversarial injection fixture showing zero model invocation. |

---

## 3. Independent Reproduction Steps

```bash
# 1. Validate clean state commit
python3 public/tools/verify_receipt.py public/benchmark/fixtures/fixture_clean_commit.json

# 2. Validate quarantined clash
python3 public/tools/verify_receipt.py public/benchmark/fixtures/fixture_quarantined_clash.json

# 3. Validate hard blocked adversarial attack
python3 public/tools/verify_receipt.py public/benchmark/fixtures/fixture_hard_blocked.json
```
