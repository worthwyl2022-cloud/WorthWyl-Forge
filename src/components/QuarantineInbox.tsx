import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  Sparkles, 
  FileText,
  Flame,
  Activity,
  History,
  Send,
  Sliders,
  Cpu,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSubstrateProjects } from '../core/useSubstrateProjects';

interface QuarantineInboxProps {
  externalProjectManager?: ReturnType<typeof useSubstrateProjects>;
}

export function QuarantineInbox({ externalProjectManager }: QuarantineInboxProps) {
  const internalPM = useSubstrateProjects();
  const pm = externalProjectManager || internalPM;
  const { currentProject, handleQuarantineDecision, arbitrateCandidate } = pm;

  const [inputCandidate, setInputCandidate] = useState('');
  const [selectedPremiseId, setSelectedPremiseId] = useState<string>('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [threshold, setThreshold] = useState(0.85);

  const quarantineItems = currentProject?.quarantine || [];
  const axioms = currentProject?.constitution || [];

  const handleIngestCandidate = async () => {
    if (!inputCandidate.trim() || isIngesting) return;
    setIsIngesting(true);

    // Pick selected premise or first axiom or a general ground truth
    const premiseAxiom = axioms.find(a => a.id === selectedPremiseId) || axioms[0];
    const premiseText = premiseAxiom 
      ? `${premiseAxiom.title}: ${premiseAxiom.statement}`
      : "Captain Valen lost his left arm and has a prosthetic limb.";

    try {
      await arbitrateCandidate(premiseText, inputCandidate.trim(), threshold);
      setInputCandidate('');
    } finally {
      setIsIngesting(false);
    }
  };

  const pendingItems = quarantineItems.filter(item => item.status === 'QUARANTINED');
  const resolvedItems = quarantineItems.filter(item => item.status !== 'QUARANTINED');

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="bg-[#0c0d14] p-6 rounded-3xl border border-sleek-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <ShieldAlert size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              Quarantine Boundary & Write-Back Gate
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              PROJECT: {currentProject?.name || "Aetherius Continuum"}
            </span>
          </div>
          <p className="text-xs text-sleek-muted max-w-3xl leading-relaxed">
            All raw model-generated candidate outputs reside in quarantine with <strong>zero axiomatic authority</strong> until dual-lane contradiction evaluation completes. Protects the canon lattice against persistent hallucination write-back.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5">
            <Lock size={13} />
            <span>BUFFER: {pendingItems.length} QUARANTINED</span>
          </span>
        </div>
      </div>

      {/* Provisional Candidate Ingestion Tester */}
      <div className="p-6 rounded-3xl bg-[#0c0d14] border border-amber-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={16} />
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
              Inject Provisional Candidate Output (Test Write-Back Gate)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Escalates through Heuristic Lane 1 & Gemini 3.7 LLM Judge
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 space-y-1">
            <label className="text-[11px] font-mono text-slate-400 block">Provisional Model Candidate Text:</label>
            <input
              type="text"
              value={inputCandidate}
              onChange={(e) => setInputCandidate(e.target.value)}
              placeholder="e.g. Captain Valen reached out with his biological left hand and smiled..."
              className="w-full bg-black/50 border border-sleek-border rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleIngestCandidate();
              }}
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-mono text-slate-400 block">Test Against Constitutional Axiom:</label>
            <select
              value={selectedPremiseId}
              onChange={(e) => setSelectedPremiseId(e.target.value)}
              className="w-full bg-black/50 border border-sleek-border rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="">Default (First Active Axiom)</option>
              {axioms.map(a => (
                <option key={a.id} value={a.id}>
                  [{a.id}] {a.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
            <Sliders size={13} className="text-amber-400" />
            <span>Escalation Threshold: {(threshold * 100).toFixed(0)}%</span>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-24 accent-amber-400"
            />
          </div>

          <button
            onClick={handleIngestCandidate}
            disabled={isIngesting || !inputCandidate.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50 transition-all"
          >
            {isIngesting ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            <span>{isIngesting ? "Evaluating Write-Back..." : "Submit to Quarantine Gate"}</span>
          </button>
        </div>
      </div>

      {/* Candidate Stream & Immune Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Quarantined Items */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
            <span>Quarantined Token Inspection Buffer</span>
            <span className="text-[10px] font-mono text-sleek-muted">Zero Authority State</span>
          </h3>

          {quarantineItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0c0d14] border border-sleek-border text-center text-slate-500 text-xs font-mono">
              Quarantine buffer is currently empty. All generated tokens are in compliance or committed to canon.
            </div>
          ) : (
            <div className="space-y-3">
              {quarantineItems.map((candidate) => (
                <div
                  key={candidate.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all space-y-3 bg-[#0c0d14]",
                    candidate.status === 'PROMOTED' ? "border-emerald-500/40 bg-emerald-950/10 opacity-70" :
                    candidate.status === 'PURGED' ? "border-rose-500/40 bg-rose-950/10 opacity-60 line-through" :
                    "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  )}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-white">[{candidate.id}]</span>
                      <span className="text-[10px] text-slate-400">{candidate.timestamp}</span>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-300">
                        Tier {candidate.tier}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase",
                        candidate.status === 'PROMOTED' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        candidate.status === 'PURGED' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                        "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      )}>
                        {candidate.status} (CONF: {(candidate.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Candidate Text */}
                  <div className="bg-black/50 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">Provisional Output:</div>
                    <p className="text-xs text-white leading-relaxed font-mono">
                      "{candidate.candidateText}"
                    </p>
                  </div>

                  {/* Diagnostics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                      <span className="text-slate-400">Lane 1 Polarity Score: </span>
                      <span className="text-cyan-300 font-bold">{(candidate.lane1Score * 100).toFixed(0)}%</span>
                      {candidate.oppositionTokens?.length > 0 && (
                        <div className="text-amber-400 text-[9px] truncate">
                          Tokens: {candidate.oppositionTokens.join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="bg-black/40 p-2 rounded border border-white/5">
                      <span className="text-slate-400">Lane 2 Verdict: </span>
                      <span className="text-purple-300 font-bold">{candidate.lane2Verdict || "BYPASS"}</span>
                      <div className="text-slate-400 text-[9px] truncate">
                        Reason: {candidate.reasoning || "Detected contradiction against canonical invariant"}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {candidate.status === 'QUARANTINED' && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                      <button
                        onClick={() => handleQuarantineDecision(candidate.id, 'PURGE')}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-mono text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Trash2 size={12} />
                        <span>Purge & Log Immune Incident</span>
                      </button>

                      <button
                        onClick={() => handleQuarantineDecision(candidate.id, 'PROMOTE')}
                        className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1 cursor-pointer shadow-md transition-all"
                      >
                        <CheckCircle2 size={12} />
                        <span>Override & Promote to Canon</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Immune Audit & Merkle Log */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Activity size={15} className="text-rose-400" />
            <span>Immune Incidents & Merkle Audit</span>
          </h3>

          <div className="bg-[#0c0d14] rounded-3xl border border-sleek-border p-5 space-y-3">
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Every quarantine decision appends an immutable cryptographic entry into the project's Merkle receipt ledger.
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {currentProject?.merkleChain.map((block) => (
                <div key={block.index} className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-amber-400 font-bold">BLOCK #{block.index}</span>
                    <span>{block.timestamp}</span>
                  </div>
                  <div className="text-white font-bold">{block.action}</div>
                  <div className="text-[9px] text-slate-400 truncate">
                    Hash: {block.postHash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
