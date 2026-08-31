import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  Sparkles, 
  BookOpen, 
  Brain, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Play, 
  Pause,
  CheckCircle2, 
  Activity, 
  ShieldAlert, 
  FileCode, 
  Terminal, 
  Layers, 
  RotateCcw,
  Zap,
  Check
} from "lucide-react";
import { cn } from "../lib/utils";

export interface TourStation {
  id: string;
  stepNumber: number;
  view: 'novel' | 'studio' | 'writer' | 'tracker';
  trackerTab?: 'substrate' | 'architecture' | 'duallane' | 'receipts' | 'benchmark';
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  liveActionLabel: string;
  liveActionDescription: string;
  keyFeatures: string[];
  spotlightHint: string;
}

const TOUR_STATIONS: TourStation[] = [
  {
    id: "station-novel",
    stepNumber: 1,
    view: "novel",
    title: "Novel Engine v3 — Autonomous Episodic Coherence",
    badge: "EPISODIC CONTINUITY",
    subtitle: "Multi-Tier Memory & Snapshot State Machine",
    description: "Experience how WorthWyl OS synthesizes long-form fiction without continuity drift. It isolates working memory into frozen episodic snapshots and evaluates character constraints before writing.",
    liveActionLabel: "Inspect Novel Continuity",
    liveActionDescription: "Look at the Left Navigation for Chapters, Center Stage for Manuscript prose, and Right Sidebar for Episodic Memory Snapshots.",
    keyFeatures: [
      "Episodic snapshot ledger preventing character amnesia",
      "Dynamic narrative thread resolution tracker",
      "One-click manuscript and chapter JSON export"
    ],
    spotlightHint: "Notice the 'Episodic Memory Snapshot' on the right panel tracking open narrative threads."
  },
  {
    id: "station-studio",
    stepNumber: 2,
    view: "studio",
    title: "AI Studio — Multimodal Director & Vision Conditioning",
    badge: "DIRECTOR COGNITION",
    subtitle: "Real-Time Prompt Steering & Contextual Recall",
    description: "The creative command center. Formulate complex story worlds with multimodal visual grounding, director steering controls, and deep reasoning deliberation.",
    liveActionLabel: "Explore Director Controls",
    liveActionDescription: "Toggle Deep Reasoning in the top header or select character personas to steer generative tone.",
    keyFeatures: [
      "Multimodal screenshot grounding & vision continuity",
      "Deep Thought deliberation toggle for complex logic",
      "Thread persistence across multiple creative projects"
    ],
    spotlightHint: "The top navigation bar contains Deep Reasoning and conversation history controls."
  },
  {
    id: "station-writer",
    stepNumber: 3,
    view: "writer",
    title: "Script & Writer Forge — World Canon & Character Ledger",
    badge: "CANON & SCRIPTS",
    subtitle: "Deterministic Character Rules & Scene Graph",
    description: "Maintain immutable world rules. Characters, timelines, and locations are stored in a relational ledger so generated dialogue strictly adheres to established canon.",
    liveActionLabel: "Review Character Ledger",
    liveActionDescription: "Examine character arcs, psychological profiles, and scene beat graphs.",
    keyFeatures: [
      "Immutable world canon rules ledger",
      "Character psychological state & goal trackers",
      "Scene beat graph with conflict pacing analysis"
    ],
    spotlightHint: "Check the Character Matrix and Scene Timelines to verify adherence to backstory."
  },
  {
    id: "station-substrate",
    stepNumber: 4,
    view: "tracker",
    trackerTab: "substrate",
    title: "Resonance Field — Particle Physics & Kinetic Metacognition",
    badge: "PARTICLE KINETICS",
    subtitle: "Live Energy Distribution & Field Temperature",
    description: "Watch thoughts collide as physical particles in a simulated resonance space. Conflict pressure directly modulates LLM temperature and deliberation rounds.",
    liveActionLabel: "Interact With Particle Field",
    liveActionDescription: "Click anywhere on the particle canvas to inject kinetic energy or switch directives (PROTECT / DEEPEN / REST).",
    keyFeatures: [
      "Dynamic velocity vectors driven by semantic tension",
      "Real-time affective temperature & coherence gauges",
      "Directive steering modifying operational physics"
    ],
    spotlightHint: "Observe how high conflict pressure automatically drops sampling temperature to 0.20."
  },
  {
    id: "station-duallane",
    stepNumber: 5,
    view: "tracker",
    trackerTab: "duallane",
    title: "Dual-Lane NLI Contradiction Engine & Epistemic Immune Layer",
    badge: "EPISTEMIC IMMUNE",
    subtitle: "Live Adversarial Attack Interception & Quarantine Routing",
    description: "See the immune layer intercept canon tampering. Hard-axiom violations trigger Rule SEC-HARD-001, blocking silent live memory contamination.",
    liveActionLabel: "Simulate Adversarial Injection",
    liveActionDescription: "Test how corrupt prompts are evaluated, flagged with 0.964 contradiction confidence, and quarantined.",
    keyFeatures: [
      "Dual-lane contradiction proxy (lexical + paraphrase clusters)",
      "Evaluation-gated write-back protecting live memory",
      "Quarantine inbox with human approval workflows"
    ],
    spotlightHint: "Failed/rejected output never silently enters live memory — it requires human review."
  },
  {
    id: "station-receipts",
    stepNumber: 6,
    view: "tracker",
    trackerTab: "receipts",
    title: "Cryptographic RFC-8785 Receipts & Benchmark Invariants",
    badge: "DETERMINISTIC PROOF",
    subtitle: "SHA-256 Merkle Audit Trail & Acquisition Package",
    description: "Every reasoning move produces a verifiable RFC-8785 canonical JSON execution receipt with SHA-256 cryptographic digests and frozen drift invariants.",
    liveActionLabel: "Verify Cryptographic Merkle Chain",
    liveActionDescription: "Inspect the raw JSON payload, forensic digests, and python verification CLI snippet.",
    keyFeatures: [
      "Deterministic SHA-256 Merkle state chaining",
      "RFC-8785 canonicalized JSON audit proofs",
      "One-click Diligence Acquisition Data Room export"
    ],
    spotlightHint: "Any external auditor can run the Python CLI snippet to verify receipts offline."
  }
];

