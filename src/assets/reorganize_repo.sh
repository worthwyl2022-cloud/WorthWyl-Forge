# Cranium Substrate™ — Repository Organization Script
# Automated helper to reorganize worthwyl2022-cloud/Cranium-Substrate- into clean directories

mkdir -p benchmark audit showcase docs ip_record

echo "Reorganizing files..."

# Move benchmark & live harness files
[ -f run_harness.py ] && git mv run_harness.py benchmark/
[ -f live_receipts_runner.py ] && git mv live_receipts_runner.py benchmark/
[ -f corpus_frozen_v1.json ] && git mv corpus_frozen_v1.json benchmark/

# Move audit and receipt generation files
[ -f receipts_runner.py ] && git mv receipts_runner.py audit/
[ -f generate_audit_report.py ] && git mv generate_audit_report.py audit/
[ -f export_receipts.py ] && git mv export_receipts.py audit/
[ -f execution_receipts.json ] && git mv execution_receipts.json audit/
[ -f live_execution_receipts.json ] && git mv live_execution_receipts.json audit/
[ -f AUDIT_REPORT.json ] && git mv AUDIT_REPORT.json audit/

# Move showcase HTML
[ -f introducing-cranium-substrate.html ] && git mv introducing-cranium-substrate.html showcase/

echo "Done. Commit changes with: git commit -m 'refactor: organize into benchmark, audit, and showcase directories' && git push origin main"
