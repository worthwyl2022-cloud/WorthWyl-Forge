/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  Info, 
  Settings, 
  Trash2, 
  Plus, 
  Brain, 
  Zap, 
  Download, 
  FileText, 
  Copy, 
  Check, 
  Menu,
  X,
  History,
  Sliders,
  Share2,
  Film,
  BookOpen,
  Compass,
  Play,
  Lock,
  Key
} from "lucide-react";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { MetacognitiveTracker } from "./components/MetacognitiveTracker";
import { WriterForge } from "./components/WriterForge";
import { NovelEngine } from "./components/NovelEngine";
import { SelfDrivingDemoPlayer } from "./components/SelfDrivingDemoPlayer";
import { InteractiveAppTour } from "./components/InteractiveAppTour";
import brandBanner from "./assets/images/worthwyl_media_banner_1787985483443.jpg";
import brandAvatar from "./assets/images/worthwyl_media_avatar_1787985497415.jpg";
import { streamChat, generateImage, generateVideo, generateAudio, type ChatMessage as ChatMessageType, type CinematicConfig } from "./lib/gemini";
import { cn } from "./lib/utils";
import { CRANIUM_SUBSTRATE_ZIP_B64 } from "./zipBase64";
import { FULL_CRANIUM_SUBSTRATE_MD } from "./fullCodeExport";

// AI Studio type declarations
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

