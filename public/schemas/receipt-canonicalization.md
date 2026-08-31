# Cranium Substrate™ Receipt Canonicalization Specification
**Standard:** RFC-8785 JSON Canonicalization Scheme (JCS)  
**Hashing:** SHA-256 (FIPS 180-4)  
**Signature Scheme:** Ed25519 (RFC 8032) / PureEd25519

---

## 1. Canonicalization Procedure (RFC-8785 JCS)

To ensure bit-for-bit deterministic reproducibility across disparate runtime platforms (Python, Node.js/TypeScript, Kotlin/JVM, Rust), all JSON receipt objects must be canonicalized prior to hashing and signing according to RFC 8785:

1. **Object Key Sorting**: All object keys are lexicographically sorted by their UTF-16 code units (byte-order for UTF-8).
2. **Whitespace Stripping**: Zero whitespace outside of string literals (no space after colons `,` or `:` delimiters).
3. **Number Formatting**: IEEE 754 floating-point serialization without trailing `.0` or unnormalized exponents.
4. **String Escaping**: UTF-8 clean encoding without redundant Unicode escape sequences (`\u0020` forbidden).

---

## 2. Deterministic Digest Tree Structure

```
                  ┌───────────────────────────────┐
                  │    RECEIPT ROOT SIGNATURE     │
                  │   Ed25519(receipt_digest)     │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │        RECEIPT DIGEST         │
                  │ SHA256( JCS(ForensicDigest +  │
                  │     GovernanceDigest +        │
                  │     ParentReceiptDigest) )    │
                  └───────┬───────────────┬───────┘
                          │               │
            ┌─────────────▼───┐       ┌───▼─────────────┐
            │ FORENSIC DIGEST │       │GOVERNANCE DIGEST│
            │SHA256(JCS(F_Obj))       │SHA256(JCS(G_Obj))
            └─────────────────┘       └─────────────────┘
```

### Forensic Digest Calculation
```python
forensic_digest = "sha256:" + hashlib.sha256(
    jcs_canonicalize(receipt["forensic_evidence"])
).hexdigest()
```

### Compliance / Governance Digest Calculation
```python
governance_digest = "sha256:" + hashlib.sha256(
    jcs_canonicalize(receipt["compliance_governance"])
).hexdigest()
```

### Receipt Composite Digest Calculation
```python
composite_payload = {
    "forensic_digest": forensic_digest,
    "governance_digest": governance_digest,
    "parent_receipt_digest": receipt["cryptographic_proof"]["parent_receipt_digest"],
    "ledger_sequence": receipt["ledger_sequence"],
    "receipt_id": receipt["receipt_id"]
}
receipt_digest = "sha256:" + hashlib.sha256(
    jcs_canonicalize(composite_payload)
).hexdigest()
```

---

## 3. Asymmetric Ed25519 Signature Envelope

The `signature` string is computed over `raw_bytes(receipt_digest)`:
```
Signature = Ed25519_Sign(private_key, receipt_digest_bytes)
```
Verification requires:
```
Ed25519_Verify(public_key, receipt_digest_bytes, signature) === TRUE
```
