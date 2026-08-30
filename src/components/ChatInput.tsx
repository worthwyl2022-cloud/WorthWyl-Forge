import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Image as ImageIcon, Video as VideoIcon, Mic, Paperclip, X, Settings2, Sliders, Monitor, Zap } from "lucide-react";
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanInput = input.trim();
    
    if (!cleanInput && !selectedImage && !selectedAudio && mode === 'message') return;
    if (isLoading) return;

    if (mode === 'vision') {
      onGenerateImage(cleanInput || "Generate a cinematic visual masterpiece.", cinematicConfig);
      setInput("");
      setSelectedImage(null);
    } else if (mode === 'cinematic') {
      const videoPrompt = cleanInput || (selectedImage ? "Animate this scene with cinematic camera motion and glowing embers." : "");
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
    { id: 'message', label: 'Chat & Reason', icon: ArrowUp },
    { id: 'vision', label: 'Image (Imagen 3)', icon: ImageIcon },
    { id: 'cinematic', label: 'Video (Veo 3.1)', icon: VideoIcon },
    { id: 'acoustic', label: 'Voice / Audio', icon: Mic },
  ] as const;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-6">
      {/* Settings / Config Drawer for Video & Image */}
      <AnimatePresence>
        {isConfigOpen && (mode === 'vision' || mode === 'cinematic') && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="mb-3 glossy-panel p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
          >
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                <Monitor size={11} /> Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-1">
                {(["16:9", "4:3", "1:1", "9:16"] as const).map(ratio => (
                  <button 
                    key={ratio}
                    type="button"
                    onClick={() => setCinematicConfig(prev => ({ ...prev, aspectRatio: ratio as any }))}
                    className={cn(
                      "py-1 rounded-lg border text-[10px] font-bold transition-all",
                      cinematicConfig.aspectRatio === ratio 
                        ? "bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                        : "bg-black/30 border-white/10 text-sleek-muted hover:text-white"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                <Sliders size={11} /> Motion Dynamics
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["low", "medium", "high"] as const).map(m => (
                  <button 
                    key={m}
                    type="button"
                    onClick={() => setCinematicConfig(prev => ({ ...prev, motion: m }))}
                    className={cn(
                      "py-1 rounded-lg border text-[10px] font-bold transition-all capitalize",
                      cinematicConfig.motion === m 
                        ? "bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                        : "bg-black/30 border-white/10 text-sleek-muted hover:text-white"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Visual Style
              </label>
              <select 
                value={cinematicConfig.style}
                onChange={(e) => setCinematicConfig(prev => ({ ...prev, style: e.target.value as any }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white focus:outline-none focus:border-amber-400"
              >
                <option value="cinematic">Cinematic Flare</option>
                <option value="photorealistic">Photorealistic 8K</option>
                <option value="cyberpunk">Fiery Cyberpunk</option>
                <option value="brutalist">Dark Moody</option>
                <option value="anime">Cinematic Anime</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                <Zap size={11} /> Precision
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["standard", "high", "ultra"] as const).map(q => (
                  <button 
                    key={q}
                    type="button"
                    onClick={() => setCinematicConfig(prev => ({ ...prev, quality: q }))}
                    className={cn(
                      "py-1 rounded-lg border text-[10px] font-bold transition-all capitalize",
                      cinematicConfig.quality === q 
                        ? "bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                        : "bg-black/30 border-white/10 text-sleek-muted hover:text-white"
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

      {/* Attachments Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-3 relative inline-block rounded-2xl overflow-hidden border border-amber-500/50 shadow-2xl"
          >
            <img src={selectedImage} alt="Attachment" className="w-24 h-24 object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-1.5 right-1.5 p-1 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}

        {selectedAudio && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-3 inline-flex items-center gap-3 p-3 bg-[#111116] border border-amber-500/30 rounded-2xl shadow-xl"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-black">
              <Mic size={15} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-amber-300">Audio Signal Attached</div>
              <div className="text-[9px] text-sleek-muted">Ready for processing</div>
            </div>
            <button 
              onClick={() => setSelectedAudio(null)}
              className="p-1 text-sleek-muted hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Switcher Pill Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  if (m.id === 'acoustic' && selectedImage) setSelectedImage(null);
                  if (m.id !== 'acoustic' && selectedAudio) setSelectedAudio(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide transition-all whitespace-nowrap cursor-pointer",
                  isActive 
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                    : "bg-white/[0.04] text-sleek-muted hover:text-white hover:bg-white/[0.08] border border-white/5"
                )}
              >
                <Icon size={12} className={isActive ? "text-black" : "text-amber-400"} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(mode === 'vision' || mode === 'cinematic') && (
            <button
              type="button"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer",
                isConfigOpen 
                  ? "bg-amber-500/20 text-amber-300 border-amber-400" 
                  : "bg-white/[0.04] text-sleek-muted border-white/10 hover:text-white"
              )}
            >
              <Settings2 size={11} />
              <span>Options</span>
            </button>
          )}

          {mode === 'acoustic' && (
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded-full border border-white/10">
              {(["voice", "song", "sfx"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAudioType(t)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all",
                    audioType === t ? "bg-amber-500 text-black font-bold" : "text-sleek-muted hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Rounded Input Box */}
      <div className="relative flex items-end gap-2 bg-[#0c0c12]/90 border border-white/12 focus-within:border-amber-500/60 rounded-2xl p-2 pl-3 shadow-[0_10px_35px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2.5 rounded-xl text-sleek-muted hover:text-amber-400 hover:bg-white/5 transition-all disabled:opacity-30 cursor-pointer shrink-0"
          title="Attach Image or Audio file"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'message' ? "Ask WorthWyl AI or describe what you want to create..." :
            mode === 'vision' ? (selectedImage ? "Describe how to reimagine this image..." : "Describe the image you want Imagen 3 to forge...") :
            mode === 'cinematic' ? (selectedImage ? "Describe camera motion and scene evolution..." : "Describe the video scene you want Veo to render...") :
            "Describe the voice narration, music, or sound fx to generate..."
          }
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/30 py-2.5 px-2 resize-none min-h-[44px] custom-scrollbar text-sm leading-relaxed"
          disabled={isLoading}
        />

        {/* Submit / Action Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={(mode === 'message' && !input.trim() && !selectedImage && !selectedAudio) || (mode !== 'message' && mode !== 'acoustic' && !selectedImage && !input.trim()) || (mode === 'acoustic' && !input.trim()) || isLoading}
          className={cn(
            "p-3 rounded-xl transition-all duration-200 cursor-pointer shrink-0",
            ((input.trim() || selectedImage || selectedAudio) && !isLoading)
              ? "glossy-btn-amber text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-100"
              : "bg-white/[0.06] text-white/30 scale-95 cursor-not-allowed"
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
            <ArrowUp size={18} />
          )}
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*,audio/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
}