export default function App() {
  const [threads, setThreads] = useState<Thread[]>(() => {
    const saved = localStorage.getItem("worthwyl_threads");
    return saved ? JSON.parse(saved) : [
      {
        id: "1",
        name: "Welcome to WorthWyl Media",
        messages: [{ 
          role: "model", 
          text: "Welcome to **WorthWyl Media Studio**. I am your unified AI creative suite.\n\nYou can chat, generate photorealistic images with **Imagen 3**, render cinematic video sequences with **Veo 3.1**, compose scripts in the **Writer Studio**, or audit cognitive reasoning in the **Cognitive Lab**.\n\nHow can I help you create today?" 
        }],
        createdAt: Date.now()
      }
    ];
  });

  const [activeThreadId, setActiveThreadId] = useState(() => localStorage.getItem("worthwyl_active_thread") || "1");
  const [activeView, setActiveView] = useState<'novel' | 'studio' | 'writer' | 'tracker'>('novel');
  const [isLoading, setIsLoading] = useState(false);
  const [renderingStage, setRenderingStage] = useState("");
  const [thinkingStage, setThinkingStage] = useState("");
  
  // Model & State Config
  const [selectedModel, setSelectedModel] = useState("gemini-3.7-flash");
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasCopiedMd, setHasCopiedMd] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isInteractiveTourOpen, setIsInteractiveTourOpen] = useState(false);
  
  // Diligence Portal Gate State
  const [portalKey, setPortalKey] = useState(() => localStorage.getItem("cranium_custom_password") || "CRANIUM2026");
  const [isGateEnabled, setIsGateEnabled] = useState(() => localStorage.getItem("cranium_gate_enabled") !== "disabled");
  const [isEditingPortalKey, setIsEditingPortalKey] = useState(false);
  const [newPortalKeyInput, setNewPortalKeyInput] = useState("");
  const [portalKeyFeedback, setPortalKeyFeedback] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("worthwyl_threads", JSON.stringify(threads));
    localStorage.setItem("worthwyl_active_thread", activeThreadId);
  }, [threads, activeThreadId]);

  const activeThread = useMemo(() => 
    threads.find(t => t.id === activeThreadId) || threads[0]
  , [threads, activeThreadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages]);

  const createNewThread = () => {
    const newThread: Thread = {
      id: Math.random().toString(36).substring(2, 11),
      name: `Project ${threads.length + 1}`,
      messages: [{ 
        role: "model", 
        text: "New studio session created. Ask a question, request an image, generate a video sequence, or start writing." 
      }],
      createdAt: Date.now()
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setIsHistoryOpen(false);
  };

  const deleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) return;
    const remaining = threads.filter(t => t.id !== id);
    setThreads(remaining);
    if (activeThreadId === id) {
      setActiveThreadId(remaining[0].id);
    }
  };

  const handleSend = async (text: string, imageUrl?: string, audioUrl?: string) => {
    const userMessage: ChatMessageType = { 
      role: "user", 
      text: text || (imageUrl ? "Analyze this visual image." : audioUrl ? "Analyze this acoustic signal." : ""), 
      imageUrl,
      audioUrl
    };
    
    setThreads(prev => prev.map(t => 
      t.id === activeThreadId 
        ? { 
            ...t, 
            messages: [...t.messages, userMessage], 
            name: t.messages.length <= 1 ? (text || "Creative Query").slice(0, 24) + "..." : t.name 
          }
        : t
    ));
    
    setIsLoading(true);
    if (isDeepThinking) setThinkingStage("Synthesizing deep strategic reasoning...");

    try {
      const modelMessage: ChatMessageType = { role: "model", text: "" };
      setThreads(prev => prev.map(t => 
        t.id === activeThreadId 
          ? { ...t, messages: [...t.messages, modelMessage] }
          : t
      ));

      let accumulatedText = "";
      for await (const chunk of streamChat([...activeThread.messages, userMessage], selectedModel, isDeepThinking)) {
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
    } catch (error: any) {
       console.error(error);
       setThreads(prev => prev.map(t => 
        t.id === activeThreadId 
          ? {
              ...t,
              messages: [
                ...t.messages.slice(0, -1),
                { role: "model", text: `I encountered an issue processing that request: ${error.message || "Please check connection or try again."}` }
              ]
            }
          : t
      ));
    } finally {
      setIsLoading(false);
      setThinkingStage("");
    }
  };

  const handleGenerateImage = async (prompt: string, config: CinematicConfig) => {
    const userMessage: ChatMessageType = { role: "user", text: `🎨 Forging Visual Artwork: "${prompt}" [Style: ${config.style}]` };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, userMessage] } : t));
    
    setIsLoading(true);
    setRenderingStage("Generating visual asset with Imagen 3...");

    try {
      const imageUrl = await generateImage(prompt, config);
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: "Visual artwork generated successfully.",
        imageUrl 
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
    } catch (error: any) {
      const errorMessage: ChatMessageType = { role: "model", text: `Image synthesis error: ${error.message}` };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, errorMessage] } : t));
    } finally {
      setIsLoading(false);
      setRenderingStage("");
    }
  };

  const handleGenerateVideo = async (prompt: string, imageUrl?: string, config?: CinematicConfig) => {
    const userMessage: ChatMessageType = { 
      role: "user", 
      text: `🎬 Rendering Cinematic Sequence: "${prompt}"`,
      imageUrl: imageUrl 
    };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, userMessage] } : t));
    
    setIsLoading(true);
    setRenderingStage("Initializing Veo 3.1 video engine...");

    try {
      const result = await generateVideo(prompt, imageUrl, undefined, config, (stage) => {
        setRenderingStage(stage);
      });
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: result.isSimulation 
          ? "Veo cinematic simulation asset generated." 
          : "Cinematic sequence rendered with high temporal stability.",
        videoUrl: result.url,
        videoObject: undefined,
        isSimulation: result.isSimulation,
        simulationData: result.simulationData
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
    } catch (error: any) {
      const errorMessage: ChatMessageType = { role: "model", text: `Video render error: ${error.message}` };
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
    setRenderingStage("Extending temporal scene bridge...");

    try {
      const result = await generateVideo(prompt, undefined, videoObject, undefined, (stage) => {
        setRenderingStage(stage);
      });
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: "Sequence extended successfully.",
        videoUrl: result.url,
        videoObject: undefined,
        isSimulation: result.isSimulation,
        simulationData: result.simulationData
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
    } catch (error: any) {
      const errorMessage: ChatMessageType = { role: "model", text: `Extension error: ${error.message}` };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, errorMessage] } : t));
    } finally {
      setIsLoading(false);
      setRenderingStage("");
    }
  };

  const handleEditVideo = (videoUrl: string) => {
    setActiveView("studio");
  };

  const handleGenerateAudio = async (prompt: string, type: "song" | "voice" | "sfx", referenceAudio?: string) => {
    const userMessage: ChatMessageType = { 
      role: "user", 
      text: `🎵 Synthesizing Audio [${type.toUpperCase()}]: "${prompt}"`,
      audioUrl: referenceAudio 
    };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, userMessage] } : t));
    
    setIsLoading(true);
    setRenderingStage(`Synthesizing acoustic ${type}...`);

    try {
      const audioUrl = await generateAudio(prompt, type, referenceAudio);
      const modelMessage: ChatMessageType = { 
        role: "model", 
        text: "Audio track synthesized successfully.",
        audioUrl 
      };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, modelMessage] } : t));
    } catch (error: any) {
      const errorMessage: ChatMessageType = { role: "model", text: `Audio error: ${error.message}` };
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, errorMessage] } : t));
    } finally {
      setIsLoading(false);
      setRenderingStage("");
    }
  };

  const handleDownloadMd = () => {
    try {
      const blob = new Blob([FULL_CRANIUM_SUBSTRATE_MD], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CRANIUM_SUBSTRATE_ALL.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("MD download failed", e);
    }
  };

  const handleDownloadZip = () => {
    try {
      const byteCharacters = atob(CRANIUM_SUBSTRATE_ZIP_B64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cranium_substrate.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("ZIP download failed", e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-white">
      {/* Top Navigation Bar */}
      <header className="min-h-16 py-2 border-b border-white/10 flex items-center justify-between px-3 sm:px-6 bg-[#08080c]/90 backdrop-blur-2xl sticky top-0 z-40 gap-2 flex-wrap sm:flex-nowrap">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div 
            className="relative cursor-pointer group"
            onClick={() => setActiveView('studio')}
            title="WorthWyl Media Studio"
          >
            <img 
              src={brandAvatar} 
              alt="WorthWyl Media" 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-all"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black animate-pulse" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xs sm:text-base font-black tracking-wider worthwyl-brand-title flex items-center gap-1.5 sm:gap-2">
              WORTHWYL
            </h1>
            <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-amber-400/80 -mt-0.5 uppercase hidden md:block">
              Media WorthWyl • AI Studio
            </span>
          </div>
        </div>

        {/* Center Mode Switcher Tabs (Scrollable on Android/Mobile) */}
        <nav className="flex items-center bg-black/40 p-1 rounded-full border border-white/10 shadow-inner overflow-x-auto max-w-full custom-scrollbar py-1 shrink-0 order-3 sm:order-2">
          <button 
            onClick={() => setActiveView('novel')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeView === 'novel' 
                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
                : "text-sleek-muted hover:text-white"
            )}
          >
            <Compass size={13} className={activeView === 'novel' ? "text-white" : "text-indigo-400"} />
            <span className="hidden xs:inline">Novel Engine</span>
            <span className="xs:hidden">Novel</span>
          </button>

          <button 
            onClick={() => setActiveView('studio')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeView === 'studio' 
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                : "text-sleek-muted hover:text-white"
            )}
          >
            <Sparkles size={13} className={activeView === 'studio' ? "text-black" : "text-amber-400"} />
            <span>Studio</span>
          </button>

          <button 
            onClick={() => setActiveView('writer')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeView === 'writer' 
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                : "text-sleek-muted hover:text-white"
            )}
          >
            <BookOpen size={13} className={activeView === 'writer' ? "text-black" : "text-amber-400"} />
            <span className="hidden xs:inline">Script & Writer</span>
            <span className="xs:hidden">Writer</span>
          </button>

          <button 
            onClick={() => setActiveView('tracker')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeView === 'tracker' 
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                : "text-sleek-muted hover:text-white"
            )}
          >
            <Brain size={13} className={activeView === 'tracker' ? "text-black" : "text-amber-400"} />
            <span className="hidden xs:inline">Cognitive Lab</span>
            <span className="xs:hidden">Lab</span>
          </button>
        </nav>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 order-2 sm:order-3">
          {/* Interactive Guided Tour on Live App */}
          <button
            onClick={() => setIsInteractiveTourOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 hover:opacity-90 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
            title="Launch Interactive In-App Guided Tour"
          >
            <Compass size={12} className="text-white" />
            <span className="hidden sm:inline">Live Tour</span>
            <span className="sm:hidden text-[11px]">Tour</span>
          </button>

          {/* Live 90s Acquisition Demo Button */}
          <button
            onClick={() => setIsDemoOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
            title="Launch 90-Second Self-Driving Acquisition Demo"
          >
            <Play size={12} className="fill-black" />
            <span className="hidden sm:inline">Play 90s Demo</span>
            <span className="sm:hidden text-[11px]">Demo</span>
          </button>

          {/* Deep Thought Toggle */}
          <button
            onClick={() => setIsDeepThinking(!isDeepThinking)}
            className={cn(
              "hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer",
              isDeepThinking 
                ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]" 
                : "bg-white/[0.04] text-sleek-muted border-white/10 hover:text-white"
            )}
            title="Toggle Deep Reasoning"
          >
            <Brain size={12} />
            <span>Deep Reasoning</span>
          </button>

          {/* New Chat Button */}
          {activeView === 'studio' && (
            <button
              onClick={createNewThread}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold transition-all cursor-pointer"
              title="Start New Conversation"
            >
              <Plus size={14} className="text-amber-400" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* History Sidebar Toggle */}
          {activeView === 'studio' && (
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={cn(
                "p-2 rounded-xl border transition-all cursor-pointer",
                isHistoryOpen 
                  ? "bg-amber-500/20 text-amber-300 border-amber-400" 
                  : "bg-white/[0.04] text-sleek-muted border-white/10 hover:text-white"
              )}
              title="Conversation History"
            >
              <History size={16} />
            </button>
          )}

          {/* Studio Menu / Settings Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-sleek-muted hover:text-white transition-all cursor-pointer"
            title="Studio Menu & Exports"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* History Slide-out Drawer */}
        <AnimatePresence>
          {isHistoryOpen && activeView === 'studio' && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-72 bg-[#0a0a0f] border-r border-white/10 flex flex-col p-4 z-30 shadow-2xl shrink-0"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Conversations
                </h3>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1 text-sleek-muted hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <button
                onClick={createNewThread}
                className="w-full mb-3 py-2 px-3 rounded-xl glossy-btn-amber text-black text-xs font-black flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                <span>New Conversation</span>
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {threads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setIsHistoryOpen(false);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 cursor-pointer transition-all group",
                      activeThreadId === thread.id 
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                        : "hover:bg-white/5 text-sleek-muted hover:text-white"
                    )}
                  >
                    <span className="truncate flex-1">{thread.name}</span>
                    {threads.length > 1 && (
                      <button
                        onClick={(e) => deleteThread(thread.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* View Routing */}
        {activeView === 'novel' && (
          <div className="flex-1 flex flex-col min-w-0 bg-[#0b0f17] overflow-hidden">
            <NovelEngine />
          </div>
        )}

        {activeView === 'studio' && (
          <main className="flex-1 flex flex-col min-w-0 bg-[#050508]">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-6">
              <div className="max-w-4xl mx-auto w-full">
                {/* Hero Showcase for Fresh Threads */}
                {activeThread?.messages.length <= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8 space-y-5"
                  >
                    <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.2)]">
                      <img
                        src={brandBanner}
                        alt="WorthWyl Media Banner"
                        className="w-full h-48 sm:h-64 object-cover object-center filter brightness-90 contrast-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-black/40 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60" />

                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            MULTIMODAL STUDIO
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-3xl font-black worthwyl-brand-title tracking-wider mb-1">
                          WORTHWYL MEDIA
                        </h2>
                        <p className="text-xs worthwyl-brand-sub tracking-[0.18em] font-semibold mb-2">
                          MEDIA WORTHWYL • COGNITIVE CREATIVE SUITE
                        </p>
                        <p className="text-xs text-gray-300 max-w-xl leading-relaxed hidden sm:block">
                          Chat, generate photorealistic visual assets, render cinematic video sequences, or author long-form manuscripts.
                        </p>
                      </div>
                    </div>

                    {/* Quick Starter Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => handleSend("Generate a dramatic cinematic visual scene with glowing fiery embers and volumetric lighting.")}
                        className="glossy-card p-4 space-y-1.5 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                          <Sparkles size={16} />
                        </div>
                        <h4 className="text-xs font-black text-white">Cinematic Visuals & Video</h4>
                        <p className="text-[11px] text-sleek-muted">
                          Forge photorealistic images with Imagen 3 or cinematic video sequences with Veo 3.1.
                        </p>
                      </div>

                      <div
                        onClick={() => setActiveView("writer")}
                        className="glossy-card p-4 space-y-1.5 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                          <BookOpen size={16} />
                        </div>
                        <h4 className="text-xs font-black text-white">Infinite Script & Writer</h4>
                        <p className="text-[11px] text-sleek-muted">
                          Author endless coherent screenplays, essays, and stories with 6 narrative lenses.
                        </p>
                      </div>

                      <div
                        onClick={() => setActiveView("tracker")}
                        className="glossy-card p-4 space-y-1.5 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                          <Brain size={16} />
                        </div>
                        <h4 className="text-xs font-black text-white">Cognitive Reasoning Lab</h4>
                        <p className="text-[11px] text-sleek-muted">
                          Audit biases, trace implicit assumptions, and verify causal chains.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Messages Stream */}
                {activeThread?.messages.map((msg, idx) => (
                  <ChatMessage 
                    key={idx} 
                    message={msg} 
                    onExtend={(prompt) => handleExtendVideo(prompt, msg.videoObject)}
                    onEdit={handleEditVideo}
                  />
                ))}

                {/* Loading / Generating State */}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <div className="bg-[#111116] border border-amber-500/40 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                      <Sparkles className="text-amber-400 animate-spin" size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        {thinkingStage || renderingStage || "WorthWyl AI is thinking..."}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Seamless Bottom Input */}
            <div className="border-t border-white/10 bg-[#07070a]/90 backdrop-blur-md">
              <ChatInput 
                onSend={handleSend} 
                onGenerateImage={handleGenerateImage}
                onGenerateVideo={handleGenerateVideo}
                onGenerateAudio={handleGenerateAudio}
                isLoading={isLoading} 
              />
            </div>
          </main>
        )}

        {activeView === 'writer' && (
          <div className="flex-1 overflow-y-auto bg-[#050508]">
            <WriterForge />
          </div>
        )}

        {activeView === 'tracker' && (
          <div className="flex-1 overflow-y-auto bg-[#050508]">
            <MetacognitiveTracker />
          </div>
        )}
      </div>

      {/* Unified Studio Menu & Export Modal */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#0c0c12] border border-amber-500/30 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={brandAvatar}
                    alt="WorthWyl Media"
                    className="w-12 h-12 rounded-2xl object-cover border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  />
                  <div>
                    <h3 className="text-lg font-black worthwyl-brand-title tracking-wider">
                      WORTHWYL MEDIA
                    </h3>
                    <p className="text-[11px] worthwyl-brand-sub tracking-widest">
                      STUDIO SETTINGS & EXPORTS
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl text-sleek-muted hover:text-white hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Model Choice */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-amber-300 mb-1.5 block">
                    AI Engine Model
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedModel("gemini-3.7-flash")}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-bold text-left transition-all",
                        selectedModel === "gemini-3.7-flash"
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          : "bg-white/[0.03] border-white/10 text-sleek-muted hover:text-white"
                      )}
                    >
                      <div className="font-black text-white">Gemini 3.7 Flash</div>
                      <div className="text-[10px] text-sleek-muted">Ultra-fast multimodal reasoning</div>
                    </button>

                    <button
                      onClick={() => setSelectedModel("gemini-3.1-pro-preview")}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-bold text-left transition-all",
                        selectedModel === "gemini-3.1-pro-preview"
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          : "bg-white/[0.03] border-white/10 text-sleek-muted hover:text-white"
                      )}
                    >
                      <div className="font-black text-white">Gemini 3.1 Pro</div>
                      <div className="text-[10px] text-sleek-muted">Complex reasoning & architecture</div>
                    </button>
                  </div>
                </div>

                {/* Code & Project Exports */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-amber-300 mb-1.5 block">
                    Project Backup & Codebase
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={handleDownloadMd}
                      className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 hover:border-emerald-400/50 transition-all cursor-pointer"
                    >
                      <FileText size={15} />
                      <span>Download .MD</span>
                    </button>

                    <button
                      onClick={handleDownloadZip}
                      className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-amber-400 hover:border-amber-400/50 transition-all cursor-pointer"
                    >
                      <Download size={15} />
                      <span>Download .ZIP</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(FULL_CRANIUM_SUBSTRATE_MD).then(() => {
                          setHasCopiedMd(true);
                          setTimeout(() => setHasCopiedMd(false), 2500);
                        });
                      }}
                      className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-white hover:border-white/30 transition-all cursor-pointer"
                    >
                      {hasCopiedMd ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                      <span>{hasCopiedMd ? "Copied!" : "Copy Code"}</span>
                    </button>
                  </div>
                </div>

                {/* Diligence Portal Access Control */}
                <div className="p-4 rounded-xl bg-black/50 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={15} className="text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Diligence Portal Password Gate
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const nextState = !isGateEnabled;
                        setIsGateEnabled(nextState);
                        localStorage.setItem("cranium_gate_enabled", nextState ? "enabled" : "disabled");
                        if (!nextState) {
                          localStorage.setItem("cranium_auth_token", "granted");
                        }
                      }}
                      className={cn(
                        "text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                        isGateEnabled
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                          : "bg-white/5 text-neutral-400 border-white/10"
                      )}
                    >
                      {isGateEnabled ? "GATE: ACTIVE" : "GATE: DISABLED (OPEN)"}
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Controls the authorization lock on your live URL. When enabled, visitors must enter your access key.
                  </p>

                  {/* Active Key Display & Editor */}
                  {!isEditingPortalKey ? (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <div className="text-[11px] font-mono text-neutral-300">
                        Active Key: <code className="text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 font-bold">{portalKey}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setNewPortalKeyInput(portalKey);
                            setIsEditingPortalKey(true);
                            setPortalKeyFeedback("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-mono text-amber-300 transition-all cursor-pointer"
                        >
                          Change Key
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-black/80 border border-amber-500/40 space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-bold">
                        Set New Access Code:
                      </label>
                      <input
                        type="text"
                        value={newPortalKeyInput}
                        onChange={(e) => setNewPortalKeyInput(e.target.value)}
                        placeholder="Enter 4+ char passcode..."
                        className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (newPortalKeyInput.trim().length < 4) {
                                setPortalKeyFeedback("Code must be at least 4 characters.");
                                return;
                              }
                              const code = newPortalKeyInput.trim();
                              localStorage.setItem("cranium_custom_password", code);
                              setPortalKey(code);
                              setPortalKeyFeedback("Key saved successfully!");
                              setTimeout(() => {
                                setIsEditingPortalKey(false);
                                setPortalKeyFeedback("");
                              }, 1200);
                            }}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.removeItem("cranium_custom_password");
                              setPortalKey("CRANIUM2026");
                              setPortalKeyFeedback("Reset to default (CRANIUM2026)");
                              setTimeout(() => {
                                setIsEditingPortalKey(false);
                                setPortalKeyFeedback("");
                              }, 1200);
                            }}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs rounded-lg border border-white/10 cursor-pointer"
                          >
                            Reset Default
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPortalKey(false);
                            setPortalKeyFeedback("");
                          }}
                          className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {portalKeyFeedback && (
                    <div className={cn(
                      "text-[11px] p-2 rounded-lg font-mono border",
                      portalKeyFeedback.includes("success") || portalKeyFeedback.includes("Reset")
                        ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                        : "bg-red-950/40 text-red-300 border-red-500/30"
                    )}>
                      {portalKeyFeedback}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-3.5 glossy-btn-amber font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Close Menu
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Self-Driving Full System Acquisition Demo Player */}
      <SelfDrivingDemoPlayer
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onLaunchInteractiveTour={() => {
          setIsDemoOpen(false);
          setIsInteractiveTourOpen(true);
        }}
      />

      {/* Live Interactive In-App Guided Tour */}
      <InteractiveAppTour
        isOpen={isInteractiveTourOpen}
        onClose={() => setIsInteractiveTourOpen(false)}
        activeView={activeView}
        onNavigateView={(v) => setActiveView(v)}
      />
    </div>
  );
}
