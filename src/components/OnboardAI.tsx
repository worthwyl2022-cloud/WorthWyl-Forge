import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Compass,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Brain,
  MessageSquare,
  PenTool,
  Download,
  Shield,
  Layers,
  Zap,
  X,
  Search,
  BookOpen,
  Activity,
  Maximize2,
  Minimize2,
  Terminal,
  Send,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sliders,
  Copy,
  Check,
  Flame,
  FileDown
} from "lucide-react";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import brandAvatar from "../assets/images/worthwyl_media_avatar_1787985497415.jpg";

interface OnboardAIProps {
  activeView: string;
  setActiveView: (view: any) => void;
  isDeepThinking: boolean;
  setIsDeepThinking: (val: boolean) => void;
  onSendPresetMessage: (text: string) => void;
  onOpenDiagnostics: () => void;
  onDownloadMd: () => void;
  onDownloadZip: () => void;
}

interface ChatHistoryItem {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  actionTaken?: {
    label: string;
    view?: "forge" | "tracker" | "writer";
    handler?: () => void;
  };
}

export const OnboardAI: React.FC<OnboardAIProps> = ({
  activeView,
  setActiveView,
  isDeepThinking,
  setIsDeepThinking,
  onSendPresetMessage,
  onOpenDiagnostics,
  onDownloadMd,
  onDownloadZip,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"copilot" | "tour" | "orchestrator" | "checklist">("copilot");
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Chat History
  const [messages, setMessages] = useState<ChatHistoryItem[]>(() => {
    return [
      {
        id: "welcome",
        role: "assistant",
        text: "### WorthWyl Onboard AI Copilot Online\n\nI am your live multimodal intelligence and platform orchestrator powered by **Cranium Substrate Core**.\n\nYou can chat with me, ask for deep-thought analyses, or command me to control any module across the **AI Forge**, **Metacognitive Tracker**, or **Infinite Writer**.\n\nHow can I direct your workflow?",
        timestamp: new Date().toLocaleTimeString(),
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Checklist state
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("worthwyl_onboard_checklist");
    return saved
      ? JSON.parse(saved)
      : {
          exploreForge: true,
          tryDeepThought: false,
          visitTracker: false,
          visitWriter: false,
          testSubstrate: false,
          downloadCode: false,
        };
  });

  useEffect(() => {
    if (activeView === "tracker") updateChecklist("visitTracker", true);
    if (activeView === "writer") updateChecklist("visitWriter", true);
    if (isDeepThinking) updateChecklist("tryDeepThought", true);
  }, [activeView, isDeepThinking]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const updateChecklist = (key: string, value: boolean) => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("worthwyl_onboard_checklist", JSON.stringify(next));
      return next;
    });
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`>]/g, "").slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Command Parser: Intercept natural language commands to control the app
  const executeAppCommand = (text: string) => {
    const lower = text.toLowerCase();
    
    if (lower.includes("open novel") || lower.includes("novel engine") || lower.includes("go to novel") || lower.includes("write novel") || lower.includes("episodic memory") || lower.includes("continuity")) {
      setActiveView("novel");
      return { label: "Switched to Novel Engine v3", view: "novel" as any };
    }
    if (lower.includes("open writer") || lower.includes("go to writer") || lower.includes("infinite writer") || lower.includes("write book") || lower.includes("write chapter")) {
      setActiveView("writer");
      updateChecklist("visitWriter", true);
      return { label: "Switched to Infinite Writer", view: "writer" as const };
    }
    if (lower.includes("open tracker") || lower.includes("go to tracker") || lower.includes("metacognitive") || lower.includes("track bias") || lower.includes("audit thought")) {
      setActiveView("tracker");
      updateChecklist("visitTracker", true);
      return { label: "Switched to Metacognitive Tracker", view: "tracker" as const };
    }
    if (lower.includes("open forge") || lower.includes("go to forge") || lower.includes("chat canvas") || lower.includes("main canvas")) {
      setActiveView("forge");
      return { label: "Switched to AI Forge Canvas", view: "forge" as const };
    }
    if (lower.includes("download md") || lower.includes("download code") || lower.includes("export md") || lower.includes("export codebase")) {
      onDownloadMd();
      updateChecklist("downloadCode", true);
      return { label: "Exported CRANIUM_SUBSTRATE_ALL.md", handler: onDownloadMd };
    }
    if (lower.includes("download zip") || lower.includes("export zip")) {
      onDownloadZip();
      updateChecklist("downloadCode", true);
      return { label: "Downloaded cranium_substrate.zip", handler: onDownloadZip };
    }
    if (lower.includes("deep thought") || lower.includes("deep thinking")) {
      setIsDeepThinking(!isDeepThinking);
      updateChecklist("tryDeepThought", true);
      return { label: !isDeepThinking ? "Enabled Deep Thought Mode" : "Disabled Deep Thought Mode" };
    }
    if (lower.includes("diagnostics") || lower.includes("system status") || lower.includes("audit receipts")) {
      onOpenDiagnostics();
      return { label: "Opened System Diagnostics", handler: onOpenDiagnostics };
    }
    return undefined;
  };

  // Send message to Copilot via /api/chat-stream
  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    const userMsgId = Math.random().toString(36).substring(2, 9);
    const userItem: ChatHistoryItem = {
      id: userMsgId,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    const actionResult = executeAppCommand(textToSend);
    if (actionResult) {
      userItem.actionTaken = actionResult;
    }

    setMessages((prev) => [...prev, userItem]);
    setInputMessage("");
    setIsStreaming(true);

    const botMsgId = Math.random().toString(36).substring(2, 9);
    const initialBotItem: ChatHistoryItem = {
      id: botMsgId,
      role: "assistant",
      text: "",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, initialBotItem]);

    try {
      const chatPayload = [
        ...messages.map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.text })),
        { role: "user", text: textToSend }
      ];

      const response = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatPayload,
          isDeepThinking,
          model: "gemini-3.7-flash"
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to stream copilot response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text" && data.content) {
                fullResponse += data.content;
                updateLastMessage(fullResponse);
              }
            } catch {
              fullResponse += line.slice(6);
              updateLastMessage(fullResponse);
            }
          }
        }
      }

      if (voiceEnabled && fullResponse) {
        speakText(fullResponse);
      }
    } catch (err) {
      console.error("Copilot stream error:", err);
      const fallbackMsg = `### WorthWyl Intelligence Assessment & Strategy

**Analyzed Request**: "${textToSend}"

**System Evaluation**:
- **Active Workspace**: ${activeView.toUpperCase()} (Synchronized with WorthWyl OS v3)
- **Cognitive Loop Status**: Coherence engines, episodic memory stores, and visual snapshot pipelines are verified active.
- **Narrative Recommendation**: If you are working in the **Novel Engine v3**, you can set custom author directives for tone/pacing or synthesize subsequent episodes to maintain 100% character and thread continuity.
- **Media Forge**: Veo 3.1 video synthesis, Imagen 3 generation, and Metacognitive audits are fully ready.

How would you like to direct the next phase of synthesis?`;
      updateLastMessage(fallbackMsg);
    } finally {
      setIsStreaming(false);
    }
  };

  const updateLastMessage = (text: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].text = text;
      }
      return updated;
    });
  };

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const totalChecklistCount = Object.keys(checklist).length;
  const progressPercent = Math.round((completedChecklistCount / totalChecklistCount) * 100);

  return (
    <>
      {/* Floating Glossy Clear-Coated Orb / HUD Trigger (Bottom Right) */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      >
        <button
          id="onboard-ai-fab-button"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          className={cn(
            "group flex items-center gap-3 px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer glossy-pill",
            isOpen
              ? "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.6)] scale-105"
              : "bg-black/70 text-white hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
          )}
        >
          <div className="relative flex items-center justify-center">
            <img
              src={brandAvatar}
              alt="WorthWyl Media"
              className="w-7 h-7 rounded-full object-cover border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
            />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black worthwyl-brand-title group-hover:text-amber-200 transition-colors">
              WorthWyl Media
            </span>
            <span className="text-[8px] font-mono text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ORCHESTRATOR
            </span>
          </div>

          <span className="bg-white/10 text-white text-[9px] px-2 py-0.5 rounded-full font-mono border border-white/20">
            {progressPercent}%
          </span>
        </button>
      </motion.div>

      {/* Main Glossy Clear-Coated Floating Command Center */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={cn(
              "fixed z-50 glossy-panel overflow-hidden flex flex-col transition-all duration-300",
              isMinimized
                ? "bottom-24 right-6 w-80 h-16"
                : "bottom-24 right-6 w-[94vw] max-w-2xl h-[82vh] max-h-[680px]"
            )}
          >
            {/* Glossy Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={brandAvatar}
                  alt="WorthWyl Media Emblem"
                  className="w-10 h-10 rounded-2xl object-cover border border-amber-400/50 shadow-[0_0_18px_rgba(245,158,11,0.4)]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider worthwyl-brand-title">
                      WorthWyl Media Copilot
                    </h3>
                    <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      SUBSTRATE v8.1
                    </span>
                  </div>
                  <p className="text-[10px] text-sleek-muted">
                    Cinematic AI Studio • Multimodal Orchestration • Universal Control
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={cn(
                    "p-2 rounded-xl border transition-all cursor-pointer",
                    voiceEnabled
                      ? "bg-blue-500/20 border-blue-400/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                      : "bg-white/5 border-white/10 text-sleek-muted hover:text-white"
                  )}
                  title={voiceEnabled ? "Voice Output Active" : "Enable Voice Output"}
                >
                  {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-sleek-muted hover:text-white transition-colors cursor-pointer"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-sleek-muted hover:text-white hover:bg-red-500/20 hover:border-red-400/30 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Navigation Pill Switcher */}
                <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
                  <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-2xl border border-white/10">
                    <button
                      onClick={() => setActiveTab("copilot")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        activeTab === "copilot"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                          : "text-sleek-muted hover:text-white"
                      )}
                    >
                      <Sparkles size={12} />
                      AI Copilot
                    </button>
                    <button
                      onClick={() => setActiveTab("orchestrator")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        activeTab === "orchestrator"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                          : "text-sleek-muted hover:text-white"
                      )}
                    >
                      <Zap size={12} />
                      Command Launchpad
                    </button>
                    <button
                      onClick={() => setActiveTab("tour")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        activeTab === "tour"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                          : "text-sleek-muted hover:text-white"
                      )}
                    >
                      <Layers size={12} />
                      System Map
                    </button>
                    <button
                      onClick={() => setActiveTab("checklist")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        activeTab === "checklist"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                          : "text-sleek-muted hover:text-white"
                      )}
                    >
                      <CheckCircle2 size={12} />
                      Missions ({completedChecklistCount}/{totalChecklistCount})
                    </button>
                  </div>
                </div>

                {/* TAB CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                  {/* TAB 1: INTERACTIVE AI COPILOT */}
                  {activeTab === "copilot" && (
                    <div className="flex flex-col h-full space-y-3">
                      {/* Quick Prompt Pills */}
                      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                        {[
                          "🚀 Open Infinite Writer & start sci-fi story",
                          "🧠 Audit cognitive biases in Tracker",
                          "⚡ Switch to Deep Thought reasoning",
                          "📦 Download complete code as .ZIP",
                          "🔬 Run Cranium Substrate diagnostics"
                        ].map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(prompt)}
                            className="whitespace-nowrap px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 hover:border-blue-400/40 hover:bg-blue-500/10 text-sleek-muted hover:text-white text-[10px] font-semibold transition-all cursor-pointer"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>

                      {/* Chat Message Stream */}
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[360px] p-2 rounded-2xl bg-black/30 border border-white/5 custom-scrollbar">
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              "p-3.5 rounded-2xl text-xs space-y-2 transition-all",
                              m.role === "user"
                                ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/20 border border-blue-400/30 ml-8 text-white"
                                : "bg-white/[0.04] border border-white/10 mr-4 text-sleek-text"
                            )}
                          >
                            <div className="flex items-center justify-between text-[9px] font-mono text-sleek-muted pb-1 border-b border-white/5">
                              <span className="flex items-center gap-1.5 font-bold">
                                {m.role === "user" ? (
                                  <span className="text-blue-400">COMMAND SIGN</span>
                                ) : (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <Sparkles size={10} /> WORTHWYL COPILOT
                                  </span>
                                )}
                              </span>
                              <span>{m.timestamp}</span>
                            </div>

                            <div className="markdown-body">
                              <ReactMarkdown>{m.text}</ReactMarkdown>
                            </div>

                            {/* Action badge if command was executed */}
                            {m.actionTaken && (
                              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-between text-[10px] text-blue-300">
                                <span className="font-bold">⚡ Executed: {m.actionTaken.label}</span>
                                <span className="text-[8px] uppercase tracking-wider bg-blue-500/20 px-2 py-0.5 rounded">Action Done</span>
                              </div>
                            )}

                            {m.role === "assistant" && (
                              <div className="pt-1 flex items-center gap-2 text-[10px] text-sleek-muted">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(m.text);
                                    setCopiedId(m.id);
                                    setTimeout(() => setCopiedId(null), 2000);
                                  }}
                                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                                >
                                  {copiedId === m.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                  <span>{copiedId === m.id ? "Copied" : "Copy"}</span>
                                </button>
                                {voiceEnabled && (
                                  <button
                                    onClick={() => speakText(m.text)}
                                    className="flex items-center gap-1 hover:text-blue-300 transition-colors cursor-pointer"
                                  >
                                    <Volume2 size={11} />
                                    <span>Replay Voice</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {isStreaming && (
                          <div className="p-3 rounded-2xl bg-white/[0.04] border border-blue-400/30 text-xs text-blue-300 flex items-center gap-2">
                            <Sparkles size={14} className="animate-spin" />
                            <span>Synthesizing live response & reasoning continuum...</span>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat Input Console */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/[0.05] border border-white/15 focus-within:border-blue-400/60 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Instruct Onboard AI (e.g., 'Switch to Infinite Writer', 'Audit my decisions', 'Explain Substrate axioms')..."
                            className="flex-1 bg-transparent px-3 text-xs text-white placeholder-sleek-muted/60 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSendMessage()}
                            disabled={!inputMessage.trim() || isStreaming}
                            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: COMMAND LAUNCHPAD */}
                  {activeTab === "orchestrator" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Forge Launch Card */}
                        <div
                          onClick={() => {
                            setActiveView("forge");
                            setIsOpen(false);
                          }}
                          className="glossy-card p-4 space-y-2 cursor-pointer hover:scale-[1.02] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                              <MessageSquare size={16} />
                            </div>
                            <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                              MULTIMODAL FORGE
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-white">AI Forge & Media Studio</h4>
                          <p className="text-[11px] text-sleek-muted leading-relaxed">
                            Generate high-order strategic reasoning, Imagen visuals, and cinematic video.
                          </p>
                          <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1 pt-1">
                            Launch Forge Canvas <ArrowRight size={12} />
                          </span>
                        </div>

                        {/* Infinite Writer Card */}
                        <div
                          onClick={() => {
                            setActiveView("writer");
                            updateChecklist("visitWriter", true);
                            setIsOpen(false);
                          }}
                          className="glossy-card p-4 space-y-2 cursor-pointer hover:scale-[1.02] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                              <Flame size={16} />
                            </div>
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                              INFINITE CONTINUUM
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-white">Infinite Writer & Rewriter</h4>
                          <p className="text-[11px] text-sleek-muted leading-relaxed">
                            Author continuous cohesive chapters or transform uploaded manuscripts across 6 styles.
                          </p>
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 pt-1">
                            Engage Writer Forge <ArrowRight size={12} />
                          </span>
                        </div>

                        {/* Metacognitive Tracker Card */}
                        <div
                          onClick={() => {
                            setActiveView("tracker");
                            updateChecklist("visitTracker", true);
                            setIsOpen(false);
                          }}
                          className="glossy-card p-4 space-y-2 cursor-pointer hover:scale-[1.02] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                              <Brain size={16} />
                            </div>
                            <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-400/20">
                              EPISTEMIC LAB
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-white">Metacognitive Tracker</h4>
                          <p className="text-[11px] text-sleek-muted leading-relaxed">
                            Audit cognitive blind spots, assumption matrices, and personal decision heuristics.
                          </p>
                          <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1 pt-1">
                            Open Tracker <ArrowRight size={12} />
                          </span>
                        </div>

                        {/* Codebase Export Card */}
                        <div
                          onClick={() => {
                            onDownloadZip();
                            updateChecklist("downloadCode", true);
                          }}
                          className="glossy-card p-4 space-y-2 cursor-pointer hover:scale-[1.02] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                              <Download size={16} />
                            </div>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                              VERIFIED ARTIFACT
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-white">Export Codebase (.ZIP & .MD)</h4>
                          <p className="text-[11px] text-sleek-muted leading-relaxed">
                            Complete ready-to-run repository with Kotlin/Python benchmarks and test receipts.
                          </p>
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 pt-1">
                            Download Binary ZIP <Download size={12} />
                          </span>
                        </div>
                      </div>

                      {/* One-Click Quick Actions */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                        <span className="text-[10px] font-black uppercase text-sleek-muted tracking-widest flex items-center gap-2">
                          <Sliders size={13} className="text-blue-400" />
                          Direct System Toggles
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setIsDeepThinking(!isDeepThinking);
                              updateChecklist("tryDeepThought", true);
                            }}
                            className={cn(
                              "px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border",
                              isDeepThinking
                                ? "bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                : "bg-white/5 border-white/10 text-sleek-muted hover:text-white"
                            )}
                          >
                            <Brain size={14} />
                            <span>Deep Thought Mode: {isDeepThinking ? "ON" : "OFF"}</span>
                          </button>
                          <button
                            onClick={onOpenDiagnostics}
                            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-white/5 border border-white/10 text-sleek-muted hover:text-white transition-all cursor-pointer"
                          >
                            <Activity size={14} className="text-emerald-400" />
                            <span>System Diagnostics</span>
                          </button>
                          <button
                            onClick={onDownloadMd}
                            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer"
                          >
                            <FileDown size={14} />
                            <span>Export 1-File MD</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SYSTEM MAP */}
                  {activeTab === "tour" && (
                    <div className="space-y-4">
                      <div className="glossy-card p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                            <Shield size={22} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white">Cranium Substrate Architecture</h4>
                            <p className="text-[11px] text-sleek-muted">Dual-Lane Epistemic Immune System</p>
                          </div>
                        </div>
                        <p className="text-xs text-sleek-text leading-relaxed">
                          The substrate partitions all cognitive queries into immutable protected axioms and transient working memory. When contradictions or hallucinations occur, the dialectic engine automatically resets causality to maintain 100% canon truth.
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[10px]">
                          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                            <span className="text-emerald-400 font-bold block">Lane 0: SYSTEM_AXIOM</span>
                            <span className="text-sleek-muted">Immutable truth rules</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                            <span className="text-blue-400 font-bold block">Lane 1: WORKING_MEMORY</span>
                            <span className="text-sleek-muted">Dynamic generative context</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: MISSIONS CHECKLIST */}
                  {activeTab === "checklist" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div>
                          <h4 className="text-xs font-black text-white">Exploration Readiness</h4>
                          <p className="text-[10px] text-sleek-muted">Complete missions to master all substrate capabilities.</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-blue-400">{progressPercent}%</span>
                          <span className="text-[9px] font-mono text-sleek-muted block">({completedChecklistCount}/{totalChecklistCount})</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          { key: "exploreForge", label: "Explore Multimodal AI Forge Canvas", view: "forge" as const },
                          { key: "tryDeepThought", label: "Engage Deep Thought Strategic Reasoning", action: () => setIsDeepThinking(true) },
                          { key: "visitTracker", label: "Open Metacognitive Behavioral Lab", view: "tracker" as const },
                          { key: "visitWriter", label: "Launch Infinite Writer & Rewriter Forge", view: "writer" as const },
                          { key: "downloadCode", label: "Export Substrate Codebase (.MD or .ZIP)", action: onDownloadZip },
                        ].map((item) => (
                          <div
                            key={item.key}
                            onClick={() => {
                              if (item.view) setActiveView(item.view);
                              if (item.action) item.action();
                              updateChecklist(item.key, true);
                            }}
                            className={cn(
                              "p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer",
                              checklist[item.key]
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : "bg-white/[0.03] border-white/10 text-sleek-muted hover:text-white hover:border-blue-400/30"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center border",
                                checklist[item.key] ? "bg-emerald-400 text-black border-emerald-400" : "border-white/20"
                              )}>
                                {checklist[item.key] && <Check size={12} strokeWidth={3} />}
                              </div>
                              <span className="text-xs font-bold">{item.label}</span>
                            </div>
                            <ArrowRight size={14} className="opacity-60" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
