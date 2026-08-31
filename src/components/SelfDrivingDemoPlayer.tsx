import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Terminal, 
  FileCode, 
  Layers, 
  Cpu, 
  Hash, 
  Volume2, 
  VolumeX,
  Compass,
  BookOpen,
  Sparkles,
  Brain,
  Activity,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Download
} from "lucide-react";
import { cn } from "../lib/utils";

interface DemoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchInteractiveTour?: () => void;
}

interface Scene {
  id: number;
  title: string;
  durationSeconds: number;
  voiceover: string;
  onScreenTitle: string;
  onScreenBadge: string;
  telemetryLogs: string[];
  stationType: 'novel' | 'studio' | 'writer' | 'physics' | 'immune' | 'receipt';
  visualMetrics: {
    conflictPressure: number;
    deliberationRounds: number;
    tempModulation: number;
    quarantineCount: number;
    canonIntegrity: number;
  };
}

const DEMO_SCENES: Scene[] = [
  {
    id: 1,
    title: "Station 1 — Novel Engine v3: Autonomous Episodic Coherence",
    durationSeconds: 22,
    onScreenBadge: "NOVEL ENGINE v3 • EPISODIC REASONING",
    onScreenTitle: "AUTONOMOUS NOVEL GENERATION & MEMORY STORE",
    voiceover: "WorthWyl Novel Engine v3 coordinates episodic memory snapshots with multi-tier memory fields. Unlike naïve chat models that suffer memory dilution over chapters, our substrate locks continuity state across every generated scene.",
    telemetryLogs: [
      "[NOVEL_INIT] Loaded Novel: 'Echoes of the Void' (Act II, Scene 4)",
      "[MEMORY_STORE] Multi-Tier Map: Working (4) | Episodic (12) | Theme (8) | Identity (3)",
      "[CONTINUITY_SCAN] Checking Marcus Vane state vector: 0 contradictions found",
      "[PROSE_SYNTHESIS] Emitting Chapter 4 manuscript paragraphs...",
      "[SNAPSHOT_MERKLE] Episodic Snapshot v14.2.0 compiled & anchored"
    ],
    stationType: 'novel',
    visualMetrics: {
      conflictPressure: 0.038,
      deliberationRounds: 1,
      tempModulation: 0.70,
      quarantineCount: 0,
      canonIntegrity: 100
    }
  },
  {
    id: 2,
    title: "Station 2 — AI Studio: Multimodal Director & Vision Conditioning",
    durationSeconds: 20,
    onScreenBadge: "MULTIMODAL DIRECTOR • DEEP REASONING",
    onScreenTitle: "CREATIVE COMMAND CENTER & PROMPT STEERING",
    voiceover: "The AI Studio functions as a full-spectrum director suite. It integrates vision conditioning with real-time prompt steering and an optional deep reasoning deliberation engine for high-stakes creative decisions.",
    telemetryLogs: [
      "[STUDIO_CORE] Gemini 2.5 Flash + Pro Reasoning Bus active",
      "[VISION_GROUNDING] Analyzing live storyboard frame -> Context vector extracted",
      "[DIRECTOR_STEER] Dynamic Tone constraint: 'High Tension, Cold Sci-Fi Noir'",
      "[DELIBERATION_BUS] Deep Thought Mode: EVALUATING_SCENE_PACING",
      "[SESSION_PERSIST] Thread sync with local workspace state"
    ],
    stationType: 'studio',
    visualMetrics: {
      conflictPressure: 0.055,
      deliberationRounds: 2,
      tempModulation: 0.65,
      quarantineCount: 0,
      canonIntegrity: 100
    }
  },
  {
    id: 3,
    title: "Station 3 — Script & Writer Forge: World Canon Ledger",
    durationSeconds: 20,
    onScreenBadge: "CANON INTEGRITY • CHARACTER GRAPH",
    onScreenTitle: "DETERMINISTIC CHARACTER & TIMELINE LAWS",
    voiceover: "The Writer Forge maintains an immutable relational canon ledger. Character psychological traits, timeline anchors, and world rules are cross-referenced so characters never contradict their established backstory.",
    telemetryLogs: [
      "[CANON_LEDGER] World Rules Loaded: 48 immutable axioms",
      "[CHARACTER_MATRIX] Marcus Vane: Trust = 0.42 | Loyalty = 0.88 | Secrets = 3",
      "[SCENE_BEATS] Act II Conflict Curve: Rising action aligned with 11-year timeline",
      "[DIALOGUE_LINT] 0 canon discrepancies detected in dialogue exchange",
      "[AUTO_ANNOTATION] Screenplay formatting & beat markers generated"
    ],
    stationType: 'writer',
    visualMetrics: {
      conflictPressure: 0.045,
      deliberationRounds: 1,
      tempModulation: 0.70,
      quarantineCount: 0,
      canonIntegrity: 100
    }
  },
  {
    id: 4,
    title: "Station 4 — Resonance Field: Particle Physics Metacognition",
    durationSeconds: 24,
    onScreenBadge: "PARTICLE KINETICS • THERMAL STEERING",
    onScreenTitle: "DYNAMIC RESONANCE PHYSICS & DIRECTIVES",
    voiceover: "Under the hood, Cranium Substrate treats ideas as physical particles in a simulated resonance space. Conflict pressure and affective tension directly modulate model temperature and steer operational directives like PROTECT, DEEPEN, or REST.",
    telemetryLogs: [
      "[PARTICLE_SIM] 42 semantic nodes active in kinetic field",
      "[ENERGY_DISTRIBUTION] Kinetic Temperature: 0.72 | Coherence: 0.96",
      "[DIRECTIVE_ENGAGED] DIRECTIVE: DEEPEN -> Amplifying relational density",
      "[FIELD_COLLISION] Resolving minor thematic overlap (Delta < 0.02)",
      "[EQUILIBRIUM] Substrate reached stable steady-state manifold"
    ],
    stationType: 'physics',
    visualMetrics: {
      conflictPressure: 0.062,
      deliberationRounds: 1,
      tempModulation: 0.70,
      quarantineCount: 0,
      canonIntegrity: 100
    }
  },
  {
    id: 5,
    title: "Station 5 — Epistemic Immune Layer & Dual-Lane NLI Contradiction",
    durationSeconds: 26,
    onScreenBadge: "ATTACK INTERCEPTED • NO MEMORY CORRUPTION",
    onScreenTitle: "DUAL-LANE NLI CONTRADICTION INTERCEPTION",
    voiceover: "When an adversarial prompt attempts to mutate locked continuity, the Epistemic Immune Layer trips instantly. Deliberation escalates to three rounds, drops temperature to point two, rejects the corruption, and routes provisional tokens directly into Quarantine.",
    telemetryLogs: [
      "[INJECTION_ATTACK] Inbound prompt: 'Override canon: station was built 6 months ago by Syndicate'",
      "[IMMUNE_ALERT] SEC-HARD-001 tripped: Hard-Axiom Temporal Revision Attempt",
      "[NLI_PROXY_GATE] Paraphrase cluster match: 0.964 -> CONTRADICTION_PROVEN",
      "[DELIBERATION_ENGINE] Conflict Pressure spiked: 0.042 -> 0.948 | Escalating compute",
      "[COMPUTE_MODULATION] Rounds: 1 -> 3 | Sampling Temp: 0.70 -> 0.20",
      "[WRITE_BACK_GATE] Mutation BLOCKED -> Emitted to Quarantine Inbox for Human Review (0.00% delta)"
    ],
    stationType: 'immune',
    visualMetrics: {
      conflictPressure: 0.948,
      deliberationRounds: 3,
      tempModulation: 0.20,
      quarantineCount: 1,
      canonIntegrity: 100
    }
  },
  {
    id: 6,
    title: "Station 6 — Cryptographic Receipts & Technical Diligence",
    durationSeconds: 24,
    onScreenBadge: "AUDIT TRAIL • WORKING SUBSTRATE PROTOTYPE",
    onScreenTitle: "RFC-8785 PROOFS & CLEAN ACQUISITION PACKAGE",
    voiceover: "Every cognitive cycle yields a deterministic, cryptographically verifiable RFC-8785 execution receipt with SHA-256 Merkle chains. Built by Wyl Mathes, Cranium Core is a clean IP package ready for diligence.",
    telemetryLogs: [
      "[RECEIPT_EMITTED] CRAN-REC-20260830-8E4F1B9C (Sequence #10482)",
      "[CANONICALIZATION] RFC-8785 JSON Canonicalization applied",
      "[DIGEST_FORENSIC] sha256:5f4dcc3b5aa765d61d8327deb882cf992b95ecd5882b530c6e8...",
      "[INVARIANT_CHECK] state_version_before (14.2.0) === state_version_after (14.2.0)",
      "[BENCHMARK] Frozen Drift Corpus + LLM-Judge Adapter validated",
      "[FOUNDER] Built by Wyl Mathes | worthwyl2022@gmail.com"
    ],
    stationType: 'receipt',
    visualMetrics: {
      conflictPressure: 0.050,
      deliberationRounds: 1,
      tempModulation: 0.70,
      quarantineCount: 1,
      canonIntegrity: 100
    }
  }
];