interface InteractiveAppTourProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'novel' | 'studio' | 'writer' | 'tracker';
  onNavigateView: (view: 'novel' | 'studio' | 'writer' | 'tracker') => void;
  onSelectTrackerTab?: (tab: 'substrate' | 'architecture' | 'duallane' | 'receipts' | 'benchmark') => void;
}

export function InteractiveAppTour({
  isOpen,
  onClose,
  activeView,
  onNavigateView,
  onSelectTrackerTab
}: InteractiveAppTourProps) {
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(15);
  const [completedStations, setCompletedStations] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const station = TOUR_STATIONS[currentStationIdx];

  // Sync active view and tab when station changes
  useEffect(() => {
    if (!isOpen || !station) return;
    onNavigateView(station.view);
    if (station.trackerTab && onSelectTrackerTab) {
      onSelectTrackerTab(station.trackerTab);
    }
  }, [currentStationIdx, isOpen]);

  // Auto-advance timer
  useEffect(() => {
    if (!isOpen || !isAutoAdvancing) return;

    const interval = setInterval(() => {
      setAutoAdvanceTimer((prev) => {
        if (prev <= 1) {
          handleNext();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isAutoAdvancing, currentStationIdx]);

  const handleNext = () => {
    if (currentStationIdx < TOUR_STATIONS.length - 1) {
      setCompletedStations(prev => [...new Set([...prev, station.id])]);
      setCurrentStationIdx(prev => prev + 1);
      setAutoAdvanceTimer(15);
      setActionFeedback(null);
    } else {
      // Finished all stations
      setCompletedStations(prev => [...new Set([...prev, station.id])]);
      setIsAutoAdvancing(false);
      setActionFeedback("🎉 Full Live System Tour Complete! You have inspected every active layer of WorthWyl OS.");
    }
  };

  const handlePrev = () => {
    if (currentStationIdx > 0) {
      setCurrentStationIdx(prev => prev - 1);
      setAutoAdvanceTimer(15);
      setActionFeedback(null);
    }
  };

  const handleSelectStation = (index: number) => {
    setCurrentStationIdx(index);
    setAutoAdvanceTimer(15);
    setActionFeedback(null);
  };

  const handleTriggerLiveDemonstration = () => {
    setActionFeedback(`⚡ Live Demonstration Triggered for ${station.title}! Exploring live interactive controls...`);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-6 z-50 pointer-events-none flex justify-center">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="pointer-events-auto max-w-4xl w-full bg-[#08080f]/95 border-2 border-amber-500/50 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-2xl p-4 sm:p-5 text-white flex flex-col gap-3 font-sans"
      >
        {/* Top Header & Progress */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] sm:text-xs font-black uppercase tracking-wider font-mono shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              STATION {station.stepNumber} OF {TOUR_STATIONS.length}
            </span>
            <span className="text-xs font-bold text-amber-300 font-mono hidden xs:inline">
              {station.badge}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
              • Live Active Screen: <strong className="text-white uppercase">{station.view}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoAdvancing(!isAutoAdvancing)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer flex items-center gap-1",
                isAutoAdvancing 
                  ? "bg-amber-500/20 text-amber-300 border-amber-400" 
                  : "bg-white/5 text-neutral-400 border-white/10 hover:text-white"
              )}
              title="Toggle Auto-Advance Tour"
            >
              {isAutoAdvancing ? <Pause size={12} /> : <Play size={12} />}
              <span className="hidden sm:inline">{isAutoAdvancing ? `Auto (${autoAdvanceTimer}s)` : "Auto-Pilot"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-300 transition-all cursor-pointer"
              title="Exit Interactive Tour"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Station Content Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Main Station Explanation */}
          <div className="md:col-span-8 space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>{station.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {station.description}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {station.keyFeatures.map((feat, idx) => (
                <span 
                  key={idx}
                  className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-neutral-300 flex items-center gap-1"
                >
                  <CheckCircle2 size={10} className="text-amber-400" />
                  <span>{feat}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action Box & Live Trigger */}
          <div className="md:col-span-4 bg-black/60 border border-amber-500/30 rounded-xl p-3 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-mono text-amber-400 block font-bold">
                🎯 Station Action Guide
              </span>
              <p className="text-[11px] text-neutral-300 leading-normal">
                {station.liveActionDescription}
              </p>
            </div>

            <button
              onClick={handleTriggerLiveDemonstration}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
            >
              <Zap size={13} className="fill-black" />
              <span>{station.liveActionLabel}</span>
            </button>
          </div>
        </div>

        {/* Live Feedback Toast if Triggered */}
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2"
          >
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}

        {/* Station Navigation Pills & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
          {/* Station Stepper Indicators */}
          <div className="flex items-center gap-1.5">
            {TOUR_STATIONS.map((s, idx) => {
              const isActive = idx === currentStationIdx;
              const isDone = completedStations.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectStation(idx)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1",
                    isActive
                      ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      : isDone
                        ? "bg-white/10 text-amber-300 border border-amber-500/30"
                        : "bg-white/5 text-neutral-400 hover:text-white"
                  )}
                >
                  <span>{idx + 1}</span>
                  <span className="hidden lg:inline">{s.badge.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStationIdx === 0}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
            >
              <span>{currentStationIdx === TOUR_STATIONS.length - 1 ? "Finish Tour" : "Next Station"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
