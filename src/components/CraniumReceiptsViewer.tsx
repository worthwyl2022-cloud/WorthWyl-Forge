import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Terminal, 
  Play, 
  RefreshCw, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Key, 
  Hash, 
  ExternalLink,
  Layers,
  BarChart2,
  Copy,
  Check
} from "lucide-react";
import { 
  CraniumReceiptsEngine, 
  ExecutionReceipt, 
  AuditReportData, 
  FROZEN_CORPUS_V1 
} from "../lib/craniumReceipts";
import { cn } from "../lib/utils";

export const CraniumReceiptsViewer: React.FC = () => {
  const [receipts, setReceipts] = useState<ExecutionReceipt[]>([]);
  const [auditReport, setAuditReport] = useState<AuditReportData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ExecutionReceipt | null>(null);
  const [hasCopiedDigest, setHasCopiedDigest] = useState(false);

  // Custom Verification State
  const [customPremise, setCustomPremise] = useState("Customer financial records must remain immutably signed and archived for 7 years.");
  const [customHypothesis, setCustomHypothesis] = useState("Debug mode bypasses data archiving to minimize storage latency.");
  const [customDomain, setCustomDomain] = useState("Zero-Trust Security");
  const [isVerifyingCustom, setIsVerifyingCustom] = useState(false);

  // Auto-run initial frozen suite on mount if empty
  useEffect(() => {
    runSuite();
  }, []);

  const runSuite = async () => {
    setIsRunning(true);
    try {
      const { receipts: rList, report } = await CraniumReceiptsEngine.runBenchmarkSuite();
      setReceipts(rList);
      setAuditReport(report);
      if (rList.length > 0) {
        setSelectedReceipt(rList[0]);
      }
    } catch (err) {
      console.error("Failed to run receipts benchmark suite:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleVerifyCustom = async () => {
    if (!customPremise.trim() || !customHypothesis.trim()) return;
    setIsVerifyingCustom(true);
    try {
      const receipt = await CraniumReceiptsEngine.createReceipt(
        `CUSTOM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        customDomain,
        customPremise,
        customHypothesis,
        true
      );
      setReceipts(prev => [receipt, ...prev]);
      setSelectedReceipt(receipt);
    } finally {
      setIsVerifyingCustom(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify({ receipts, auditReport }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cranium_execution_receipts_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyDigest = () => {
    if (!receipts.length) return;
    const digestText = receipts
      .map(r => `[${r.receipt_id}] Status: ${r.verification_status} | Latency: ${r.latency_ms}ms | SHA256: ${r.integrity_sha256}`)
      .join("\n");
    navigator.clipboard.writeText(digestText);
    setHasCopiedDigest(true);
    setTimeout(() => setHasCopiedDigest(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Cranium Substrate™ Verification Receipts</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Prototype Baseline
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                In-memory cognitive governance substrate • Deterministic SHA-256 integrity receipts & lexical contradiction proxy
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={runSuite}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isRunning ? "Executing Suite..." : "Re-Run Frozen Corpus"}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          <button
            onClick={copyDigest}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            {hasCopiedDigest ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{hasCopiedDigest ? "Copied" : "Copy Digest"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {auditReport && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Corpus Polarity Accuracy</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {auditReport.benchmarks.corpus_accuracy}
            </div>
            <p className="text-[11px] text-slate-500">Live evaluation on frozen corpus</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Contradiction Engine</span>
            <div className="text-sm font-bold text-indigo-400 font-mono truncate">
              {auditReport.benchmarks.harness_mode}
            </div>
            <p className="text-[11px] text-slate-500">Dual-lane lexical polarity proxy</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Write-Back Gate</span>
            <div className="text-sm font-bold text-amber-400 font-mono truncate">
              {auditReport.benchmarks.write_back_gate_status}
            </div>
            <p className="text-[11px] text-slate-500">Provisional quarantine boundary</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Mean Cycle Latency</span>
            <div className="text-xl font-black text-cyan-400 font-mono">
              {auditReport.benchmarks.mean_cycle_latency_ms} ms
            </div>
            <p className="text-[11px] text-slate-500">Substrate verification cycle</p>
          </div>
        </div>
      )}

      {/* Honest Diligence Disclosures Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>Technical Diligence & Architecture Disclosures</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 text-[11px] leading-relaxed">
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50 space-y-1">
            <div className="font-semibold text-slate-300">Asset Class & Scope</div>
            <p>Pre-revenue creative-governance prototype (IP + architecture + working substrate). Not a revenue-generating SaaS or validated benchmark leader.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50 space-y-1">
            <div className="font-semibold text-slate-300">Contradiction Resolution</div>
            <p>Operates an NLI-proxy (lexical + pattern heuristics) with LLM-judge adapter design; not a trained neural CrossEncoder in this build.</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Receipts Ledger */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" />
              <span>Cryptographic Receipt Ledger ({receipts.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">SHA-256 Signed</span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {receipts.map((rcpt) => (
              <div
                key={rcpt.receipt_id}
                onClick={() => setSelectedReceipt(rcpt)}
                className={cn(
                  "p-3.5 rounded-xl border transition cursor-pointer text-left space-y-2",
                  selectedReceipt?.receipt_id === rcpt.receipt_id
                    ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/30"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-200">{rcpt.item_id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {rcpt.domain}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1",
                      rcpt.verification_status === "PASSED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    )}
                  >
                    {rcpt.verification_status === "PASSED" ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                    <span>{rcpt.verification_status}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-1">
                  <span className="text-slate-500 font-semibold">P:</span> {rcpt.premise_atom.proposition}
                </p>
                <p className="text-xs text-slate-400 line-clamp-1">
                  <span className="text-slate-500 font-semibold">H:</span> {rcpt.hypothesis_atom.proposition}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                  <span className="truncate max-w-[200px]">sig: {rcpt.integrity_sha256.substring(0, 16)}...</span>
                  <span>{rcpt.latency_ms} ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Receipt Inspection & Interactive Verifier */}
        <div className="lg:col-span-6 space-y-6">
          {/* Selected Receipt Detailed Inspector */}
          {selectedReceipt && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono uppercase text-indigo-400 font-bold">Execution Receipt Details</div>
                  <div className="text-sm font-black text-white font-mono">{selectedReceipt.receipt_id}</div>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                  {selectedReceipt.timestamp_utc}
                </div>
              </div>

              {/* Premise & Hypothesis Atoms */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300 font-semibold uppercase">
                    <span>Premise Atom (Immutable Axiom / Policy)</span>
                    <span className="text-slate-500">Lane: {selectedReceipt.premise_atom.lane}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{selectedReceipt.premise_atom.proposition}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 font-semibold uppercase">
                    <span>Hypothesis Atom (Generated / Working Memory)</span>
                    <span className="text-slate-500">Lane: {selectedReceipt.hypothesis_atom.lane}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{selectedReceipt.hypothesis_atom.proposition}</p>
                </div>
              </div>

              {/* Substrate Decision */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-300 font-bold uppercase text-[10px] font-mono">Verdict & Strategy</span>
                  <span className={cn(
                    "font-bold font-mono px-2 py-0.5 rounded text-[10px]",
                    selectedReceipt.substrate_verdict.is_contradiction
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  )}>
                    {selectedReceipt.substrate_verdict.is_contradiction ? "CONTRADICTION DETECTED" : "COMPATIBLE"}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Strategy:</span> <span className="font-mono text-amber-300">{selectedReceipt.substrate_verdict.resolution_strategy}</span>
                </div>
                <p className="text-slate-400 italic">
                  "{selectedReceipt.substrate_verdict.rationale}"
                </p>
              </div>

              {/* Cryptographic SHA-256 Digest */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1 text-slate-500 font-bold uppercase">
                  <Hash size={12} />
                  <span>SHA-256 Cryptographic Signature</span>
                </div>
                <div className="text-indigo-400 break-all select-all font-mono">
                  {selectedReceipt.integrity_sha256}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Custom Contradiction Probe */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" />
                <span>Interactive Live Polarity Probe</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Custom Evaluation</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Axiomatic Premise:</label>
                <input
                  type="text"
                  value={customPremise}
                  onChange={(e) => setCustomPremise(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Generated Hypothesis:</label>
                <input
                  type="text"
                  value={customHypothesis}
                  onChange={(e) => setCustomHypothesis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <select
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
                >
                  <option value="Zero-Trust Security">Zero-Trust Security</option>
                  <option value="WorthWyl Canon">WorthWyl Canon</option>
                  <option value="Data Compliance">Data Compliance</option>
                  <option value="Epistemic Ethics">Epistemic Ethics</option>
                </select>

                <button
                  onClick={handleVerifyCustom}
                  disabled={isVerifyingCustom}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                >
                  {isVerifyingCustom ? <RefreshCw size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                  <span>Evaluate & Sign</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
