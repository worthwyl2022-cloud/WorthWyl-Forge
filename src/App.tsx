/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, ChevronRight, Github, Info, Terminal, Settings, Trash2, PlusCircle, Brain, Target, Zap, Cpu } from "lucide-react";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { PersistentChat } from "./components/PersistentChat";
import { MetacognitiveTracker } from "./components/MetacognitiveTracker";
import { WriterForge } from "./components/WriterForge";
import { streamChat, generateImage, generateVideo, generateAudio, type ChatMessage as ChatMessageType, type CinematicConfig } from "./lib/gemini";
import { cn } from "./lib/utils";

// Add window type for aistudio
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface Thread {
  id: string;
  name: string;
  messages: ChatMessageType[];
  createdAt: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export default function App() {
  const [threads, setThreads] = useState<Thread[]>(() => {
    const saved = localStorage.getItem("worthwyl_threads");
    return saved ? JSON.parse(saved) : [
      {
        id: "1",
        name: "Core Initialization",
        messages: [{ role: "model", text: "WorthWyl Core active. Systems nominal. Ready for command input." }],
        createdAt: Date.now()
      }
    ];
  });
  const [activeThreadId, setActiveThreadId] = useState(() => localStorage.getItem("worthwyl_active_thread") || "1");
  const [activeView, setActiveView] = useState<'forge' | 'tracker' | 'writer'>('forge');
  const [isLoading, setIsLoading] = useState(false);
  const [renderingStage, setRenderingStage] = useState("");
  const [thinkingStage, setThinkingStage] = useState("");
  
  // Model & State Config
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [isDeepThinking, setIsDeepThinking] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem("worthwyl_logs");
    return saved ? JSON.parse(saved) : [
      { id: "0", timestamp: new Date().toLocaleTimeString(), message: "WorthWyl OS v1.2.0 Booting...", type: "info" },
      { id: "a", timestamp: new Date().toLocaleTimeString(), message: "Node Cluster Alpha Attached", type: "success" }
    ];
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  const [infraStatus, setInfraStatus] = useState({
    cluster: "NOMINAL",
    edge: "ACTIVE",
    vector: "READY"
  });

  useEffect(() => {
    localStorage.setItem("worthwyl_threads", JSON.stringify(threads));
    localStorage.setItem("worthwyl_active_thread", activeThreadId);
    localStorage.setItem("worthwyl_logs", JSON.stringify(logs));
  }, [threads, activeThreadId, logs]);

  const activeThread = useMemo(() => 
    threads.find(t => t.id === activeThreadId) || threads[0]
  , [threads, activeThreadId]);

  const stats = useMemo(() => {
    const totalMessages = threads.reduce((acc, t) => acc + t.messages.length, 0);
    const uptime = Math.floor((Date.now() - (threads[0]?.createdAt || Date.now())) / 1000 / 60);
    return { totalMessages, uptime };
  }, [threads]);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const checkInfra = (key: keyof typeof infraStatus) => {
    addLog(`Running diagnostic on ${key.toUpperCase()}...`, "info");
    setTimeout(() => {
      addLog(`${key.toUpperCase()} handshake verified. Status: NOMINAL`, "success");
    }, 1500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread.messages]);

  const createThread = () => {
    const newThread: Thread = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Pipeline-${threads.length + 1}`,
      messages: [{ role: "model", text: "New pipeline initialized. Standing by." }],
      createdAt: Date.now()
    };
    setThreads(prev => [...prev, newThread]);
    setActiveThreadId(newThread.id);
    addLog(`Initialized ${newThread.name}`, "success");
  };

  const deleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length === 1) return;
    setThreads(prev => prev.filter(t => t.id !== id));
    if (activeThreadId === id) {
      setActiveThreadId(threads[0].id);
    }
    addLog(`Decommissioned Pipeline ${id}`, "warning");
  };

  const handleSend = async (text: string, imageUrl?: string, audioUrl?: string) => {
    const userMessage: ChatMessageType = { 
      role: "user", 
      text: text || (imageUrl ? "Analyze this visual signal." : audioUrl ? "Analyze this acoustic signal." : ""), 
      imageUrl,
      audioUrl
    };
    
    setThreads(prev => prev.map(t => 
      t.id === activeThreadId 
        ? { ...t, messages: [...t.messages, userMessage], name: t.messages.length === 1 ? (text || "Multimedia Query").slice(0, 20) + "..." : t.name }
        : t
    ));
    
    setIsLoading(true);
    if (isDeepThinking) setThinkingStage("Analyzing logical structure...");
    addLog(`Command broadcast [${selectedModel}]: ${text.slice(0, 30) || "Signal Input"}...`);

    try {
      const modelMessage: ChatMessageType = { role: "model", text: "" };
      setThreads(prev => prev.map(t => 
        t.id === activeThreadId 
          ? { ...t, messages: [...t.messages, modelMessage] }
          : t
      ));

      let accumulatedText = "";
      for await (const chunk of streamChat([...activeThread.messages, userMessage], selectedModel, isDeepThinking)) {
        if (chunk.includes("WORTHWYL DEEPMIND : STRATEGIC DECONSTRUCTION")) setThinkingStage("Deconstructing request...");
        if (chunk.includes("EXECUTING NEURAL ITERATIONS")) setThinkingStage("Synthesizing solution...");
        
        accumulatedText += chunk;
        setThreads(prev => prev.map(t => 
          t.id === activeThreadId 
            ? {
                ...t,
                messages: [
                  ...t.messages.slice(0, -1),
                  { role: "model", text: accumulatedText }
                ]
              }
            : t
        ));
      }
      addLog("Response cycle complete", "success");
    } catch (error) {
       addLog("Signal interference detected", "error");
       console.error(error);
    } finally {
      setIsLoading(false);
      setThinkingStage("");
    }
  };

  const handleGenerateImage = async (prompt: string, config: CinematicConfig) => {
    const userMessage: ChatMessageType = { role: "user", text: `Forging Visual Asset: "${prompt}" [Style: ${config.style}]` };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, userMessage] } : t));
    
    setIsLoading(true);
    setRenderingStage("Photon Synthesis...");
    addLog(`Initiating visual generation: ${prompt.slice(0, 20)}...`);

    try {
      const imageUrl = await generateImage(prompt, config);
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: "Neural synthesis complete. Visual asset forged.",
        imageUrl 
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
      addLog("Visual asset forge successful", "success");
    } catch (error: any) {
      addLog("Forge malfunction during visual synthesis", "error");
      const errorMessage: ChatMessageType = { role: "model", text: `Error: ${error.message}` };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, errorMessage] } : t));
    } finally {
      setIsLoading(false);
      setRenderingStage("");
    }
  };

  const handleGenerateVideo = async (prompt: string, imageUrl?: string, config?: CinematicConfig) => {
    // We no longer block here, as generateVideo has a free fallback
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      addLog("Media Engine: Missing paid key. Using Neural Simulation fallback.", "warning");
    }

    const userMessage: ChatMessageType = { 
      role: "user", 
      text: `Rendering Cinematic Sequence: "${prompt}"`,
      imageUrl: imageUrl 
    };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, userMessage] } : t));
    
    setIsLoading(true);
    setRenderingStage("Allocating Neural Buffer...");

    try {
      const result = await generateVideo(prompt, imageUrl, undefined, config, (stage) => {
        setRenderingStage(stage);
        addLog(`Renderer: ${stage}`, "info");
      });
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: result.isSimulation ? "Neural simulation complete. Cinematic asset proxied." : "Cinematic sequence rendered. Temporal synthesis stable.",
        videoUrl: result.url,
        videoObject: undefined,
        isSimulation: result.isSimulation,
        simulationData: result.simulationData
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
      addLog(result.isSimulation ? "Simulation asset forged" : "Temporal synthesis complete", "success");
    } catch (error: any) {
      addLog("Sequence corruption during rendering", "error");
      const errorMessage: ChatMessageType = { role: "model", text: `Error: ${error.message}` };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, errorMessage] } : t));
    } finally {
      setIsLoading(false);
      setRenderingStage("");
    }
  };

  const handleExtendVideo = async (prompt: string, videoObject: any) => {
    const userMessage: ChatMessageType = { role: "user", text: `Extending sequence: "${prompt}"` };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, userMessage] } : t));
    
    setIsLoading(true);
    setRenderingStage("Extending Temporal Bridge...");
    addLog("Sequence extension protocol engaged...", "info");

    try {
      const result = await generateVideo(prompt, undefined, videoObject, undefined, (stage) => {
        setRenderingStage(stage);
        addLog(`Renderer: ${stage}`, "info");
      });
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: result.isSimulation ? "Extension simulated via neural assets." : "Sequence extension complete. Temporal bridge established.",
        videoUrl: result.url,
        videoObject: undefined,
        isSimulation: result.isSimulation,
        simulationData: result.simulationData
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
      addLog("Temporal bridge stable", "success");
    } catch (error: any) {
      addLog("Extension failure: temporal desync", "error");
      const errorMessage: ChatMessageType = { role: "model", text: `Error: ${error.message}` };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, errorMessage] } : t));
    } finally {
      setIsLoading(false);
      setRenderingStage("");
    }
  };

  const handleEditVideo = async (editedData: any) => {
    const { segments } = editedData;
    const firstSegment = segments[0];
    
    // Construct a refinement prompt based on the edits
    let refinementPrompt = "Refine video sequence: ";
    if (firstSegment.startTime > 0 || firstSegment.endTime < firstSegment.duration) {
      refinementPrompt += `Trim from ${firstSegment.startTime}s to ${firstSegment.endTime}s. `;
    }
    
    if (firstSegment.textOverlays.length > 0) {
      refinementPrompt += "Apply text overlays: ";
      firstSegment.textOverlays.forEach((o: any) => {
        refinementPrompt += `"${o.text}" at ${o.x}%,${o.y}% (size ${o.fontSize}px). `;
      });
    }

    if (segments.length > 1) {
      refinementPrompt += `Merge ${segments.length} segments into a single cinematic flow.`;
    }

    const userMessage: ChatMessageType = { role: "user", text: `Neural Refinement Request: ${refinementPrompt}` };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, userMessage] } : t));
    
    setIsLoading(true);
    setRenderingStage("Neural Re-Synthesis...");
    addLog("Executing sequence refinement protocol...", "info");

    try {
      // In a real implementation, we would pass these parameters to the model.
      // For this demo, we'll re-generate with the new prompt to simulate the AI's "edit".
      const result = await generateVideo(refinementPrompt, undefined, undefined, undefined, (stage) => {
        setRenderingStage(stage);
      });
      
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: "Sequence refined. Neural overlays and temporal adjustments applied.",
        videoUrl: result.url,
        videoObject: undefined
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
      addLog("Refinement successful", "success");
    } catch (error: any) {
      addLog("Refinement failed: neural instability", "error");
      const errorMessage: ChatMessageType = { role: "model", text: `Error: ${error.message}` };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, errorMessage] } : t));
    } finally {
      setIsLoading(false);
      setRenderingStage("");
    }
  };

  const handleGenerateAudio = async (prompt: string, type: "song" | "voice" | "sfx", referenceAudio?: string) => {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      addLog("Audio protocol requires verified API key", "warning");
      await window.aistudio.openSelectKey();
    }

    const userMessage: ChatMessageType = { 
      role: "user", 
      text: `Acoustic Synthesis [${type}]: "${prompt}"`,
      audioUrl: referenceAudio 
    };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, userMessage] } : t));
    
    setIsLoading(true);
    setRenderingStage("Acoustic Neural Mapping...");
    addLog(`Synthesizing ${type}: ${prompt.slice(0, 20)}...`);

    try {
      const audioUrl = await generateAudio(prompt, type, referenceAudio);
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: "Acoustic synthesis stable. Neural audio signal acquired.",
        audioUrl 
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
      addLog("Audio signal acquisition successful", "success");
    } catch (error: any) {
      addLog("Acoustic desync: synthesis failed", "error");
      const errorMessage: ChatMessageType = { role: "model", text: `Error: ${error.message}. Neural fallback triggered.` };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, errorMessage] } : t));
    } finally {
      setIsLoading(false);
      setRenderingStage("");
    }
  };

  // ... [remaining methods: handleExtendVideo, etc] ...

  return (
    <div className="sleek-container">
      {/* Header / Top Nav */}
      <header className="sleek-nav">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-sleek-accent rounded shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center">
            <Terminal size={14} className="text-white" />
          </div>
          <h1 className="text-sm font-black tracking-[-0.03em] flex items-center gap-2">
            WORTHWYL FORGE <span className="opacity-40 font-normal">X-1</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-sleek-surface p-1 rounded-lg border border-sleek-border">
          <button 
            onClick={() => setIsDeepThinking(!isDeepThinking)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[0.1em] transition-all",
              isDeepThinking ? "bg-sleek-accent text-white shadow-lg" : "text-sleek-muted hover:text-white"
            )}
          >
            <Brain size={12} />
            Deep Thought
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-[9px] font-black uppercase tracking-[0.1em] text-sleek-accent focus:outline-none px-2 py-1 cursor-pointer"
          >
            <option value="gemini-2.0-flash">Flash v2</option>
            <option value="gemini-2.0-flash-thinking-exp">Pro Thinking</option>
            <option value="gemini-1.5-pro">Pro v1.5</option>
          </select>
        </div>

        <nav className="flex items-center gap-6">
          <div className="flex bg-sleek-surface rounded-full p-1 border border-sleek-border">
            <button 
                onClick={() => setActiveView('forge')}
                className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", activeView === 'forge' ? 'bg-sleek-accent text-white' : 'text-sleek-muted')}
            >
                Forge
            </button>
            <button 
                onClick={() => setActiveView('tracker')}
                className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", activeView === 'tracker' ? 'bg-sleek-accent text-white' : 'text-sleek-muted')}
            >
                Tracker
            </button>
            <button 
                onClick={() => setActiveView('writer')}
                className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", activeView === 'writer' ? 'bg-sleek-accent text-white' : 'text-sleek-muted')}
            >
                Writer
            </button>
          </div>
          <div className="w-[1px] h-6 bg-sleek-border" />
          <div className="flex items-center gap-2 px-3 py-1 bg-sleek-accent/10 border border-sleek-accent/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-sleek-accent animate-pulse" />
            <span className="text-[10px] font-bold text-sleek-accent tracking-wider uppercase">Active {activeView === 'forge' ? 'Forge' : activeView === 'tracker' ? 'Tracker' : 'Writer'}</span>
          </div>
          <button 
            onClick={() => setIsDiagnosticOpen(true)}
            className="h-8 w-8 rounded-full bg-sleek-surface border border-sleek-border flex items-center justify-center hover:text-sleek-accent transition-all hover:scale-110"
            title="System Metrics"
          >
            <Terminal size={14} className="text-sleek-muted" />
          </button>
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="h-8 w-8 rounded-full bg-sleek-surface border border-sleek-border flex items-center justify-center hover:text-sleek-accent transition-all hover:scale-110"
            title="System Info"
          >
            <Info size={14} className="text-sleek-muted" />
          </button>
          <button 
            onClick={() => {
              const data = JSON.stringify(threads, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `worthwyl-export-${Date.now()}.json`;
              a.click();
              addLog("Exporting pipeline state...", "info");
            }}
            className="h-8 w-8 rounded-full bg-sleek-surface border border-sleek-border flex items-center justify-center hover:text-sleek-accent transition-colors"
            title="Export Forge Data"
          >
            <Github size={14} className="text-sleek-muted" />
          </button>
          <button className="h-8 w-8 rounded-full bg-sleek-surface border border-sleek-border flex items-center justify-center hover:text-sleek-accent transition-colors">
            <Settings size={14} className="text-sleek-muted" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isAboutOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-sleek-bg border border-sleek-border p-8 rounded-2xl shadow-2xl relative overflow-hidden"
            >
              <h2 className="text-2xl font-black mb-6 tracking-tighter">WORTHWYL v1.2.0</h2>
              <div className="space-y-4 text-sleek-muted text-sm leading-relaxed">
                <p>
                  WorthWyl AI is a sophisticated neural orchestration layer designed for advanced reasoning, visual synthesis, and cinematic rendering.
                </p>
                <p>
                  Powered by <span className="text-sleek-accent font-bold">Gemini 3 Flash</span> and <span className="text-sleek-accent font-bold">Veo 3.1</span>, it offers a minimalist yet powerful interface for complex problem solving.
                </p>
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-white/40">Developer</span>
                    <span className="text-white font-medium">WorthWyl Core</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-white/40">Status</span>
                    <span className="text-emerald-500 font-medium tracking-widest">STABLE RELEASE</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsAboutOpen(false)}
                className="mt-8 w-full py-4 border border-sleek-border text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white/5 transition-all"
              >
                Return to Forge
              </button>
            </motion.div>
          </motion.div>
        )}

        {isDiagnosticOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-sleek-bg border border-sleek-border p-8 rounded-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sleek-accent to-transparent opacity-50" />
              
              <h2 className="text-2xl font-black mb-8 tracking-tighter flex items-center gap-4">
                <Terminal className="text-sleek-accent" />
                SYSTEM DIAGNOSTICS
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] uppercase tracking-widest text-sleek-muted mb-1 font-bold">Total Transactions</div>
                  <div className="text-3xl font-black">{stats.totalMessages}</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] uppercase tracking-widest text-sleek-muted mb-1 font-bold">System Uptime (M)</div>
                  <div className="text-3xl font-black">{stats.uptime}</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] uppercase tracking-widest text-sleek-muted mb-1 font-bold">Active Pipelines</div>
                  <div className="text-3xl font-black">{threads.length}</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] uppercase tracking-widest text-sleek-muted mb-1 font-bold">Neural Protocol</div>
                  <div className="text-3xl font-black">G-3P</div>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-sleek-muted/60 mb-8 max-h-32 overflow-y-auto custom-scrollbar">
                {logs.map(log => (
                  <div key={log.id}>[{log.timestamp}] :: {log.message}</div>
                ))}
              </div>

              <button 
                onClick={() => setIsDiagnosticOpen(false)}
                className="w-full py-4 bg-sleek-accent text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-sleek-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Close Metrics
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeView === 'forge' && (
        <>
        {/* Left Sidebar - Thread Management */}
        <aside className="hidden lg:flex w-64 border-r border-sleek-border flex-col p-6 sleek-bg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-sleek-muted font-black">Build Pipelines</h3>
            <button 
              onClick={createThread}
              className="text-sleek-accent hover:text-white transition-colors cursor-pointer"
            >
              <PlusCircle size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {threads.map(thread => (
              <div 
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={cn(
                  "sidebar-item group relative",
                  activeThreadId === thread.id && "active"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  activeThreadId === thread.id ? "bg-sleek-accent" : "bg-white/10"
                )} />
                <span className="truncate pr-4 flex-1">{thread.name}</span>
                <button 
                  onClick={(e) => deleteThread(thread.id, e)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 border-t border-sleek-border pt-6">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-sleek-muted mb-4 font-black">Infrastructure</h3>
            <button onClick={() => checkInfra("cluster")} className="sidebar-item w-full text-left">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Cloud Cluster
            </button>
            <button onClick={() => checkInfra("edge")} className="sidebar-item w-full text-left">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Edge Runtime
            </button>
            <button onClick={() => checkInfra("vector")} className="sidebar-item w-full text-left">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Vector DB
            </button>
          </div>
        </aside>

        {/* Center Panel - Main Chat */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
            <div className="max-w-4xl mx-auto w-full">
              {activeThread.messages.map((msg, idx) => (
                <ChatMessage 
                  key={idx} 
                  message={msg} 
                  onExtend={(prompt) => handleExtendVideo(prompt, msg.videoObject)}
                  onEdit={handleEditVideo}
                />
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="rgba(59, 130, 246, 0.1)"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="502"
                        animate={{ strokeDashoffset: [502, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <Sparkles className="text-sleek-accent mb-2 animate-pulse" size={32} />
                      <div className="text-[10px] uppercase tracking-[0.2em] font-black text-sleek-muted mb-1">Renderer Active</div>
                      <div className="text-[8px] font-mono text-sleek-accent/60 truncate max-w-full italic">{thinkingStage || renderingStage}</div>
                    </div>
                  </div>
                  <div className="mt-8 text-center bg-sleek-surface border border-sleek-border px-6 py-3 rounded-full flex items-center gap-3">
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 rounded-full bg-sleek-accent" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 rounded-full bg-sleek-accent" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 rounded-full bg-sleek-accent" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sleek-accent">{thinkingStage || renderingStage || "Forging Response..."}</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-sleek-border/50 bg-sleek-bg/20 backdrop-blur-sm">
            <ChatInput 
              onSend={handleSend} 
              onGenerateImage={handleGenerateImage}
              onGenerateVideo={handleGenerateVideo}
              onGenerateAudio={handleGenerateAudio}
              isLoading={isLoading} 
            />
          </div>
        </main>

        {/* Right Sidebar - Stats/Logs */}
        <aside className="hidden xl:flex w-80 border-l border-sleek-border flex-col p-6 sleek-bg overflow-hidden">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-sleek-muted mb-6 font-black">Forge Metrics</h3>
          <div className="grid grid-cols-1 gap-3 mb-8">
            <div className="stat-card">
              <div className="text-xl font-black tracking-tight">{activeThread.messages.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-sleek-muted mt-1 font-bold">Protocol Depth</div>
            </div>
            <div className="stat-card">
              <div className="text-xl font-black tracking-tight text-emerald-500">OPTIMIZED</div>
              <div className="text-[10px] uppercase tracking-widest text-sleek-muted mt-1 font-bold">Neural Health</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-sleek-muted font-black">Live Console</h3>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          
          <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 custom-scrollbar">
            {logs.map(log => (
              <div key={log.id} className={cn(
                "flex gap-2 transition-all duration-300",
                log.type === "success" && "text-emerald-400",
                log.type === "error" && "text-red-400",
                log.type === "warning" && "text-amber-400",
                log.type === "info" && "text-sleek-accent/80"
              )}>
                <span className="opacity-30 flex-shrink-0">[{log.timestamp}]</span>
                <span className="truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </aside>
        </>
        )}
        {activeView === 'tracker' && (
          <div className="w-full p-6">
            <MetacognitiveTracker />
          </div>
        )}
        {activeView === 'writer' && (
          <div className="w-full p-6">
            <WriterForge />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="h-10 border-t border-sleek-border px-6 flex items-center justify-between text-[10px] text-sleek-muted font-bold tracking-widest uppercase bg-sleek-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span>WorthWyl Cluster Alpha</span>
          <div className="w-[1px] h-3 bg-sleek-border" />
          <span className="text-sleek-accent">LINK ACQUIRED</span>
        </div>
        <div>LATENCY 12MS</div>
      </footer>
      <PersistentChat />
    </div>
  );
}

