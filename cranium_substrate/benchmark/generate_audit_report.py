#!/usr/bin/env python3
"""
Cranium Substrate — Prototype Evaluation Report Generator
Executes the benchmark harness dynamically and records real, computed metrics.
"""
import json
import time
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def calculate_contradiction(premise: str, hypothesis: str) -> bool:
    norm_p = premise.lower()
    norm_h = hypothesis.lower()
    antonyms = [
        ("allows", "prohibits"),
        ("encrypted", "cleartext"),
        ("mandatory", "optional"),
        ("must", "optional"),
        ("enable", "disable")
    ]
    for w1, w2 in antonyms:
        if (w1 in norm_p and w2 in norm_h) or (w2 in norm_p and w1 in norm_h):
            return True
    return False

def generate_report():
    with open(os.path.join(SCRIPT_DIR, "corpus_frozen_v1.json"), "r") as f:
        corpus = json.load(f)
        
    correct = 0
    total_time = 0.0
    item_results = []
    
    for item in corpus:
        t0 = time.perf_counter()
        pred = calculate_contradiction(item["premise"], item["hypothesis"])
        dt = (time.perf_counter() - t0) * 1000.0
        total_time += dt
        
        is_correct = (pred == item["isContradiction"])
        if is_correct:
            correct += 1
        item_results.append({
            "id": item["id"],
            "domain": item["domain"],
            "expected": item["isContradiction"],
            "predicted": pred,
            "passed": is_correct,
            "latency_ms": round(dt, 3)
        })
        
    accuracy = (correct / len(corpus)) * 100.0 if corpus else 0.0
    avg_latency = total_time / len(corpus) if corpus else 0.0

    report = {
        "title": "Cranium Substrate Prototype Evaluation Report",
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "status": "PROTOTYPE_BASELINE",
        "harness": "Lexical Proxy v1 on Frozen Corpus",
        "sample_count": len(corpus),
        "passed_count": correct,
        "benchmarks": {
            "corpus_accuracy": f"{accuracy:.1f}%",
            "mean_cycle_latency_ms": round(avg_latency, 3),
            "harness_mode": "Lexical Antonym Matcher (NLI Proxy)"
        },
        "item_results": item_results,
        "honest_disclosures": {
            "asset_class": "Pre-revenue creative-governance prototype (IP + architecture + working substrate)",
            "nli_engine": "Lexical antonym proxy + LLM-judge adapter design; not a trained neural CrossEncoder in this build",
            "canon_recall": "Baseline proxy evaluated on frozen corpus. Real-model evaluation with frozen corpus is the documented next step.",
            "write_back_gate": "Evaluation-gated write-back operational in substrate/SubstrateCore.kt"
        },
        "conclusion": "Evaluation metrics computed live from frozen corpus. The prototype demonstrates lexical contradiction gating and provisional memory quarantine."
    }
    with open(os.path.join(SCRIPT_DIR, "AUDIT_REPORT.json"), "w") as f:
        json.dump(report, f, indent=2)
    print(f"Audit report generated successfully from {len(corpus)} samples. Accuracy: {accuracy:.1f}%, Avg Latency: {avg_latency:.3f}ms")

if __name__ == "__main__":
    generate_report()
