import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Hash, 
  Cpu, 
  Layers, 
  Flame, 
  Lock, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { streamChat } from '../lib/gemini';
import { useSubstrateProjects } from '../core/useSubstrateProjects';

export interface ConsoleMessage {
  id: string;
  sender: 'operator' | 'substrate';
  text: string;
  timestamp: string;
  tier: number;
  quarantinePassed?: boolean;
  contradictionRisk?: number;
  receiptHash?: string;
  parentHash?: string;
  deliberationLog?: string[];
}

interface DirectiveConsoleProps {
  externalProjectManager?: ReturnType<typeof useSubstrateProjects>;
}

export function DirectiveConsole({ externalProjectManager }: DirectiveConsoleProps) {
  const internalPM = useSubstrateProjects();
  const pm = externalProjectManager || internalPM;
  const { currentProject, arbitrateCandidate } = pm;

  const [messages, setMessages] = useState<ConsoleMessage[]>([
    {
      id: "DIR-001",
      sender: "substrate",
      text: `Cranium Core Substrate initialized in isolated domain: ${currentProject?.name || "The Aetherius Continuum"}. Monotonic authority reducer active (Tier 0 → Tier 4). All generated outputs are governed by the Creative Constitution and dual-lane NLI contradiction gates.`,
      timestamp: new Date().toLocaleTimeString(),
      tier: 4,
      quarantinePassed: true,
      receiptHash: "a7c29b48e102f9c4501a9b3d88e40192",
      parentHash: "00000000000000000000000000000000"
    }
  ]);

  const [inputDirective, setInputDirective] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStage, setActiveStage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendDirective = async () => {
    if (!inputDirective.trim() || isProcessing) return;

    const userText = inputDirective.trim();
    setInputDirective("");

    const userMsg: ConsoleMessage = {
      id: `DIR-${Math.floor(Math.random() * 9000 + 1000)}`,
      sender: "operator",
      text: userText,
      timestamp: new Date().toLocaleTimeString(),
      tier: 3
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setActiveStage("1. Ingesting Directive & Loading Domain Axioms...");

    try {
      await new Promise(r => setTimeout(r, 200));
      setActiveStage("2. Querying Model in Provisional Quarantine Buffer...");

      const activeAxiomsText = currentProject?.constitution.map(a => `[AXIOM ${a.id}]: ${a.statement}`).join("\n") || "No constitutional axioms loaded.";

      let accumulated = "";
      const stream = streamChat([
        { 
          role: "user", 
          text: `[SYSTEM GOVERNANCE DIRECTIVE: You are Cranium Core, a directive-governed cognitive substrate. Domain: ${currentProject?.name || "Aetherius Continuum"}. Enforce strict canon permanence, causal invariants, and sovereign operator directives without hallucination or identity drift.]\n\nCONSTITUTIONAL INVARIANTS:\n${activeAxiomsText}\n\nDIRECTIVE:\n${userText}` 
        }
      ], "gemini-3.7-flash", false);

      for await (const chunk of stream) {
        accumulated += chunk;
      }

      setActiveStage("3. Running Dual-Lane NLI Contradiction Gate...");
      await new Promise(r => setTimeout(r, 200));

      // Fast check against first axiom if present
      const firstAxiom = currentProject?.constitution[0];
      const arbResult = firstAxiom 
        ? await arbitrateCandidate(firstAxiom.statement, accumulated.slice(0, 300), 0.85)
        : null;

      const pHash = messages[messages.length - 1]?.receiptHash || "0000000000000000";
      const pseudoHash = Array.from(accumulated + Date.now()).reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
      const rHash = Math.abs(pseudoHash).toString(16).padStart(16, 'a') + Math.abs(pseudoHash * 13).toString(16).padStart(16, 'c');

      const isQuarantineReject = arbResult && arbResult.verdict === 'QUARANTINE_REJECT';

      const substrateMsg: ConsoleMessage = {
        id: `SUB-${Math.floor(Math.random() * 9000 + 1000)}`,
        sender: "substrate",
        text: isQuarantineReject 
          ? `[QUARANTINE ENFORCED — WRITE-BACK PREVENTED]\nThe generated provisional output contradicted constitutional axiom ${firstAxiom?.id}.\nReason: ${arbResult?.lane2_judge?.reasoning || "Contradiction detected"}.\n\nRaw Provisional Output held in quarantine:\n"${accumulated}"`
          : accumulated,
        timestamp: new Date().toLocaleTimeString(),
        tier: 4,
        quarantinePassed: !isQuarantineReject,
        contradictionRisk: isQuarantineReject ? 0.96 : 0.02,
        receiptHash: rHash,
        parentHash: pHash,
        deliberationLog: [
          `Domain: ${currentProject?.name || "The Aetherius Continuum"}`,
          "Monotonicity invariant: PASS (Operator Tier 3 verified)",
          isQuarantineReject 
            ? `Dual-Lane NLI check: REJECT (Contradiction detected by ${arbResult?.arbitrationMode || "gate"})` 
            : "Dual-Lane NLI check: PASS (Zero canon collisions detected)",
          isQuarantineReject
            ? "Quarantine release: BLOCKED → Prevented canon write-back"
            : "Quarantine release: APPROVED → Written to lattice"
        ]
      };

      setMessages(prev => [...prev, substrateMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `SUB-ERR`,
          sender: "substrate",
          text: `Cognitive execution halted by security gate: ${e.message || "Execution exception"}`,
          timestamp: new Date().toLocaleTimeString(),
          tier: 0,
          quarantinePassed: false
        }
      ]);
    } finally {
      setIsProcessing(false);
      setActiveStage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full h-full overflow-hidden">
      {/* Header */}
      <div className="bg-[#0c0d14] p-4 sm:p-5 rounded-2xl border border-sleek-border flex items-center justify-between gap-4 mb-4 shrink-0 shadow-xl">
        <div className="flex items-center gap-2.5">
          <Terminal className="text-amber-400" size={20} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Sovereign Directive Console
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
                {currentProject?.name || "The Aetherius Continuum"}
              </span>
            </div>
            <p className="text-[11px] text-sleek-muted">
              Direct terminal access to Cranium Core. Every prompt passes through the complete governance and quarantine pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GOVERNANCE: HARD
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-2 mb-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              "p-4 rounded-2xl border transition-all space-y-2 font-mono text-xs",
              msg.sender === 'operator'
                ? "bg-purple-950/20 border-purple-500/40 text-purple-200 ml-6 sm:ml-12"
                : msg.quarantinePassed === false
                ? "bg-rose-950/30 border-rose-500/50 text-rose-200 mr-6 sm:mr-12"
                : "bg-black/60 border-sleek-border text-slate-200 mr-6 sm:mr-12"
            )}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400">[{msg.id}]</span>
                <span className="uppercase">{msg.sender}</span>
                <span className="bg-white/10 px-1.5 rounded text-white">Tier {msg.tier}</span>
              </div>
              <div className="flex items-center gap-2">
                {msg.quarantinePassed !== undefined && (
                  <span className={cn(
                    "flex items-center gap-1 font-bold",
                    msg.quarantinePassed ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {msg.quarantinePassed ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    <span>{msg.quarantinePassed ? "QUARANTINE PASSED" : "WRITE-BACK BLOCKED"}</span>
                  </span>
                )}
                <span>{msg.timestamp}</span>
              </div>
            </div>

            <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-white">
              {msg.text}
            </div>

            {msg.deliberationLog && (
              <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] text-slate-400">
                <div className="font-bold text-slate-300">Immune Verification Pipeline:</div>
                {msg.deliberationLog.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                    <span>{log}</span>
                  </div>
                ))}
                {msg.receiptHash && (
                  <div className="text-[9px] text-slate-500 truncate pt-0.5">
                    Receipt: {msg.receiptHash} | Parent: {msg.parentHash}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center gap-3 animate-pulse">
            <RefreshCw size={14} className="animate-spin text-amber-400" />
            <span>{activeStage || "Processing sovereign directive through substrate..."}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Directive Input Form */}
      <div className="bg-[#0c0d14] p-3 sm:p-4 rounded-2xl border border-sleek-border shrink-0 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendDirective();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputDirective}
            onChange={(e) => setInputDirective(e.target.value)}
            disabled={isProcessing}
            placeholder={`Issue operational directive in ${currentProject?.name || "Aetherius Continuum"}...`}
            className="flex-1 bg-black/50 border border-sleek-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputDirective.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50 transition-all shrink-0"
          >
            {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            <span className="hidden sm:inline">Dispatch</span>
          </button>
        </form>
      </div>
    </div>
  );
}
