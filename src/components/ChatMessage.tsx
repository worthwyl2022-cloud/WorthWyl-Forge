import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Plus, ChevronRight, Video as VideoIcon, Download, Mic, Volume2, Scissors } from "lucide-react";
import { cn } from "../lib/utils";
import type { ChatMessage as ChatMessageType } from "../lib/gemini";
import { VideoEditor } from "./VideoEditor";

interface ChatMessageProps {
  message: ChatMessageType;
  onExtend?: (prompt: string) => void;
  onEdit?: (editedData: any) => void;
}

export function ChatMessage({ message, onExtend, onEdit }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [showExtendInput, setShowExtendInput] = useState(false);
  const [extendPrompt, setExtendPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleExtend = () => {
    if (extendPrompt.trim() && onExtend) {
      onExtend(extendPrompt.trim());
      setExtendPrompt("");
      setShowExtendInput(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] lg:max-w-[70%] px-5 py-4 rounded-xl border transition-all duration-300",
          isUser 
            ? "bg-sleek-accent/10 border-sleek-accent/30 text-white shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
            : "bg-sleek-surface border-sleek-border text-sleek-text shadow-sm"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          {isUser ? (
            <div className="w-1.5 h-1.5 rounded-full bg-sleek-accent shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-sleek-muted" />
          )}
          <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
            {isUser ? "System User" : "Forge Core v8.1"}
          </div>
        </div>
        <div className="markdown-body">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        
        {message.imageUrl && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="rounded-lg overflow-hidden border border-white/10 group relative">
              <img 
                src={message.imageUrl} 
                alt="Generated visual" 
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => handleDownload(message.imageUrl!, `forge-img-${Date.now()}.png`)}
                className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-sleek-accent"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        )}

        {message.audioUrl && (
          <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-sleek-accent flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Volume2 size={18} className="animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-sleek-accent mb-2">Neural Audio Signal</div>
              <audio 
                src={message.audioUrl} 
                controls 
                className="w-full h-8 grayscale brightness-125"
              />
            </div>
            <button 
              onClick={() => handleDownload(message.audioUrl!, `forge-audio-${Date.now()}.mp3`)}
              className="p-2 bg-white/5 rounded-lg text-sleek-muted opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:text-white"
            >
              <Download size={14} />
            </button>
          </div>
        )}

        {message.videoUrl && (
          <div className="mt-4 flex flex-col gap-3">
            {message.isSimulation && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-sleek-accent/5 border border-sleek-accent/10">
                <div className="w-2 h-2 rounded-full bg-sleek-accent animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-sleek-accent">Neural Simulation Mode [Free]</span>
                <span className="text-[8px] font-medium text-sleek-muted ml-auto block max-w-[150px] truncate">{message.simulationData}</span>
              </div>
            )}
            <div className="rounded-lg overflow-hidden border border-white/10 group relative">
              <video 
                src={message.videoUrl} 
                controls 
                className="w-full h-auto"
              />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-black/60 rounded-lg text-white hover:bg-sleek-accent flex items-center gap-2"
                >
                  <Scissors size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Edit</span>
                </button>
                <button 
                  onClick={() => handleDownload(message.videoUrl!, `forge-video-${Date.now()}.mp4`)}
                  className="p-2 bg-black/60 rounded-lg text-white hover:bg-sleek-accent"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <VideoEditor 
                  initialUrl={message.videoUrl}
                  duration={7} // Assume 7s for now, ideally get from metadata or ref
                  onClose={() => setIsEditing(false)}
                  onSave={(editedData) => {
                    if (onEdit) onEdit(editedData);
                    setIsEditing(false);
                  }}
                />
              )}
            </AnimatePresence>
            
            {!isUser && message.videoObject && (
              <div className="flex flex-col gap-2">
                {!showExtendInput ? (
                  <button 
                    onClick={() => setShowExtendInput(true)}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-sleek-accent/10 border border-sleek-accent/20 text-[10px] font-black uppercase tracking-widest text-sleek-accent hover:bg-sleek-accent hover:text-white transition-all group"
                  >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                    Extend Sequence (+7s)
                  </button>
                ) : (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                      autoFocus
                      type="text"
                      value={extendPrompt}
                      onChange={(e) => setExtendPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleExtend()}
                      placeholder="What happens next?"
                      className="flex-1 bg-black/20 border border-sleek-border rounded-lg px-3 py-2 text-[10px] font-mono uppercase tracking-widest focus:border-sleek-accent/50 focus:ring-0"
                    />
                    <button 
                      onClick={handleExtend}
                      disabled={!extendPrompt.trim()}
                      className="p-2 rounded-lg bg-sleek-accent text-white disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button 
                      onClick={() => setShowExtendInput(false)}
                      className="p-2 rounded-lg bg-white/5 text-sleek-muted hover:text-white transition-all"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                  </div>
                )}
                <div className="text-[8px] uppercase tracking-[0.2em] text-sleek-muted font-bold flex items-center gap-1.5 px-1 py-0.5">
                  <VideoIcon size={10} />
                  Sequence depth: Stable (5-7s typical)
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
