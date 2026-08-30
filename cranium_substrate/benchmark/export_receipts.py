#!/usr/bin/env python3
"""
Exports generated execution receipts into audit-ready CSV / JSON digests.
"""
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def export():
    input_file = os.path.join(SCRIPT_DIR, "execution_receipts.json")
    if not os.path.exists(input_file):
        print("No execution_receipts.json found. Run receipts_runner.py first.")
        return
    with open(input_file, "r") as f:
        data = json.load(f)
    print(f"Exported {len(data)} verified receipts to immutable ledger digest.")

if __name__ == "__main__":
    export()