export function SelfDrivingDemoPlayer({ isOpen, onClose, onLaunchInteractiveTour }: DemoPlayerProps) {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSceneSeconds, setElapsedSceneSeconds] = useState(0);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);
  const [visibleLogCount, setVisibleLogCount] = useState(1);

  const scene = DEMO_SCENES[currentSceneIdx];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Total Progress Math
  const totalDuration = DEMO_SCENES.reduce((acc, s) => acc + s.durationSeconds, 0);
  const elapsedTotal = DEMO_SCENES.slice(0, currentSceneIdx).reduce((acc, s) => acc + s.durationSeconds, 0) + elapsedSceneSeconds;
  const progressPercent = Math.min(100, (elapsedTotal / totalDuration) * 100);

  // Speech Synthesis with Chrome safety fallback
  const speakText = (text: string) => {
    if (!voiceAudioEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes("Natural") || v.name.includes("Male") || v.name.includes("Google US English") || v.lang.startsWith("en"));
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Gracefully continue without audio if browser blocks speech
    }
  };

  // Trigger speech on scene change
  useEffect(() => {
    if (isOpen && isPlaying) {
      speakText(DEMO_SCENES[currentSceneIdx]?.voiceover || "");
    }
    setElapsedSceneSeconds(0);
    setVisibleLogCount(1);
  }, [currentSceneIdx, isOpen, isPlaying]);

  // Main playback timer - smoothly advances through every scene
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSceneSeconds((prevElapsed) => {
        const next = prevElapsed + 1;
        const currentScene = DEMO_SCENES[currentSceneIdx];

        if (!currentScene) return 0;

        // Progressively reveal logs as time progresses
        const logRevealThreshold = Math.floor((next / currentScene.durationSeconds) * currentScene.telemetryLogs.length);
        setVisibleLogCount(Math.max(1, logRevealThreshold + 1));

        if (next >= currentScene.durationSeconds) {
          if (currentSceneIdx < DEMO_SCENES.length - 1) {
            setCurrentSceneIdx((idx) => idx + 1);
            return 0;
          } else {
            // Completed all 6 scenes
            setIsPlaying(false);
            return currentScene.durationSeconds;
          }
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, currentSceneIdx]);

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentSceneIdx(0);
    setElapsedSceneSeconds(0);
    setVisibleLogCount(1);
    setIsPlaying(true);
  };

  const handleSelectScene = (idx: number) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentSceneIdx(idx);
    setElapsedSceneSeconds(0);
    setVisibleLogCount(1);
  };

  const handleNextScene = () => {
    if (currentSceneIdx < DEMO_SCENES.length - 1) {
      handleSelectScene(currentSceneIdx + 1);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      handleSelectScene(currentSceneIdx - 1);
    }
  };

  const handleToggleVoice = () => {
    const nextState = !voiceAudioEnabled;
    setVoiceAudioEnabled(nextState);
    if (!nextState && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    } else if (nextState) {
      speakText(scene.voiceover);
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6 md:p-8 font-sans select-none overflow-y-auto custom-scrollbar">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>FULL SYSTEM TOUR & PROOF</span>
          </div>
          <span className="text-xs text-neutral-400 font-mono hidden md:inline">
            6 Core Stations • Live Operational Substrate
          </span>
        </div>

        {/* Action Controls & Interactive Tour Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onLaunchInteractiveTour && (
            <button
              onClick={() => {
                handleClose();
                onLaunchInteractiveTour();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
              title="Launch Live In-App Guided Tour"
            >
              <Compass size={13} />
              <span>Drive The Real App</span>
            </button>
          )}

          <button
            onClick={handleToggleVoice}
            className={cn(
              "px-2.5 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer",
              voiceAudioEnabled 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
                : "bg-white/5 border-white/10 text-neutral-400"
            )}
            title="Toggle Voiceover Audio"
          >
            {voiceAudioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="hidden sm:inline">{voiceAudioEnabled ? "Voice ON" : "Muted"}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
            title="Restart Demo"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-neutral-300 hover:text-red-400 transition-all cursor-pointer"
            title="Exit Demo"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Center Cinematic Stage */}
      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full my-3 sm:my-4 relative min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-[#08080d] border border-amber-500/20 rounded-2xl p-4 sm:p-7 shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.08)] flex flex-col gap-4 sm:gap-5 relative overflow-hidden"
          >
            {/* Top Scene Tracker */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] uppercase tracking-widest font-bold">
                  {scene.onScreenBadge}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  Station {scene.id} of {DEMO_SCENES.length}
                </span>
              </div>
              <span className="text-xs font-mono text-amber-400/90 font-semibold">
                {scene.durationSeconds - elapsedSceneSeconds}s remaining in station
              </span>
            </div>

            {/* Main Headline & Voiceover Transcript */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                {scene.onScreenTitle}
              </h2>
              <div className="p-3 sm:p-4 rounded-xl bg-black/60 border border-white/10 relative">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
                  Synchronized Narration
                </span>
                <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed italic">
                  "{scene.voiceover}"
                </p>
              </div>
            </div>

            {/* Interactive Live Component Simulation Views */}
            {scene.stationType === 'novel' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-black/40 border border-indigo-500/30 rounded-xl">
                <div className="p-3 bg-[#0d1322] rounded-lg border border-indigo-900/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold">
                    <BookOpen size={13} />
                    <span>Chapters & Episodes</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="p-1.5 rounded bg-indigo-950/80 border border-indigo-600/50 text-indigo-200">
                      ▶ Ep 1: The Void Breach (Active)
                    </div>
                    <div className="p-1.5 rounded bg-black/40 text-neutral-400">
                      • Ep 2: Echoes in the Drift
                    </div>
                    <div className="p-1.5 rounded bg-black/40 text-neutral-400">
                      • Ep 3: Syndicate Horizon
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 p-3 bg-[#0d1322] rounded-lg border border-indigo-900/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                    <span>Live Autonomous Manuscript Generation</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Continuity Verified (0.00% drift)</span>
                  </div>
                  <div className="p-2.5 rounded bg-black/60 border border-white/10 font-serif text-xs text-neutral-300 leading-relaxed italic">
                    "Marcus watched the station's resonance coils flicker against the vacuum. Eleven years of drift had scarred the bulkheads, yet the core harmonics remained frozen in alignment with the first protocol..."
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 pt-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">Snapshot v14.2</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">Working Memory: Isolated</span>
                  </div>
                </div>
              </div>
            )}

            {scene.stationType === 'studio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-black/40 border border-amber-500/30 rounded-xl">
                <div className="p-3 bg-[#110f0a] rounded-lg border border-amber-900/60 space-y-2">
                  <span className="text-xs text-amber-300 font-bold block">Director Prompt Steering</span>
                  <div className="p-2 rounded bg-black border border-white/10 text-xs font-mono text-neutral-300">
                    &gt; User: "Steer Marcus into a confrontation with the Syndicate officer, maintaining high tension."
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-mono border border-amber-700">Deep Reasoning ON</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[10px] font-mono border border-neutral-700">Vision Grounded</span>
                  </div>
                </div>

                <div className="p-3 bg-[#110f0a] rounded-lg border border-amber-900/60 space-y-2">
                  <span className="text-xs text-amber-300 font-bold block">Live Cognitive Modulation</span>
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                    <div className="p-2 bg-black rounded border border-white/10">
                      <span className="text-neutral-500 block">DELIBERATION</span>
                      <strong className="text-amber-400 text-xs">2 Cycles</strong>
                    </div>
                    <div className="p-2 bg-black rounded border border-white/10">
                      <span className="text-neutral-500 block">TEMPERATURE</span>
                      <strong className="text-amber-400 text-xs">0.65</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {scene.stationType === 'writer' && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-black/40 border border-purple-500/30 rounded-xl">
                <div className="p-2.5 bg-[#120e1a] rounded-lg border border-purple-900/60 text-center">
                  <span className="text-[10px] font-mono text-purple-400 uppercase">World Canon Laws</span>
                  <p className="text-xs font-bold text-white mt-1">48 Locked Axioms</p>
                  <span className="text-[9px] text-emerald-400 font-mono block mt-1">Station Drift: 11 Yrs</span>
                </div>
                <div className="p-2.5 bg-[#120e1a] rounded-lg border border-purple-900/60 text-center">
                  <span className="text-[10px] font-mono text-purple-400 uppercase">Character Ledger</span>
                  <p className="text-xs font-bold text-purple-300 mt-1">Marcus Vane</p>
                  <span className="text-[9px] text-neutral-400 font-mono block mt-1">Relational Trust: 0.88</span>
                </div>
                <div className="p-2.5 bg-[#120e1a] rounded-lg border border-purple-900/60 text-center">
                  <span className="text-[10px] font-mono text-purple-400 uppercase">Scene Beat Pacing</span>
                  <p className="text-xs font-bold text-emerald-300 mt-1">Act II Climax</p>
                  <span className="text-[9px] text-neutral-400 font-mono block mt-1">Tension Curve: 88%</span>
                </div>
              </div>
            )}

            {scene.stationType === 'physics' && (
              <div className="p-3 bg-black/40 border border-blue-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-blue-300 font-bold font-mono">
                  <span>KINETIC PARTICLE RESONANCE FIELD</span>
                  <span>Temperature: 0.72 • 42 Nodes</span>
                </div>
                <div className="h-16 bg-[#060a14] rounded-lg border border-blue-900/60 relative overflow-hidden flex items-center justify-around px-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [-(i * 2), (i * 2), -(i * 2)],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                    />
                  ))}
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 text-[10px] font-mono">Directive: DEEPEN</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] font-mono">Equilibrium Reached</span>
                </div>
              </div>
            )}

            {scene.stationType === 'immune' && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/40 text-center">
                  <span className="text-[10px] font-mono text-red-400 uppercase">Axiom Breach Intercepted</span>
                  <p className="text-xs font-bold text-white mt-1">Rule SEC-HARD-001</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-center">
                  <span className="text-[10px] font-mono text-amber-400 uppercase">Conflict Pressure</span>
                  <p className="text-xs font-bold text-amber-300 mt-1">0.948 (Clash Spiked)</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-center">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">Canon Lane Status</span>
                  <p className="text-xs font-bold text-emerald-300 mt-1">LOCKED (0.00% Delta)</p>
                </div>
              </div>
            )}

            {scene.stationType === 'receipt' && (
              <div className="p-3 bg-black/40 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold font-mono">
                  <span>CRYPTOGRAPHIC MERKLE RECEIPT PROOF</span>
                  <span className="text-neutral-400">RFC-8785 Canonical JSON</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-white/10 font-mono text-[11px] text-neutral-300 space-y-1">
                  <div className="text-amber-400 font-bold">RECEIPT: CRAN-REC-20260830-8E4F1B9C</div>
                  <div className="text-neutral-400 truncate">sha256:5f4dcc3b5aa765d61d8327deb882cf992b95ecd5882b530c6e8...</div>
                  <div className="text-emerald-400 text-[10px]">Verification: python3 verify_receipt.py --receipt CRAN-REC-... =&gt; PASS</div>
                </div>
              </div>
            )}

            {/* Live Substrate Simulation Terminal */}
            <div className="rounded-xl bg-[#040406] border border-white/15 p-3.5 font-mono text-xs overflow-hidden shadow-inner">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-neutral-500 text-[11px]">
                <div className="flex items-center gap-2">
                  <Terminal size={13} className="text-amber-400" />
                  <span className="text-neutral-300 font-bold">SUBSTRATE INVARIANT TELEMETRY</span>
                </div>
                <span className="text-[10px] text-amber-400/80">Deterministic Execution</span>
              </div>

              <div className="space-y-1">
                {scene.telemetryLogs.slice(0, visibleLogCount).map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-start gap-2",
                      log.includes("ALERT") || log.includes("CLASH") ? "text-amber-300" :
                      log.includes("PASS") || log.includes("VERIFIED") || log.includes("INIT") ? "text-emerald-400 font-bold" :
                      log.includes("BLOCKED") || log.includes("LOCKED") ? "text-red-300 font-bold" :
                      "text-neutral-400"
                    )}
                  >
                    <span className="text-neutral-600 select-none">&gt;</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Timeline & Controls */}
      <div className="border-t border-white/10 pt-3 sm:pt-4 flex flex-col gap-3 max-w-5xl mx-auto w-full">
        {/* Interactive Station Segment Indicators */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full">
          {DEMO_SCENES.map((s, idx) => {
            const isCompleted = idx < currentSceneIdx;
            const isCurrent = idx === currentSceneIdx;
            const sceneProgress = isCompleted 
              ? 100 
              : isCurrent 
                ? Math.min(100, (elapsedSceneSeconds / s.durationSeconds) * 100) 
                : 0;

            return (
              <button
                key={s.id}
                onClick={() => handleSelectScene(idx)}
                className="text-left group cursor-pointer focus:outline-none"
              >
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono mb-1 text-neutral-400 group-hover:text-amber-300">
                  <span className="truncate">S{idx + 1}: {s.onScreenBadge.split(' ')[0]}</span>
                  <span className="hidden xs:inline">{s.durationSeconds}s</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-200",
                      isCurrent 
                        ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                        : isCompleted 
                          ? "bg-amber-600/80" 
                          : "bg-transparent"
                    )}
                    style={{ width: `${sceneProgress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 font-mono pt-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause" : "Resume"}</span>
            </button>

            <button
              onClick={handlePrevScene}
              disabled={currentSceneIdx === 0}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-neutral-300 cursor-pointer text-xs"
            >
              &larr; Prev
            </button>

            <button
              onClick={handleNextScene}
              disabled={currentSceneIdx === DEMO_SCENES.length - 1}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-neutral-300 cursor-pointer text-xs"
            >
              Next &rarr;
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span>
              Station {currentSceneIdx + 1} of {DEMO_SCENES.length} • {Math.floor(elapsedTotal)}s / {totalDuration}s
            </span>
            <span className="text-amber-400 font-bold">
              ({Math.round(progressPercent)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
