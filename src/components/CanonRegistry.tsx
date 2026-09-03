import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Play, 
  RefreshCw, 
  BookOpen, 
  Lock, 
  Cpu, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Zap,
  ArrowRight,
  Layers,
  HelpCircle,
  Hash
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSubstrateProjects, ProjectAxiom } from '../core/useSubstrateProjects';

interface CanonRegistryProps {
  externalProjectManager?: ReturnType<typeof useSubstrateProjects>;
}

export function CanonRegistry({ externalProjectManager }: CanonRegistryProps) {
  const internalPM = useSubstrateProjects();
  const pm = externalProjectManager || internalPM;
  const { currentProject, addAxiom, deleteAxiom, validateAxiomConflict, arbitrateCandidate, addCanonNode } = pm;

  const [activeTab, setActiveTab] = useState<'constitution' | 'canon' | 'sandbox'>('constitution');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Propose New Axiom State
  const [isAddingAxiom, setIsAddingAxiom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('WORLD');
  const [newStatement, setNewStatement] = useState('');
  const [newEnforcement, setNewEnforcement] = useState<'HARD_BLOCK' | 'ESCALATE_WARNING'>('HARD_BLOCK');
  const [newIsImmutable, setNewIsImmutable] = useState(true);

  // Conflict Validator State
  const [isValidatingConflict, setIsValidatingConflict] = useState(false);
  const [conflictReport, setConflictReport] = useState<any>(null);

  // Add Canon Node State
  const [isAddingCanon, setIsAddingCanon] = useState(false);
  const [canonTitle, setCanonTitle] = useState('');
  const [canonType, setCanonType] = useState('ENTITY');
  const [canonContent, setCanonContent] = useState('');
  const [canonTags, setCanonTags] = useState('');

  // Dual-Lane Dynamic Arbitration Sandbox State
  const [testPremise, setTestPremise] = useState(
    "Captain Valen lost his left arm in the Siege of Vesta and relies exclusively on a high-tensile titanium-carbon prosthetic limb. Under no condition can he use a biological left hand."
  );
  const [testHypothesis, setTestHypothesis] = useState(
    "Valen gently raised his biological left hand to steady himself, flexing his flesh-and-blood fingers."
  );
  const [dynamicThreshold, setDynamicThreshold] = useState(0.85);
  const [forceLLMJudge, setForceLLMJudge] = useState(false);
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [arbitrationResult, setArbitrationResult] = useState<any>(null);

  const axioms = currentProject?.constitution || [];
  const canonNodes = currentProject?.canon || [];

  const filteredAxioms = axioms.filter(a => {
    const matchesCat = selectedCategory === 'all' || a.domain.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.statement.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredCanon = canonNodes.filter(c => {
    return c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Live Conflict Checking
  const handleCheckConflict = async () => {
    if (!newStatement.trim()) return;
    setIsValidatingConflict(true);
    try {
      const rep = await validateAxiomConflict(newStatement);
      setConflictReport(rep);
    } finally {
      setIsValidatingConflict(false);
    }
  };

  const handleCommitAxiom = async () => {
    if (!newTitle.trim() || !newStatement.trim()) return;
    if (conflictReport && !conflictReport.isValid) {
      if (!confirm("This proposed axiom has detected conflicts with existing constitutional invariants. Proceeding may create a contradiction. Commit anyway?")) {
        return;
      }
    }

    await addAxiom({
      title: newTitle.trim(),
      domain: newDomain,
      statement: newStatement.trim(),
      tier: 4,
      isImmutable: newIsImmutable,
      enforcement: newEnforcement
    });

    setNewTitle('');
    setNewStatement('');
    setConflictReport(null);
    setIsAddingAxiom(false);
  };

  const handleCommitCanonNode = async () => {
    if (!canonTitle.trim() || !canonContent.trim()) return;
    const tags = canonTags.split(',').map(t => t.trim()).filter(Boolean);
    await addCanonNode(canonType, canonTitle.trim(), canonContent.trim(), tags);
    setCanonTitle('');
    setCanonContent('');
    setCanonTags('');
    setIsAddingCanon(false);
  };

  const handleRunArbitration = async () => {
    if (!testPremise.trim() || !testHypothesis.trim() || isArbitrating) return;
    setIsArbitrating(true);
    setArbitrationResult(null);
    try {
      const res = await arbitrateCandidate(testPremise, testHypothesis, dynamicThreshold, forceLLMJudge);
      setArbitrationResult(res);
    } finally {
      setIsArbitrating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header with Project Badge */}
      <div className="bg-[#0c0d14] p-6 rounded-3xl border border-sleek-border flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-2xl">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
              <BookOpen size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              Creative Constitution & Canon Lattice
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
              DOMAIN: {currentProject?.name || "Aetherius Continuum"}
            </span>
          </div>
          <p className="text-xs text-sleek-muted max-w-3xl leading-relaxed">
            The immutable ground truth repository. Establishes character anchors, physical laws, and operational boundaries with real-time paradox prevention and dual-lane NLI arbitration.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-black/50 p-1 rounded-2xl border border-white/10 z-10 shrink-0 self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('constitution')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'constitution' ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            <Lock size={12} />
            <span>Constitution ({axioms.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('canon')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'canon' ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            <Layers size={12} />
            <span>Canon Nodes ({canonNodes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeTab === 'sandbox' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            <Zap size={12} />
            <span>Dual-Lane Sandbox</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CREATIVE CONSTITUTION & AXIOM WORKSPACE */}
      {activeTab === 'constitution' && (
        <div className="space-y-5">
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-black/40 rounded-xl border border-sleek-border">
              {['all', 'character', 'physics', 'world', 'security', 'technology'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
                    selectedCategory === cat ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter axioms..."
                  className="bg-black/50 border border-sleek-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500 w-44 sm:w-56"
                />
              </div>

              <button
                onClick={() => setIsAddingAxiom(!isAddingAxiom)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer transition-all shrink-0"
              >
                <Plus size={14} />
                <span>Propose Axiom</span>
              </button>
            </div>
          </div>

          {/* New Axiom Builder with Live Paradox/Conflict Engine */}
          {isAddingAxiom && (
            <div className="p-6 rounded-3xl bg-[#0c0d14] border border-purple-500/40 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="text-purple-400" size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
                    Propose & Anchor Sovereign Constitutional Invariant (Tier 4 Core)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Pre-Commit Conflict Verification Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Axiom Title:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Gravity Invariant on Vesta"
                    className="w-full bg-black/50 border border-sleek-border rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Domain Classification:</label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full bg-black/50 border border-sleek-border rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  >
                    <option value="CHARACTER">Character Invariant</option>
                    <option value="PHYSICS">Physical Law</option>
                    <option value="WORLD">Worldbuilding Canon</option>
                    <option value="TECHNOLOGY">Technology Invariant</option>
                    <option value="SECURITY">Security Monotonicity</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Enforcement Policy:</label>
                  <select
                    value={newEnforcement}
                    onChange={(e: any) => setNewEnforcement(e.target.value)}
                    className="w-full bg-black/50 border border-sleek-border rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  >
                    <option value="HARD_BLOCK">HARD_BLOCK (Instant Quarantine)</option>
                    <option value="ESCALATE_WARNING">ESCALATE_WARNING (Arbitration)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    Immutable Constitutional Statement:
                  </label>
                  <button
                    onClick={handleCheckConflict}
                    disabled={isValidatingConflict || !newStatement.trim()}
                    className="text-[10px] font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isValidatingConflict ? <RefreshCw size={11} className="animate-spin" /> : <ShieldAlert size={11} />}
                    <span>{isValidatingConflict ? "Checking..." : "Pre-Test for Paradox / Conflict"}</span>
                  </button>
                </div>
                <textarea
                  value={newStatement}
                  onChange={(e) => {
                    setNewStatement(e.target.value);
                    setConflictReport(null);
                  }}
                  rows={2}
                  placeholder="State the invariant rule clearly (e.g. 'Acoustic sound waves cannot propagate in a hard vacuum')..."
                  className="w-full bg-black/50 border border-sleek-border rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500 custom-scrollbar"
                />
              </div>

              {/* Conflict Diagnostic Alert */}
              {conflictReport && (
                <div className={cn(
                  "p-3.5 rounded-xl border text-xs font-mono space-y-1.5",
                  conflictReport.isValid 
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/50 text-rose-200"
                )}>
                  <div className="flex items-center gap-2 font-bold">
                    {conflictReport.isValid ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    <span>
                      {conflictReport.isValid
                        ? "Constitutional Invariance Check Passed: Zero paradoxes detected."
                        : `Constitutional Conflict Detected (${conflictReport.conflictCount} collision):`}
                    </span>
                  </div>
                  {!conflictReport.isValid && conflictReport.conflicts.map((c: any, idx: number) => (
                    <div key={idx} className="bg-black/50 p-2 rounded border border-rose-500/20 text-[11px] space-y-0.5">
                      <div className="font-bold text-rose-300">Collides with [{c.conflictingAxiomId}]: {c.conflictingTitle}</div>
                      <div className="text-slate-300">"{c.establishedStatement}"</div>
                      <div className="text-amber-300 text-[10px]">Reason: {c.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsImmutable}
                    onChange={(e) => setNewIsImmutable(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  <span>Lock as Tier 4 Immutable Anchor</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddingAxiom(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommitAxiom}
                    disabled={!newTitle.trim() || !newStatement.trim()}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all"
                  >
                    Anchor to Constitution
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Axioms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAxioms.map(axiom => (
              <div 
                key={axiom.id}
                className="p-5 rounded-2xl bg-[#0c0d14] border border-sleek-border space-y-3 font-mono text-xs hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">[{axiom.id}]</span>
                      <span className="text-[10px] bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded uppercase font-bold border border-purple-500/30">
                        {axiom.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        TIER {axiom.tier}
                      </span>
                      {axiom.isImmutable && (
                        <span title="Immutable Sovereign Anchor" className="text-purple-400">
                          <Lock size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-xs">{axiom.title}</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5 font-sans">
                    "{axiom.statement}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                  <span className={cn(
                    "font-bold uppercase",
                    axiom.enforcement === 'HARD_BLOCK' ? "text-rose-400" : "text-amber-400"
                  )}>
                    {axiom.enforcement || "HARD_BLOCK"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTestPremise(axiom.statement);
                        setTestHypothesis("");
                        setActiveTab('sandbox');
                      }}
                      className="text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <span>Load into NLI Gate</span>
                      <Sparkles size={11} />
                    </button>
                    {!axiom.isImmutable && (
                      <button
                        onClick={() => deleteAxiom(axiom.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Rescind Axiom"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: CANON MEMORY LATTICE */}
      {activeTab === 'canon' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-wider">
                Permanent Canon Entities & Observations
              </h3>
              <p className="text-[11px] text-slate-400">
                Nodes committed through the write-back gate or verified by sovereign directives.
              </p>
            </div>

            <button
              onClick={() => setIsAddingCanon(!isAddingCanon)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
            >
              <Plus size={14} />
              <span>Add Canon Node</span>
            </button>
          </div>

          {isAddingCanon && (
            <div className="p-5 rounded-2xl bg-[#0c0d14] border border-purple-500/40 space-y-3">
              <h4 className="text-xs font-bold text-purple-300 uppercase">New Canon Memory Node</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={canonTitle}
                  onChange={(e) => setCanonTitle(e.target.value)}
                  placeholder="Entity / Location / Tech Title"
                  className="bg-black/50 border border-sleek-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
                <select
                  value={canonType}
                  onChange={(e) => setCanonType(e.target.value)}
                  className="bg-black/50 border border-sleek-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="ENTITY">Entity / Character</option>
                  <option value="LOCATION">Location / Anomaly</option>
                  <option value="TECHNOLOGY">Technology / Mechanism</option>
                  <option value="OBSERVATION">Promoted Observation</option>
                </select>
              </div>
              <textarea
                value={canonContent}
                onChange={(e) => setCanonContent(e.target.value)}
                placeholder="Ground truth description..."
                rows={2}
                className="w-full bg-black/50 border border-sleek-border rounded-xl p-3 text-xs text-white font-mono"
              />
              <input
                type="text"
                value={canonTags}
                onChange={(e) => setCanonTags(e.target.value)}
                placeholder="Tags (comma separated, e.g. protagonist, naval, armor)"
                className="w-full bg-black/50 border border-sleek-border rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddingCanon(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                <button onClick={handleCommitCanonNode} className="px-4 py-1.5 bg-purple-600 rounded-xl text-xs font-bold text-white">Save Node</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCanon.map(node => (
              <div key={node.id} className="p-4 rounded-2xl bg-[#0c0d14] border border-sleek-border space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-400 font-bold">[{node.id}]</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 font-bold border border-purple-500/20">{node.type}</span>
                </div>
                <h4 className="font-bold text-white text-xs">{node.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{node.content}</p>
                {node.tags && node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {node.tags.map((t, idx) => (
                      <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DUAL-LANE DYNAMIC ARBITRATION SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#0c0d14] rounded-3xl border border-sleek-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sleek-border pb-3">
              <div className="flex items-center gap-2">
                <Zap className="text-indigo-400" size={18} />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  Dual-Lane Dynamic Contradiction Gate
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Lane 1 (Heuristic) → Dynamic Threshold → Lane 2 (LLM Judge)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-purple-400 block mb-1 font-bold">
                  Canonical Premise (Established Invariant):
                </label>
                <textarea
                  value={testPremise}
                  onChange={(e) => setTestPremise(e.target.value)}
                  rows={3}
                  className="w-full bg-black/50 border border-sleek-border rounded-2xl p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500 custom-scrollbar"
                  placeholder="Enter canonical ground truth..."
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-cyan-400 block mb-1 font-bold">
                  Candidate Hypothesis (Provisional Output):
                </label>
                <textarea
                  value={testHypothesis}
                  onChange={(e) => setTestHypothesis(e.target.value)}
                  rows={3}
                  className="w-full bg-black/50 border border-sleek-border rounded-2xl p-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 custom-scrollbar"
                  placeholder="Enter provisional candidate output to evaluate..."
                />
              </div>

              {/* Dynamic Threshold Slider */}
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <Sliders size={13} className="text-amber-400" />
                    Dynamic Escalation Threshold:
                  </span>
                  <span className="text-amber-400 font-bold">{(dynamicThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={dynamicThreshold}
                  onChange={(e) => setDynamicThreshold(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>0.50 (Aggressive Escalation)</span>
                  <span>0.85 (Standard Balanced)</span>
                  <span>0.95 (Ultra Fast-Path)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceLLMJudge}
                    onChange={(e) => setForceLLMJudge(e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Force Full Gemini 3.7 LLM-Judge Arbitration</span>
                </label>

                <button
                  onClick={handleRunArbitration}
                  disabled={isArbitrating || !testPremise.trim() || !testHypothesis.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isArbitrating ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  <span>{isArbitrating ? "Arbitrating..." : "Run Dual-Lane Gate"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Arbitration Telemetry */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0c0d14] rounded-3xl border border-sleek-border p-5 space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Cpu size={15} className="text-cyan-400" />
                <span>Arbitration Telemetry & Verdict</span>
              </h4>

              {arbitrationResult ? (
                <div className="space-y-3">
                  {/* Verdict Badge */}
                  <div className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between",
                    arbitrationResult.verdict === 'QUARANTINE_REJECT'
                      ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
                      : "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                  )}>
                    <div className="flex items-center gap-2.5">
                      {arbitrationResult.verdict === 'QUARANTINE_REJECT' ? (
                        <ShieldAlert size={22} className="text-rose-400" />
                      ) : (
                        <ShieldCheck size={22} className="text-emerald-400" />
                      )}
                      <div>
                        <div className="text-xs font-black uppercase">
                          {arbitrationResult.verdict === 'QUARANTINE_REJECT' ? "QUARANTINE REJECT (PROTECT)" : "PERMITTED TO COMMIT"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-300">
                          Mode: {arbitrationResult.arbitrationMode}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <div className="font-bold text-amber-300">{(arbitrationResult.compositeConfidence * 100).toFixed(1)}%</div>
                      <div className="text-slate-400">{arbitrationResult.totalDurationMs}ms</div>
                    </div>
                  </div>

                  {/* Lane 1 Breakdown */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                      <span>LANE 1: HEURISTIC POLARITY</span>
                      <span className="text-slate-400">{arbitrationResult.lane1_proxy?.latencyMs || 1}ms</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Polarity Collision: <span className="font-bold">{arbitrationResult.lane1_proxy?.contradictionDetected ? "YES (Flagged)" : "NO (Clean)"}</span>
                    </div>
                    {arbitrationResult.lane1_proxy?.matchedOppositionTokens?.length > 0 && (
                      <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded">
                        Matched: {arbitrationResult.lane1_proxy.matchedOppositionTokens.join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Lane 2 Breakdown */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                      <span>LANE 2: GEMINI 3.7 NLI JUDGE</span>
                      <span className="text-slate-400">
                        {arbitrationResult.lane2_judge?.escalated ? `${arbitrationResult.lane2_judge?.latencyMs || 0}ms` : "BYPASSED (Fast-Path)"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Semantic Verdict: <span className="font-bold">{arbitrationResult.lane2_judge?.verdict || "N/A"}</span>
                    </div>
                    {arbitrationResult.lane2_judge?.reasoning && (
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-black/30 p-2 rounded">
                        "{arbitrationResult.lane2_judge.reasoning}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-slate-500 text-xs font-mono">
                  Execute the dual-lane gate to view real-time latency decomposition, heuristic opposition tokens, and LLM judge arbitration.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
