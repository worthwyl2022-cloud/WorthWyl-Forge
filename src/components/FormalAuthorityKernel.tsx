import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  Play, 
  RefreshCw, 
  Lock, 
  Unlock, 
  FileCode2, 
  CheckCircle2, 
  XCircle,
  Hash,
  Activity,
  Zap,
  ArrowDown
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface AuthorityState {
  tier: number;
  tierName: string;
  source: string;
  nonce: number;
  parentHash: string;
  payloadDigest: string;
  invariantsPassed: boolean;
  violations: string[];
}

export function FormalAuthorityKernel() {
  const [sourceTier, setSourceTier] = useState<number>(0);
  const [targetTier, setTargetTier] = useState<number>(3);
  const [payloadText, setPayloadText] = useState("Update primary world canon: Captain Valen retains standard cybernetic arm.");
  const [hasIsolatedSubject, setHasIsolatedSubject] = useState(false);
  const [bypassLane, setBypassLane] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [history, setHistory] = useState<AuthorityState[]>([]);

  // 5 Authority Tiers
  const tiers = [
    { level: 0, name: "UNTRUSTED_EXTERNAL", desc: "Raw external user or third-party ingest. Zero write privilege.", color: "text-slate-400", border: "border-slate-700" },
    { level: 1, name: "PROVISIONAL_EPHEMERAL", desc: "Raw generated LLM token candidate stream. Held in quarantine.", color: "text-amber-400", border: "border-amber-700/50" },
    { level: 2, name: "DELIBERATIVE_GATE", desc: "Dual-lane NLI judge & contradiction resolution zone.", color: "text-indigo-400", border: "border-indigo-700/50" },
    { level: 3, name: "DIRECTIVE_AUTHORITY", desc: "Sovereign operator directive. Enforces immutable constraints.", color: "text-purple-400", border: "border-purple-700/50" },
    { level: 4, name: "SYSTEM_CORE", desc: "Axiomatic constitutional kernel invariants.", color: "text-emerald-400", border: "border-emerald-700/50" }
  ];

  const handleTestStateTransition = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/substrate/evaluate-state-transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceTier,
          targetTier,
          sourceName: tiers[sourceTier].name,
          targetName: tiers[targetTier].name,
          hasIsolatedSubject,
          bypassLane,
          payloadText: payloadText.trim() || "State mutation"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const parentHash = history.length > 0 ? history[0].payloadDigest : "0000000000000000000000000000000000000000000000000000000000000000";

        const newState: AuthorityState = {
          tier: targetTier,
          tierName: tiers[targetTier].name,
          source: tiers[sourceTier].name,
          nonce: data.nonce,
          parentHash,
          payloadDigest: data.payloadDigest,
          invariantsPassed: data.passed,
          violations: data.violations
        };

        setHistory(prev => [newState, ...prev.slice(0, 19)]);
      }
    } catch (e) {
      console.error("State transition evaluation error:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="bg-[#0c0d14] p-6 rounded-2xl border border-sleek-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-400" size={20} />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              Formal Authority Kernel & Monotonic State Reducer
            </h2>
          </div>
          <p className="text-xs text-sleek-muted max-w-2xl leading-relaxed">
            Mathematical state reducer enforcing sovereign privilege ordering: <code className="text-amber-300 font-mono">Tier 0 (External) → Tier 4 (System Core)</code>. Rejects uncertified mutations and guarantees causal provenance.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5">
            <Activity size={13} />
            REDUCER ACTIVE
          </span>
        </div>
      </div>

      {/* 5-Tier Ladder Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {tiers.map(t => (
          <div 
            key={t.level}
            className={cn(
              "p-4 rounded-xl bg-[#0c0d14] border transition-all space-y-1.5",
              t.border
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn("text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-black/40", t.color)}>
                TIER {t.level}
              </span>
              {t.level >= 3 ? <Lock size={12} className="text-purple-400" /> : <Unlock size={12} className="text-slate-500" />}
            </div>
            <h4 className={cn("text-xs font-black truncate", t.color)}>{t.name}</h4>
            <p className="text-[10px] text-slate-400 leading-normal">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Interactive Mutation & Invariant Prober */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0c0d14] rounded-2xl border border-sleek-border p-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Zap className="text-amber-400" size={16} />
            Simulate State Mutation & Authority Elevation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Source Origin Tier:</label>
              <select
                value={sourceTier}
                onChange={(e) => setSourceTier(Number(e.target.value))}
                className="w-full bg-black/50 border border-sleek-border rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              >
                {tiers.map(t => (
                  <option key={t.level} value={t.level}>Tier {t.level}: {t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Authority Target:</label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(Number(e.target.value))}
                className="w-full bg-black/50 border border-sleek-border rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                {tiers.map(t => (
                  <option key={t.level} value={t.level}>Tier {t.level}: {t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Payload Mutation Request:</label>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={3}
              className="w-full bg-black/50 border border-sleek-border rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-400 custom-scrollbar"
              placeholder="Enter proposed state update..."
            />
          </div>

          {/* Invariant Failure Toggle Checkboxes */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-sleek-border space-y-2">
            <span className="text-[10px] font-mono text-sleek-muted uppercase font-bold block">
              Adversarial Invariant Probes (Simulate Breaches):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={hasIsolatedSubject}
                  onChange={(e) => setHasIsolatedSubject(e.target.checked)}
                  className="accent-rose-500 rounded"
                />
                <span>Simulate Dangling Causal Trace</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={bypassLane}
                  onChange={(e) => setBypassLane(e.target.checked)}
                  className="accent-rose-500 rounded"
                />
                <span>Simulate Lane Bypass</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleTestStateTransition}
            disabled={isEvaluating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50 transition-all"
          >
            {isEvaluating ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isEvaluating ? "Evaluating Reducer Invariants..." : "Submit to State Reducer"}</span>
          </button>
        </div>

        {/* Live Reducer Audit Log */}
        <div className="lg:col-span-5 bg-[#0c0d14] rounded-2xl border border-sleek-border p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
              <span>Authority Receipt Ledger</span>
              <span className="text-[10px] font-mono text-sleek-muted">{history.length} Receipts</span>
            </h3>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No state transitions recorded yet. Click "Submit to State Reducer" to test.
                </div>
              ) : (
                history.map((h, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 rounded-xl border space-y-1.5 font-mono text-xs",
                      h.invariantsPassed 
                        ? "bg-emerald-950/20 border-emerald-500/30" 
                        : "bg-rose-950/20 border-rose-500/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                        h.invariantsPassed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                      )}>
                        {h.invariantsPassed ? "✓ PERMITTED" : "✕ REJECTED"}
                      </span>
                      <span className="text-[10px] text-slate-400">Nonce: #{h.nonce}</span>
                    </div>

                    <div className="text-[11px] text-slate-300">
                      <span>{h.source}</span> <ArrowDown size={10} className="inline rotate-[-90deg] mx-1" /> <strong className="text-white">{h.tierName}</strong>
                    </div>

                    {h.violations.map((v, vIdx) => (
                      <p key={vIdx} className="text-[10px] text-rose-400 leading-tight">
                        {v}
                      </p>
                    ))}

                    <div className="text-[9px] text-slate-500 truncate pt-1 border-t border-white/5">
                      Parent: {h.parentHash.slice(0, 16)}... | Digest: {h.payloadDigest.slice(0, 16)}...
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
