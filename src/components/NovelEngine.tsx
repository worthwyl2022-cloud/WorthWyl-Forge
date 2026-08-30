import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  GitBranch,
  Layers,
  ChevronRight,
  ChevronLeft,
  FileText,
  Eye,
  RefreshCw,
  Sliders,
  Bookmark,
  Compass,
  Zap,
  TrendingUp,
  Download,
  Share2,
  Check,
  Cpu
} from "lucide-react";
import { Novel, Episode, EpisodeSnapshot, ContinuityState } from "../models/domain";
import { EpisodicMemoryStore } from "../core/memory/EpisodicMemoryStore";
import { taskOrchestrator } from "../core/os/TaskOrchestrator";
import { ContinuityTracker } from "../core/coherence/ContinuityTracker";
import { VisualTextCoherenceEngine } from "../core/coherence/VisualTextCoherenceEngine";
import { cn } from "../lib/utils";

export function NovelEngine() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [activeNovelId, setActiveNovelId] = useState<string>("");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [snapshots, setSnapshots] = useState<EpisodeSnapshot[]>([]);
  const [continuity, setContinuity] = useState<ContinuityState>({
    characters: {},
    locations: {},
    openThreads: [],
    resolvedThreads: [],
  });

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLoopStep, setCurrentLoopStep] = useState<string>("");
  const [userDirective, setUserDirective] = useState("");
  const [showNewNovelModal, setShowNewNovelModal] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"continuity" | "snapshots" | "characters" | "threads">("continuity");
  const [selectedSnapshotModal, setSelectedSnapshotModal] = useState<EpisodeSnapshot | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // New Novel Form State
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("Speculative Fiction");
  const [newPremise, setNewPremise] = useState("");

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const list = await EpisodicMemoryStore.listNovels();
      setNovels(list);
      if (list.length > 0) {
        setActiveNovelId(list[0].id);
      }
    }
    loadData();
  }, []);

  // Sync state whenever activeNovelId changes
  useEffect(() => {
    if (!activeNovelId) return;
    async function syncNovel() {
      const [eps, snaps] = await Promise.all([
        EpisodicMemoryStore.getEpisodes(activeNovelId),
        EpisodicMemoryStore.getAllSnapshots(activeNovelId),
      ]);
      setEpisodes(eps);
      setSnapshots(snaps);
      const state = ContinuityTracker.buildState(snaps);
      setContinuity(state);

      if (eps.length > 0) {
        setCurrentEpisodeIndex(eps.length - 1);
      } else {
        setCurrentEpisodeIndex(0);
      }
    }
    syncNovel();
  }, [activeNovelId]);

  const activeNovel = novels.find((n) => n.id === activeNovelId) || novels[0];
  const activeEpisode = episodes[currentEpisodeIndex] || null;

  // Handle autonomous episode generation loop
  const handleWriteNextEpisode = async () => {
    if (!activeNovelId || isGenerating) return;
    setIsGenerating(true);
    setCurrentLoopStep("Initializing WorthWyl OS v3 Cognitive Orchestrator...");

    try {
      const result = await taskOrchestrator.writeNextEpisode(
        activeNovelId,
        userDirective.trim() || undefined,
        (step) => setCurrentLoopStep(step)
      );

      // Refresh records
      const [updatedEps, updatedSnaps] = await Promise.all([
        EpisodicMemoryStore.getEpisodes(activeNovelId),
        EpisodicMemoryStore.getAllSnapshots(activeNovelId),
      ]);
      setEpisodes(updatedEps);
      setSnapshots(updatedSnaps);
      setContinuity(result.continuity);
      setCurrentEpisodeIndex(updatedEps.length - 1);
      setUserDirective("");
    } catch (error) {
      console.error("Episode generation failure:", error);
      alert("Encountered an issue during autonomous episode generation. Please check connectivity or API key.");
    } finally {
      setIsGenerating(false);
      setCurrentLoopStep("");
    }
  };

  const handleCreateNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const novel: Novel = {
      id: `novel_${Date.now().toString(36)}`,
      title: newTitle.trim(),
      genre: newGenre.trim() || "Fiction",
      premise: newPremise.trim() || undefined,
      status: "in_progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await EpisodicMemoryStore.saveNovel(novel);
    const updated = await EpisodicMemoryStore.listNovels();
    setNovels(updated);
    setActiveNovelId(novel.id);
    setShowNewNovelModal(false);
    setNewTitle("");
    setNewPremise("");
  };

  const handleExportManuscript = () => {
    if (!activeNovel) return;
    let manuscript = `# ${activeNovel.title}\nGenre: ${activeNovel.genre}\n\n`;
    if (activeNovel.premise) manuscript += `**Premise**: ${activeNovel.premise}\n\n---\n\n`;

    episodes.forEach((ep) => {
      manuscript += `## Episode ${ep.episodeNumber}${ep.title ? `: ${ep.title}` : ""}\n\n${ep.text}\n\n---\n\n`;
    });

    const blob = new Blob([manuscript], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNovel.title.toLowerCase().replace(/\s+/g, "_")}_manuscript.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEpisode = () => {
    if (!activeEpisode) return;
    navigator.clipboard.writeText(activeEpisode.text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div id="novel-engine-root" className="flex h-full w-full bg-[#0b0f17] text-slate-100 font-sans overflow-hidden">
      {/* LEFT NAVIGATION: Novels & Episode Hierarchy */}
      <div className="w-72 bg-[#0d131f]/95 border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-100 tracking-tight">WorthWyl OS v3</h1>
                <p className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase">Novel Engine</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewNovelModal(true)}
              className="p-1.5 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition text-xs flex items-center space-x-1"
              title="Create New Novel"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Novel Selector */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Selected Novel</label>
            <select
              value={activeNovelId}
              onChange={(e) => setActiveNovelId(e.target.value)}
              className="w-full bg-[#131b2e] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {novels.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Episode List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Episodes ({episodes.length})
            </span>
            <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
              {activeNovel?.genre || "Fiction"}
            </span>
          </div>

          {episodes.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg my-2">
              <Sparkles className="w-6 h-6 text-indigo-400/60 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No episodes generated yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click &quot;Write Next Episode&quot; to synthesize Episode 1.
              </p>
            </div>
          ) : (
            episodes.map((ep, idx) => {
              const snap = snapshots.find((s) => s.episodeNumber === ep.episodeNumber);
              const isActive = idx === currentEpisodeIndex;
              return (
                <button
                  key={ep.id}
                  onClick={() => setCurrentEpisodeIndex(idx)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg transition-all flex flex-col space-y-1 text-xs border",
                    isActive
                      ? "bg-indigo-950/40 border-indigo-500/50 shadow-sm"
                      : "bg-[#111827]/40 border-slate-800/40 hover:bg-[#151f33]/60 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Episode {ep.episodeNumber}</span>
                    {snap?.pacing && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {snap.pacing}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {snap?.thematicSummary || ep.text.slice(0, 60)}...
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Novel Metadata Footer */}
        {activeNovel && (
          <div className="p-3 bg-[#0a0e17] border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-emerald-400 font-medium capitalize">{activeNovel.status.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span>Continuity Entities</span>
              <span className="text-indigo-300 font-mono">
                {Object.keys(continuity.characters).length} Chars • {Object.keys(continuity.locations).length} Locs
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CENTER STAGE: Writer Workspace & Manuscript Display */}
      <div className="flex-1 flex flex-col bg-[#0b0f17] overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="h-14 border-b border-slate-800/80 px-6 flex items-center justify-between bg-[#0e1422]/90 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center space-x-2">
              <span>{activeNovel?.title || "Novel Workspace"}</span>
              {activeEpisode && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50 font-normal">
                  Episode {activeEpisode.episodeNumber} of {episodes.length}
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyEpisode}
              disabled={!activeEpisode}
              className="px-3 py-1.5 rounded-lg bg-[#141d2f] hover:bg-[#1a253c] text-slate-300 text-xs border border-slate-700/60 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{copiedNotification ? "Copied" : "Copy Text"}</span>
            </button>

            <button
              onClick={handleExportManuscript}
              disabled={episodes.length === 0}
              className="px-3 py-1.5 rounded-lg bg-[#141d2f] hover:bg-[#1a253c] text-slate-300 text-xs border border-slate-700/60 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Manuscript</span>
            </button>

            {/* Main Cognitive Action */}
            <button
              onClick={handleWriteNextEpisode}
              disabled={isGenerating}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Write Next Episode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cognitive Loop Progress Bar */}
        {isGenerating && (
          <div className="bg-indigo-950/80 border-b border-indigo-800/60 px-6 py-2.5 flex items-center justify-between text-xs text-indigo-200">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="font-mono">{currentLoopStep}</span>
            </div>
            <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
              Cognitive Loop Active
            </span>
          </div>
        )}

        {/* Author Directive Bar */}
        <div className="px-6 py-2.5 bg-[#090d15] border-b border-slate-800/60 flex items-center space-x-3">
          <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={userDirective}
            onChange={(e) => setUserDirective(e.target.value)}
            placeholder="Optional Author Directive (e.g. 'Marcus reveals his past connection to the Syndicate, fast pacing')"
            className="flex-1 bg-[#101726] border border-slate-700/60 rounded-md px-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Reading & Manuscript Page Viewport */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          {activeEpisode ? (
            <div className="max-w-3xl w-full bg-[#0d1320] border border-slate-800 rounded-xl p-8 sm:p-12 shadow-2xl space-y-6 relative">
              {/* Manuscript Page Header */}
              <div className="text-center pb-6 border-b border-slate-800/80 space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-mono font-bold">
                  {activeNovel?.title} • Episode {activeEpisode.episodeNumber}
                </span>
                <h3 className="text-2xl font-serif font-bold text-slate-100">
                  {activeEpisode.title || `Chapter ${activeEpisode.episodeNumber}`}
                </h3>
                <div className="flex items-center justify-center space-x-4 text-xs text-slate-400 pt-1">
                  <span>{activeEpisode.text.split(/\s+/).filter(Boolean).length} Words</span>
                  <span>•</span>
                  <span>{new Date(activeEpisode.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Manuscript Body Prose */}
              <div className="prose prose-invert max-w-none text-slate-300 font-serif leading-relaxed text-[15px] space-y-4">
                {activeEpisode.text.split("\n\n").map((paragraph, pIdx) => (
                  <p key={pIdx} className="indent-6 leading-7">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="pt-8 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => setCurrentEpisodeIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentEpisodeIndex === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#141d2f] hover:bg-[#1a253c] disabled:opacity-30 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span>
                  Episode {currentEpisodeIndex + 1} of {episodes.length}
                </span>
                <button
                  onClick={() => setCurrentEpisodeIndex((prev) => Math.min(episodes.length - 1, prev + 1))}
                  disabled={currentEpisodeIndex >= episodes.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-[#141d2f] hover:bg-[#1a253c] disabled:opacity-30 flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center max-w-md my-auto space-y-4 p-8 border border-dashed border-slate-800 rounded-2xl bg-[#0e1424]/40">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-100">Ready to Begin Novel Generation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  WorthWyl OS v3 orchestrates episodic memory, multimodal screenshots, and continuity tracking into long-form coherence.
                </p>
              </div>
              <button
                onClick={handleWriteNextEpisode}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Episode 1</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Continuity & Episodic Memory Snapshot Center */}
      <div className="w-80 bg-[#0d131f]/95 border-l border-slate-800/80 flex flex-col shrink-0">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800/80 bg-[#0a0f18]">
          <button
            onClick={() => setActiveSidebarTab("continuity")}
            className={cn(
              "flex-1 py-3 text-xs font-medium text-center border-b-2 transition flex items-center justify-center space-x-1.5",
              activeSidebarTab === "continuity"
                ? "border-indigo-500 text-indigo-400 bg-indigo-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Continuity</span>
          </button>
          <button
            onClick={() => setActiveSidebarTab("snapshots")}
            className={cn(
              "flex-1 py-3 text-xs font-medium text-center border-b-2 transition flex items-center justify-center space-x-1.5",
              activeSidebarTab === "snapshots"
                ? "border-indigo-500 text-indigo-400 bg-indigo-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Snapshots ({snapshots.length})</span>
          </button>
          <button
            onClick={() => setActiveSidebarTab("threads")}
            className={cn(
              "flex-1 py-3 text-xs font-medium text-center border-b-2 transition flex items-center justify-center space-x-1.5",
              activeSidebarTab === "threads"
                ? "border-indigo-500 text-indigo-400 bg-indigo-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Threads</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {activeSidebarTab === "continuity" && (
            <div className="space-y-5">
              {/* Characters Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Characters ({Object.keys(continuity.characters).length})</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {Object.keys(continuity.characters).length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No characters registered yet.</p>
                  ) : (
                    Object.entries(continuity.characters).map(([name, data]) => (
                      <div
                        key={name}
                        className="p-2 rounded-md bg-[#131b2e]/60 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-200">{name}</span>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          Ep {data.firstSeen} → {data.lastSeen}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Locations Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Locations ({Object.keys(continuity.locations).length})</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {Object.keys(continuity.locations).length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No locations tracked yet.</p>
                  ) : (
                    Object.entries(continuity.locations).map(([name, data]) => (
                      <div
                        key={name}
                        className="p-2 rounded-md bg-[#131b2e]/60 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300">{name}</span>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          Ep {data.firstSeen} → {data.lastSeen}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pacing & Tone Trends */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pacing Cadence</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#111827]/70 border border-slate-800/80 space-y-2">
                  {snapshots.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">Awaiting episode generation.</p>
                  ) : (
                    <div className="flex items-end space-x-1.5 h-14 pt-2">
                      {snapshots.map((s) => {
                        const heightClass =
                          s.pacing === "fast" ? "h-12 bg-indigo-500" : s.pacing === "medium" ? "h-8 bg-purple-500" : "h-4 bg-slate-600";
                        return (
                          <div key={s.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className={cn("w-full rounded-t transition-all", heightClass)} />
                            <span className="text-[9px] text-slate-400 font-mono">{s.episodeNumber}</span>
                            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] p-1 rounded shadow whitespace-nowrap z-20">
                              Ep {s.episodeNumber}: {s.pacing} ({s.tone})
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cognitive Coherence Audit (VisualTextCoherenceEngine) */}
              {(() => {
                const audit = VisualTextCoherenceEngine.auditCoherence(snapshots);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      <div className="flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Coherence Audit</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {Math.round(audit.coherenceScore * 100)}% Coherent
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#111827]/70 border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Pacing Trajectory:</span>
                        <span className="text-slate-200 capitalize font-medium">{audit.pacingTrajectory}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Character Persistence:</span>
                        <span className="text-slate-200 font-medium">
                          {Math.round(audit.characterContinuityScore * 100)}%
                        </span>
                      </div>
                      {audit.warnings.length > 0 && (
                        <div className="pt-1 text-[11px] text-amber-300/90 space-y-1">
                          {audit.warnings.map((w, idx) => (
                            <p key={idx}>⚠️ {w}</p>
                          ))}
                        </div>
                      )}
                      {audit.recommendations.length > 0 && (
                        <div className="pt-1 border-t border-slate-800 text-[11px] text-indigo-300/90 space-y-1">
                          {audit.recommendations.map((r, idx) => (
                            <p key={idx}>💡 {r}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeSidebarTab === "snapshots" && (
            <div className="space-y-3">
              {snapshots.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No snapshots captured yet.</p>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    onClick={() => setSelectedSnapshotModal(snap)}
                    className="p-2.5 rounded-lg bg-[#131b2e]/60 border border-slate-800/80 hover:border-indigo-500/60 cursor-pointer transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Snapshot Ep. {snap.episodeNumber}</span>
                      <span className="text-[10px] text-indigo-400 font-mono">{snap.tone}</span>
                    </div>

                    {/* Screenshot visual thumbnail */}
                    {snap.screenshotUrl && (
                      <div className="h-28 w-full rounded overflow-hidden border border-slate-800 relative bg-black/40">
                        <img
                          src={snap.screenshotUrl}
                          alt={`Episode ${snap.episodeNumber} Snapshot`}
                          className="w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 transition"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[9px] text-slate-300 font-mono">
                            {snap.characters.length} characters • {snap.pacing}
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 line-clamp-2">{snap.thematicSummary || snap.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSidebarTab === "threads" && (
            <div className="space-y-4">
              {/* Open Threads */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Open Narrative Threads ({continuity.openThreads.length})</span>
                </span>
                <div className="space-y-1.5">
                  {continuity.openThreads.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No unresolved threads active.</p>
                  ) : (
                    continuity.openThreads.map((thread, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 leading-snug"
                      >
                        {thread}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Resolved Threads */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolved Threads ({continuity.resolvedThreads.length})</span>
                </span>
                <div className="space-y-1.5">
                  {continuity.resolvedThreads.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No resolved threads yet.</p>
                  ) : (
                    continuity.resolvedThreads.map((thread, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300/80 leading-snug"
                      >
                        {thread}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Create New Novel */}
      {showNewNovelModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Initialize New Novel</span>
              </h3>
              <button
                onClick={() => setShowNewNovelModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNovel} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Novel Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., The Obsidian Echo"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Genre</label>
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="e.g., Neo-Noir Sci-Fi, Dark Fantasy, Psychological Thriller"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Core Premise & Lore</label>
                <textarea
                  rows={3}
                  value={newPremise}
                  onChange={(e) => setNewPremise(e.target.value)}
                  placeholder="Summarize the core conflict, setting, and stakes..."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewNovelModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow"
                >
                  Create Novel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: Snapshot Detail Viewer */}
      {selectedSnapshotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Episode {selectedSnapshotModal.episodeNumber} Snapshot Analysis
                </h3>
                <p className="text-xs text-indigo-400 font-mono">
                  Tone: {selectedSnapshotModal.tone} • Pacing: {selectedSnapshotModal.pacing}
                </p>
              </div>
              <button
                onClick={() => setSelectedSnapshotModal(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            {selectedSnapshotModal.screenshotUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-800 max-h-72">
                <img
                  src={selectedSnapshotModal.screenshotUrl}
                  alt={`Episode ${selectedSnapshotModal.episodeNumber}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#131b2e] rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300">Active Characters:</span>
                <p className="text-slate-400">{selectedSnapshotModal.characters.join(", ") || "None listed"}</p>
              </div>
              <div className="p-3 bg-[#131b2e] rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300">Locations:</span>
                <p className="text-slate-400">{selectedSnapshotModal.locations.join(", ") || "None listed"}</p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-300">Thematic Summary:</span>
              <p className="p-3 bg-[#131b2e] rounded-lg border border-slate-800 text-slate-300 leading-relaxed">
                {selectedSnapshotModal.thematicSummary || selectedSnapshotModal.text}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSnapshotModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
