import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Image as ImageIcon, Video as VideoIcon, Mic, Music, Paperclip, X, Settings2, Sliders, Monitor, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import type { CinematicConfig } from "../lib/gemini";

interface ChatInputProps {
  onSend: (text: string, imageUrl?: string, audioUrl?: string) => void;
  onGenerateImage: (prompt: string, config: CinematicConfig) => void;
  onGenerateVideo: (prompt: string, imageUrl?: string, config?: CinematicConfig) => void;
  onGenerateAudio: (prompt: string, type: "song" | "voice" | "sfx", referenceAudio?: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, onGenerateImage, onGenerateVideo, onGenerateAudio, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [mode, setMode] = useState<'message' | 'vision' | 'cinematic' | 'acoustic'>('message');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const [cinematicConfig, setCinematicConfig] = useState<CinematicConfig>({
    aspectRatio: "16:9",
    style: "cinematic",
    motion: "medium",
    quality: "high"
  });

  const [audioType, setAudioType] = useState<"song" | "voice" | "sfx">("voice");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanInput = input.trim();
    
    if (!cleanInput && !selectedImage && !selectedAudio && mode === 'message') return;
    if (isLoading) return;

    if (mode === 'vision') {
      onGenerateImage(cleanInput || "Generate a stunning visual masterpiece.", cinematicConfig);
      setInput("");
      setSelectedImage(null);
    } else if (mode === 'cinematic') {
      const videoPrompt = cleanInput || (selectedImage ? "Animate this scene with cinematic movement and realistic physics." : "");
      if (videoPrompt) {
        onGenerateVideo(videoPrompt, selectedImage || undefined, cinematicConfig);
        setInput("");
        setSelectedImage(null);
      }
    } else if (mode === 'acoustic') {
      if (cleanInput || selectedAudio) {
        onGenerateAudio(cleanInput, audioType, selectedAudio || undefined);
        setInput("");
        setSelectedAudio(null);
      }
    } else {
      if (cleanInput || selectedImage || selectedAudio) {
        onSend(cleanInput, selectedImage || undefined, selectedAudio || undefined);
        setInput("");
        setSelectedImage(null);
        setSelectedAudio(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (file.type.startsWith("image/")) {
          setSelectedImage(result);
          setSelectedAudio(null);
        } else if (file.type.startsWith("audio/")) {
          setSelectedAudio(result);
          setSelectedImage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const modes = [
    { id: 'message', label: 'Message', icon: ArrowUp },
    { id: 'vision', label: 'Vision', icon: ImageIcon },
    { id: 'cinematic', label: 'Cinematic', icon: VideoIcon },
    { id: 'acoustic', label: 'Acoustic', icon: Zap },
  ] as const;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-8">
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 bg-sleek-surface border border-sleek-border p-4 rounded-xl shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-sleek-muted tracking-widest flex items-center gap-1.5">
                <Monitor size={10} /> Aspect Ratio
              </label>
              <div className="flex gap-1">
                {(["16:9", "4:3", "1:1", "9:16"] as const).map(ratio => (
                  <button 
                    key={ratio}
                    onClick={() => setCinematicConfig(prev => ({ ...prev, aspectRatio: ratio as any }))}
                    className={cn(
                      "flex-1 py-1 rounded border text-[9px] font-bold transition-all",
                      cinematicConfig.aspectRatio === ratio 
                        ? "bg-sleek-accent text-white border-sleek-accent" 
                        : "bg-black/20 border-white/10 text-sleek-muted hover:text-white"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-sleek-muted tracking-widest flex items-center gap-1.5">
                <Sliders size={10} /> Motion
              </label>
              <div className="flex gap-1">
                {(["low", "medium", "high"] as const).map(m => (
                  <button 
                    key={m}
                    onClick={() => setCinematicConfig(prev => ({ ...prev, motion: m }))}
                    className={cn(
                      "flex-1 py-1 rounded border text-[9px] font-bold transition-all capitalize",
                      cinematicConfig.motion === m 
                        ? "bg-sleek-accent text-white border-sleek-accent" 
                        : "bg-black/20 border-white/10 text-sleek-muted hover:text-white"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-sleek-muted tracking-widest flex items-center gap-1.5">
                <Sparkles size={10} /> Render Style
              </label>
              <select 
                value={cinematicConfig.style}
                onChange={(e) => setCinematicConfig(prev => ({ ...prev, style: e.target.value as any }))}
                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-[9px] font-bold text-white focus:outline-none focus:border-sleek-accent"
              >
                <option value="cinematic">Cinematic</option>
                <option value="photorealistic">Photorealistic</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="brutalist">Brutalist</option>
                <option value="anime">Anime</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-sleek-muted tracking-widest flex items-center gap-1.5">
                <Zap size={10} /> Precision
              </label>
              <div className="flex gap-1">
                {(["standard", "high", "ultra"] as const).map(q => (
                  <button 
                    key={q}
                    onClick={() => setCinematicConfig(prev => ({ ...prev, quality: q }))}
                    className={cn(
                      "flex-1 py-1 rounded border text-[9px] font-bold transition-all capitalize",
                      cinematicConfig.quality === q 
                        ? "bg-sleek-accent text-white border-sleek-accent" 
                        : "bg-black/20 border-white/10 text-sleek-muted hover:text-white"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 relative w-32 h-32 rounded-xl overflow-hidden border-2 border-sleek-accent/50 shadow-xl"
          >
            <img src={selectedImage} alt="Attachment" className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        {selectedAudio && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 relative p-4 bg-sleek-surface border border-sleek-accent/30 rounded-xl flex items-center gap-3 w-64 shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-sleek-accent flex items-center justify-center text-white">
              <Mic size={18} />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-sleek-accent truncate">Audio Blueprint</div>
              <div className="text-[8px] text-sleek-muted uppercase font-bold">Signal Attached</div>
            </div>
            <button 
              onClick={() => setSelectedAudio(null)}
              className="p-1 bg-black/20 rounded-full text-sleek-muted hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex bg-sleek-surface p-1 rounded-lg border border-sleek-border items-center overflow-x-auto no-scrollbar">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                if (m.id === 'acoustic' && selectedImage) setSelectedImage(null);
                if (m.id !== 'acoustic' && selectedAudio) setSelectedAudio(null);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap",
                mode === m.id 
                  ? "bg-sleek-accent text-white shadow-lg" 
                  : "text-sleek-muted hover:text-white"
              )}
            >
              <m.icon size={12} />
              {m.label}
            </button>
          ))}
        </div>
        
        <div className="w-[1px] h-4 bg-white/10 mx-1 shrink-0" />
        
        <div className="flex gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sleek-surface border border-sleek-border text-[9px] font-black uppercase tracking-[0.1em] text-sleek-muted hover:text-white hover:border-sleek-accent/50 transition-all disabled:opacity-30"
          >
            <Paperclip size={12} />
          </button>
          
          {(mode === 'vision' || mode === 'cinematic') && (
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.1em] transition-all",
                isConfigOpen 
                  ? "bg-sleek-accent text-white border-sleek-accent" 
                  : "bg-sleek-surface border-sleek-border text-sleek-muted hover:text-white"
              )}
            >
              <Settings2 size={12} />
              Config
            </button>
          )}

          {mode === 'acoustic' && (
            <div className="flex bg-sleek-surface p-1 rounded-lg border border-sleek-border gap-1">
              {(["song", "voice", "sfx"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setAudioType(t)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all",
                    audioType === t ? "bg-sleek-accent text-white" : "text-sleek-muted hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*,audio/*" 
          className="hidden" 
        />
      </div>

      <div className="relative bg-sleek-bg border border-sleek-border p-1 pr-12 focus-within:border-sleek-accent/50 transition-all duration-300 group shadow-lg">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'message' ? "ENTER SYSTEM COMMAND..." :
            mode === 'vision' ? (selectedImage ? "SIGNAL ATTACHED. DESCRIBE MODIFICATIONS..." : "DESCRIBE VISUAL SYNTHESIS...") :
            mode === 'cinematic' ? (selectedImage ? "PHOTO DETECTED. DESCRIBE HOW IT SHOULD MOVE..." : "DESCRIBE CINEMATIC SEQUENCE...") :
            "DESCRIBE ACOUSTIC SIGNAL OR SONG..."
          }
          className="w-full bg-transparent border-none focus:ring-0 text-sleek-text placeholder-sleek-muted/20 py-3 px-4 resize-none min-h-[44px] custom-scrollbar text-sm uppercase tracking-wider font-mono"
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={(mode === 'message' && !input.trim() && !selectedImage) || (mode !== 'message' && mode !== 'acoustic' && !selectedImage && !input.trim()) || (mode === 'acoustic' && !input.trim()) || isLoading}
          className={cn(
            "absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-300",
            ((input.trim() || selectedImage) && !isLoading)
              ? "bg-sleek-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-100"
              : "bg-sleek-surface text-sleek-muted scale-95 opacity-50"
          )}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Sparkles size={18} />
            </motion.div>
          ) : (
            <motion.div
              animate={mode !== 'message' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {mode === 'message' ? <ArrowUp size={18} /> : 
               mode === 'vision' ? <ImageIcon size={18} /> : 
               mode === 'cinematic' ? <VideoIcon size={18} /> :
               audioType === 'song' ? <Music size={18} /> : <Mic size={18} />}
            </motion.div>
          )}
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between px-1">
        <div className="flex gap-4 text-[9px] uppercase tracking-[0.2em] text-sleek-muted font-bold">
          <span className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-sleek-accent animate-pulse" />
            Encryption Active
          </span>
          <span className="flex items-center gap-1.5 opacity-50">
            Node Cluster Alpha
          </span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-sleek-muted font-bold opacity-50">
          Uptime 99.98%
        </div>
      </div>
    </div>
  );
}
