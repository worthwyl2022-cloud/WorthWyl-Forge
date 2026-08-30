#!/usr/bin/env python3
"""
Cranium Substrate Benchmark Execution Harness
Runs automated contradiction verification over frozen corpus samples.
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

def main():
    print("=" * 60)
    print("CRANIUM SUBSTRATE: AUTOMATED BENCHMARK HARNESS")
    print("=" * 60)
    
    with open(os.path.join(SCRIPT_DIR, "corpus_frozen_v1.json"), "r") as f:
        corpus = json.load(f)
        
    results = []
    correct = 0
    total_time = 0.0
    
    for item in corpus:
        t0 = time.perf_counter()
        pred = calculate_contradiction(item["premise"], item["hypothesis"])
        dt = (time.perf_counter() - t0) * 1000.0
        total_time += dt
        
        is_correct = (pred == item["isContradiction"])
        if is_correct:
            correct += 1
            
        results.append({
            "id": item["id"],
            "domain": item["domain"],
            "expected": item["isContradiction"],
            "predicted": pred,
            "passed": is_correct,
            "latency_ms": round(dt, 3)
        })
        print(f"[{item['id']}] Pass: {is_correct} | Domain: {item['domain']} | Latency: {dt:.2f}ms")

    accuracy = (correct / len(corpus)) * 100.0
    avg_latency = total_time / len(corpus)
    
    print("\n" + "=" * 60)
    print(f"SUMMARY: Accuracy: {accuracy:.2f}% | Samples: {len(corpus)} | Avg Latency: {avg_latency:.3f}ms")
    print("=" * 60)

if __name__ == "__main__":
    main()
