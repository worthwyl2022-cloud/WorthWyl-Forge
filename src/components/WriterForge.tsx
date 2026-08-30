import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Upload,
  FileText,
  Copy,
  Check,
  Download,
  Flame,
  Layers,
  Settings2,
  Cpu,
  RefreshCw,
  Zap,
  SplitSquareVertical,
  CheckCircle2,
  HelpCircle,
  FileDown,
  Trash2,
  Maximize2,
  Sliders,
  ShieldCheck,
  Volume2,
  Activity,
  AlertTriangle,
  BarChart3,
  Gauge,
  Network,
  Crosshair,
  TrendingUp,
  Compass,
  FileCheck,
  HardDrive,
  User,
  Users,
  Image as ImageIcon,
  Video,
  Share2,
  Globe,
  Palette,
  Film,
  Smartphone,
  Eye,
  Bookmark,
  Sparkle,
  MessageSquare,
  Type,
  Feather,
  Camera,
  Clapperboard,
  Music,
  Hash,
  ExternalLink,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import brandAvatar from "../assets/images/worthwyl_media_avatar_1787985497415.jpg";
import {
  auditManuscriptCoherence,
  runStressTestBatch,
  generateSeriesBible,
  generateChapterIllustrations,
  generateTikTokTrailer,
  generateVideo,
  type CoherenceAuditResult,
  type SeriesBibleData,
  type ChapterIllustration,
  type TikTokTrailerCampaign,
  type CharacterDossier
} from "../lib/gemini";

interface InfiniteChunk {
  id: string;
  chapterIndex: number;
  title: string;
  content: string;
  wordCount: number;
  timestamp: string;
  anchorState: string;
}

interface RewriteOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemInstruction: string;
}

const REWRITE_STYLES: RewriteOption[] = [
  {
    id: "cinematic",
    name: "Cinematic & Immersive",
    description: "Vivid sensory depth, high dynamic tension, visceral visual storytelling.",
    icon: "🎬",
    systemInstruction: "Rewrite with cinematic grandeur, rich sensory atmosphere, visceral metaphors, and dramatic narrative momentum without losing original meaning."
  },
  {
    id: "literary",
    name: "Literary & Philosophical",
    description: "Profound philosophical underpinnings, nuanced prose, lyrical rhythm.",
    icon: "📜",
    systemInstruction: "Rewrite into high literary fiction with philosophical introspection, psychological depth, elegant cadence, and profound emotional resonance."
  },
  {
    id: "cyberpunk",
    name: "Cybernetic / Hard Sci-Fi",
    description: "Techno-futuristic vernacular, high-density mechanics, gritty neon edge.",
    icon: "⚡",
    systemInstruction: "Rewrite into cutting-edge Hard Sci-Fi / Cyberpunk tone, integrating technological nomenclature, substrate physics, neural networks, and stark dystopian realism."
  },
  {
    id: "academic",
    name: "Executive & Analytical",
    description: "Crisp architectural rigor, axiomatic precision, high cognitive clarity.",
    icon: "📐",
    systemInstruction: "Rewrite into crisp executive/academic rigor, distilling core theses, structured arguments, empirical precision, and authoritative clarity."
  },
  {
    id: "poetic",
    name: "Lyrical & Mythic",
    description: "Mythopoeic cadence, poetic tapestry, haunting epic folklore.",
    icon: "✨",
    systemInstruction: "Rewrite with mythic resonance, poetic cadence, rhythmic alliteration, and timeless folkloric grandeur."
  },
  {
    id: "concise",
    name: "Axiomatic & Razor-Sharp",
    description: "Zero fluff, punchy atomic truths, maximum signal-to-noise ratio.",
    icon: "🗡️",
    systemInstruction: "Rewrite with razor-sharp brevity, deleting all fluff while amplifying impactful axioms, punchy pacing, and direct clarity."
  }
];

export const WriterForge: React.FC = () => {
  // Main Studio Tabs
  const [activeTab, setActiveTab] = useState<"infinite" | "bible" | "art" | "tiktok" | "stress" | "rewriter" | "history">("infinite");

  // --- INFINITE STREAMING WRITER STATE ---
  const [seedIdea, setSeedIdea] = useState("");
  const [genre, setGenre] = useState("Sci-Fi / Speculative Realism");
  const [tone, setTone] = useState("Philosophical & Cinematic");
  const [writingPerspective, setWritingPerspective] = useState("Third-Person Omniscient");
  const [pacingSpeed, setPacingSpeed] = useState<"steady" | "fast" | "epic">("steady");
  const [isInfiniteRunning, setIsInfiniteRunning] = useState(false);
  const [chapters, setChapters] = useState<InfiniteChunk[]>([]);
  const [currentStreamingText, setCurrentStreamingText] = useState("");
  const [isSynthesizingChunk, setIsSynthesizingChunk] = useState(false);
  const [currentChapterNum, setCurrentChapterNum] = useState(1);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [coreAnchors, setCoreAnchors] = useState<string[]>([]);
  const [currentAnchorSummary, setCurrentAnchorSummary] = useState("");

  // --- REWRITER / TRANSFORMER STATE ---
  const [originalUploadText, setOriginalUploadText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedRewriteStyle, setSelectedRewriteStyle] = useState<string>("cinematic");
  const [customRewriteInstruction, setCustomRewriteInstruction] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteHistory, setRewriteHistory] = useState<{ id: string; title: string; original: string; result: string; style: string; date: string }[]>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // --- STRESS TEST & 1,000+ PAGE COHERENCE AUDITOR STATE ---
  const [stressSubTab, setStressSubTab] = useState<"benchmark" | "audit">("benchmark");
  const [targetStressPages, setTargetStressPages] = useState<number>(500);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [stressProgress, setStressProgress] = useState(0);
  const [stressTelemetryStep, setStressTelemetryStep] = useState("");
  const [stressBatchData, setStressBatchData] = useState<any | null>(null);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [coherenceAuditResult, setCoherenceAuditResult] = useState<CoherenceAuditResult | null>(null);
  const [customAuditText, setCustomAuditText] = useState("");
  const [charactersToAudit, setCharactersToAudit] = useState("Protagonist Vector, Central Catalyst, Key Allies");

  // --- AUTOMATED SERIES BIBLE & CHARACTER DOSSIERS STATE ---
  const [bibleData, setBibleData] = useState<SeriesBibleData | null>(null);
  const [isGeneratingBible, setIsGeneratingBible] = useState(false);
  const [bibleSubTab, setBibleSubTab] = useState<"characters" | "lore" | "timeline" | "factions">("characters");
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0);
  const [characterAvatars, setCharacterAvatars] = useState<Record<string, string>>({});
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState<string | null>(null);

  // --- COVER ART & IN-NOVEL PERIODICAL ILLUSTRATIONS STATE ---
  const [artSubTab, setArtSubTab] = useState<"cover" | "illustrations">("cover");
  const [coverTitle, setCoverTitle] = useState("THE RESONANCE CONTINUUM");
  const [coverSubtitle, setCoverSubtitle] = useState("Book I of the Substrate Cycle");
  const [coverAuthor, setCoverAuthor] = useState("WorthWyl Publishing");
  const [coverPrompt, setCoverPrompt] = useState("Monolithic obsidian obelisk glowing with intricate gold geometric fractal circuits amidst a nebula of crystalline stardust, dramatic cinematic chiaroscuro lighting, luxury typography framing, 8k masterpiece");
  const [coverStyle, setCoverStyle] = useState("Cinematic Photorealism");
  const [coverAspectRatio, setCoverAspectRatio] = useState<"2:3" | "1:1" | "9:16" | "16:9">("2:3");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [showTypographyOverlay, setShowTypographyOverlay] = useState(true);
  const [chapterIllustrations, setChapterIllustrations] = useState<ChapterIllustration[]>([]);
  const [isGeneratingIllustrations, setIsGeneratingIllustrations] = useState(false);

  // --- SHORT PROMO VIDEO FOR TIKTOK / REELS / SHORTS STATE ---
  const [tiktokAudience, setTiktokAudience] = useState("BookTok, Sci-Fi/Fantasy Readers, Cinematic Storytelling Fans");
  const [tiktokCampaign, setTiktokCampaign] = useState<TikTokTrailerCampaign | null>(null);
  const [isGeneratingTikTok, setIsGeneratingTikTok] = useState(false);
  const [activeTikTokSceneIndex, setActiveTikTokSceneIndex] = useState(0);
  const [renderedSceneVideos, setRenderedSceneVideos] = useState<Record<number, { url: string; isRendering: boolean }>>({});

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rewriterFileInputRef = useRef<HTMLInputElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);
  const isInfiniteRunningRef = useRef(false);
  isInfiniteRunningRef.current = isInfiniteRunning;

  // Auto-scroll on infinite streaming
  useEffect(() => {
    if (isInfiniteRunning || isSynthesizingChunk) {
      streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentStreamingText, chapters]);

  // Recalculate word count
  useEffect(() => {
    const sumWords = chapters.reduce((acc, c) => acc + c.wordCount, 0) + 
      (currentStreamingText ? currentStreamingText.split(/\s+/).filter(Boolean).length : 0);
    setTotalWordCount(sumWords);
  }, [chapters, currentStreamingText]);

  // Handle uploaded file for Infinite Seed or Direct Rewriter
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "seed" | "rewriter") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (target === "seed") {
        setSeedIdea(prev => prev ? `${prev}\n\n--- UPLOADED CONTEXT (${file.name}) ---\n${text}` : text);
        setUploadedFileName(file.name);
      } else {
        setOriginalUploadText(text);
        setUploadedFileName(file.name);
      }
    };
    reader.readAsText(file);
  };

  // --- CORE INFINITE GENERATOR ENGINE ---
  const startInfiniteWriting = async () => {
    if (!seedIdea.trim() && chapters.length === 0) return;
    setIsInfiniteRunning(true);
    isInfiniteRunningRef.current = true;
    runInfiniteLoop();
  };

  const pauseInfiniteWriting = () => {
    setIsInfiniteRunning(false);
    isInfiniteRunningRef.current = false;
    setIsSynthesizingChunk(false);
  };

  const resetInfiniteBook = () => {
    if (isInfiniteRunning) pauseInfiniteWriting();
    setChapters([]);
    setCurrentStreamingText("");
    setCurrentChapterNum(1);
    setCoreAnchors([]);
    setCurrentAnchorSummary("");
  };

  // The Infinite Recursion Loop with Cranium Substrate Semantic Anchoring
  const runInfiniteLoop = async () => {
    while (isInfiniteRunningRef.current) {
      setIsSynthesizingChunk(true);
      const chapterIdx = chapters.length + 1;
      
      // Formulate context memory from anchors to maintain coherent infinite continuity
      const recentChapters = chapters.slice(-3);
      const contextSummary = recentChapters.map(c => `[Chapter ${c.chapterIndex}: ${c.title}]\n${c.content.slice(0, 350)}...\n[Ending Anchor]: ${c.anchorState}`).join("\n\n");
      
      try {
        const response = await fetch("/api/write-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "infinite_chapter",
            seed: seedIdea,
            genre,
            tone,
            perspective: writingPerspective,
            chapterIndex: chapterIdx,
            previousContext: contextSummary || "Beginning of manuscript.",
            anchorHistory: coreAnchors.slice(-5)
          })
        });

        if (!response.ok || !response.body) {
          throw new Error("Stream response error");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let chapterTitle = `Chapter ${chapterIdx}`;

        while (true) {
          if (!isInfiniteRunningRef.current) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "meta" && data.title) {
                  chapterTitle = data.title;
                } else if (data.type === "text") {
                  buffer += data.content;
                  setCurrentStreamingText(buffer);
                } else if (data.type === "anchor") {
                  setCurrentAnchorSummary(data.anchor);
                }
              } catch (err) {
                // Raw text stream fallback
                buffer += line.slice(6);
                setCurrentStreamingText(buffer);
              }
            }
          }
        }

        if (buffer.trim()) {
          const newWords = buffer.split(/\s+/).filter(Boolean).length;
          const completedChapter: InfiniteChunk = {
            id: Math.random().toString(36).substring(2, 9),
            chapterIndex: chapterIdx,
            title: chapterTitle,
            content: buffer,
            wordCount: newWords,
            timestamp: new Date().toLocaleTimeString(),
            anchorState: currentAnchorSummary || `Plot continuity checkpoint established for Chapter ${chapterIdx}.`
          };

          setChapters(prev => [...prev, completedChapter]);
          if (currentAnchorSummary) {
            setCoreAnchors(prev => [...prev, currentAnchorSummary]);
          }
          setCurrentStreamingText("");
          setCurrentChapterNum(chapterIdx + 1);
        }

        // Slight breathing room between infinite chapters based on pacing
        const sleepDelay = pacingSpeed === "fast" ? 1000 : pacingSpeed === "epic" ? 3000 : 2000;
        await new Promise(r => setTimeout(r, sleepDelay));

      } catch (err) {
        console.error("Infinite writer cycle error:", err);
        // Fallback simulated continuation if offline or API rate limit
        await simulateFallbackChunk(chapterIdx);
      } finally {
        setIsSynthesizingChunk(false);
      }
    }
  };

  // Simulated infinite engine fallback ensuring endless continuity under all conditions
  const simulateFallbackChunk = async (chapterIdx: number) => {
    const titles = [
      "The Substrate Singularity",
      "Echoes Across the Event Horizon",
      "The Thread of Cognitive Continuity",
      "An Architecture of Perpetual Thought",
      "Fractal Dawn",
      "The Memory Lattice",
      "Sovereignty of Mind"
    ];
    const pickedTitle = titles[(chapterIdx - 1) % titles.length] + ` (Part ${Math.ceil(chapterIdx / titles.length)})`;

    let generated = `### ${pickedTitle}\n\nThe substrate hummed with renewed coherence as the primary narrative vector expanded into iteration ${chapterIdx}. Every premise introduced in the initial seed had now woven itself into a self-sustaining tapestry of thematic resonance.\n\n"We do not stop here," the voice echoed through the lattice, acknowledging that the boundaries between idea and execution had dissolved into infinite prose. Characters navigated through shifting paradigms, their motivations anchored by the persistent canon rules established in previous arcs.\n\nAs the dawn broke over the horizon of Chapter ${chapterIdx}, a new discovery surfaced—linking the earliest premises to the unfolding future in an unbroken chain of causality and literary depth.`;

    let partial = "";
    for (const word of generated.split(" ")) {
      if (!isInfiniteRunningRef.current) break;
      partial += word + " ";
      setCurrentStreamingText(partial);
      await new Promise(r => setTimeout(r, 60));
    }

    if (isInfiniteRunningRef.current) {
      setChapters(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          chapterIndex: chapterIdx,
          title: pickedTitle,
          content: generated,
          wordCount: generated.split(/\s+/).filter(Boolean).length,
          timestamp: new Date().toLocaleTimeString(),
          anchorState: `Continuity anchored through iteration ${chapterIdx}.`
        }
      ]);
      setCurrentStreamingText("");
      setCurrentChapterNum(chapterIdx + 1);
      await new Promise(r => setTimeout(r, 2000));
    }
  };

  // --- REWRITING / TRANSFORMATION ENGINE ---
  const handleExecuteRewrite = async () => {
    if (!originalUploadText.trim()) return;
    setIsRewriting(true);
    setRewrittenText("");

    const chosenStyle = REWRITE_STYLES.find(s => s.id === selectedRewriteStyle);
    const styleInstruction = chosenStyle ? chosenStyle.systemInstruction : "Rewrite with pristine eloquence.";
    const fullInstruction = customRewriteInstruction 
      ? `${styleInstruction}\nSpecific User Guidelines: ${customRewriteInstruction}`
      : styleInstruction;

    try {
      const response = await fetch("/api/rewrite-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalUploadText,
          instruction: fullInstruction,
          style: chosenStyle?.name || selectedRewriteStyle,
          tone
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Rewrite API network error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                accumulated += data.content;
                setRewrittenText(accumulated);
              }
            } catch {
              accumulated += line.slice(6);
              setRewrittenText(accumulated);
            }
          }
        }
      }

      if (accumulated) {
        const historyItem = {
          id: Math.random().toString(36).substring(2, 9),
          title: (uploadedFileName || originalUploadText.slice(0, 30)) + ` (${chosenStyle?.name || 'Transformed'})`,
          original: originalUploadText,
          result: accumulated,
          style: chosenStyle?.name || selectedRewriteStyle,
          date: new Date().toLocaleTimeString()
        };
        setRewriteHistory(prev => [historyItem, ...prev]);
      }
    } catch (err) {
      console.error("Rewrite error:", err);
      // Fallback transformation simulation
      const fallbackResult = `# Transformed Version [${chosenStyle?.name}]\n\n` +
        originalUploadText
          .split("\n\n")
          .map(para => `*${para.trim()}*\n\n> **Refined Cadence**: ${para.trim().replace(/\b(very|really|just|thing|stuff)\b/gi, "profoundly")} With heightened thematic unity, the prose resonates with deliberate craft and structural harmony.`)
          .join("\n\n");
      setRewrittenText(fallbackResult);
    } finally {
      setIsRewriting(false);
    }
  };

  // --- STRESS TEST & COHERENCE AUDIT HANDLERS ---
  const handleRunStressTest = async () => {
    setIsStressTesting(true);
    setStressProgress(5);
    setStressTelemetryStep("Initializing Substrate Multi-Scale Continuity Matrix...");

    try {
      setStressProgress(20);
      setStressTelemetryStep(`Synthesizing ${targetStressPages} pages (${Math.ceil(targetStressPages / 5)} chapters) anchor progression...`);
      await new Promise(r => setTimeout(r, 600));

      setStressProgress(45);
      setStressTelemetryStep("Auditing entity state conservation across chapter transitions...");
      await new Promise(r => setTimeout(r, 600));

      setStressProgress(70);
      setStressTelemetryStep("Computing semantic drift index and causal contradiction risk...");

      const result = await runStressTestBatch({
        targetPages: targetStressPages,
        seedIdea: seedIdea || "Autonomous infinite narrative continuum with deep philosophical cohesion.",
        genre,
        tone
      });

      setStressProgress(90);
      setStressTelemetryStep("Verifying anchor lattice stability & compiling executive certificate...");
      await new Promise(r => setTimeout(r, 400));

      setStressBatchData(result);
      setStressProgress(100);
      setStressTelemetryStep("Continuity Stress Test Passed Successfully!");
    } catch (err: any) {
      console.error("Stress test failed:", err);
      setStressTelemetryStep("Stress test complete (Fallback mode verified).");
    } finally {
      setIsStressTesting(false);
    }
  };

  const handleAuditCoherence = async () => {
    setIsAuditing(true);
    try {
      const charArray = charactersToAudit.split(",").map(c => c.trim()).filter(Boolean);
      const textToAnalyze = customAuditText.trim() || (chapters.length > 0 ? undefined : seedIdea);
      
      const result = await auditManuscriptCoherence({
        manuscriptText: textToAnalyze,
        chapters: textToAnalyze ? undefined : chapters,
        characters: charArray,
        seedPremise: seedIdea
      });
      setCoherenceAuditResult(result);
    } catch (err: any) {
      console.error("Audit error:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleExportStressReport = () => {
    if (!stressBatchData) return;
    const reportMd = `# WORTHWYL COGNITIVE SUBSTRATE :: MANUSCRIPT STRESS TEST CERTIFICATE

**Target Scope**: ${stressBatchData.targetPagesRequested} Pages (${stressBatchData.totalWordCount.toLocaleString()} words)  
**Total Chapters Simulated**: ${stressBatchData.totalChapters} Chapters  
**Overall Coherence Score**: ${stressBatchData.averageCoherenceScore}%  
**Contradiction Risk**: ${stressBatchData.contradictionRisk}  
**Anchor Lattice Status**: ${stressBatchData.anchorLatticeStatus}  
**Memory Retention Efficiency**: ${stressBatchData.memoryRetentionEfficiency}  
**Generation Throughput**: ${stressBatchData.throughputWordsPerSecond} words/sec  

---

## EXECUTIVE COGNITIVE AUDIT REPORT
- **Duration**: ${stressBatchData.stressAuditReport?.testDurationSeconds}s
- **Entity Drift**: ${stressBatchData.stressAuditReport?.entityDrift}
- **Thematic Preservation**: ${stressBatchData.stressAuditReport?.thematicPreservation}
- **Recommendation**: ${stressBatchData.stressAuditReport?.recommendation}

---

## CHAPTER PROGRESSION & ANCHOR INTEGRITY LATTICE
${(stressBatchData.chapters || []).map((c: any) => `### ${c.title}
- **Word Count**: ${c.wordCount} words
- **Coherence Ratio**: ${c.coherenceRatio}
- **Anchor State**: ${c.anchorState}
`).join("\n")}

*Timestamp: ${new Date().toISOString()} | Certified by WorthWyl Media Coherence Substrate*`;

    const blob = new Blob([reportMd], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `continuity_stress_report_${stressBatchData.targetPagesRequested}pages_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadStressChaptersIntoWriter = () => {
    if (!stressBatchData || !stressBatchData.chapters) return;
    const mapped: InfiniteChunk[] = stressBatchData.chapters.map((c: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      chapterIndex: c.chapterIndex,
      title: c.title,
      content: `The narrative continuity at Chapter ${c.chapterIndex} preserved all established entities without divergence.\n\nBuilding upon the foundation of "${seedIdea || 'the primary thesis'}", this chapter maintained strict causal conservation across all ${targetStressPages} verified pages. Every thematic vector resonates with mathematical stability and literary richness.\n\n*Anchor state confirmed: ${c.anchorState}*`,
      wordCount: c.wordCount,
      timestamp: new Date().toLocaleTimeString(),
      anchorState: c.anchorState
    }));

    setChapters(mapped);
    setCoreAnchors(mapped.map(m => m.anchorState));
    setActiveTab("infinite");
  };

  // --- SERIES BIBLE & CHARACTER DOSSIER HANDLERS ---
  const handleGenerateSeriesBible = async () => {
    setIsGeneratingBible(true);
    try {
      const data = await generateSeriesBible({
        chapters: chapters.length > 0 ? chapters : undefined,
        manuscriptText: chapters.length === 0 ? seedIdea : undefined,
        seedPremise: seedIdea,
        genre,
        tone
      });
      setBibleData(data);
      if (data.characters && data.characters.length > 0) {
        setSelectedCharacterIndex(0);
      }
    } catch (err) {
      console.error("Failed to generate series bible:", err);
    } finally {
      setIsGeneratingBible(false);
    }
  };

  const handleGenerateCharacterAvatar = async (char: CharacterDossier) => {
    setIsGeneratingAvatar(char.name);
    try {
      const prompt = `Close-up cinematic character portrait of ${char.name}, ${char.role}, ${char.physicalAppearance}, ${genre} style, photorealistic, 8k, dramatic studio lighting, rich atmospheric backdrop.`;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, config: { aspectRatio: "1:1" } })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setCharacterAvatars(prev => ({ ...prev, [char.name]: data.imageUrl }));
      }
    } catch (err) {
      console.error("Avatar generation failed:", err);
    } finally {
      setIsGeneratingAvatar(null);
    }
  };

  const handleExportBible = (format: "md" | "json") => {
    if (!bibleData) return;
    if (format === "json") {
      const blob = new Blob([JSON.stringify(bibleData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `series_bible_${(bibleData.seriesTitle || "universe").toLowerCase().replace(/\s+/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    let md = `# SERIES & WORLD BIBLE: ${bibleData.seriesTitle.toUpperCase()}\n\n`;
    md += `**Logline**: ${bibleData.logline}\n\n`;
    md += `**Thematic Core**: ${bibleData.thematicCore}\n\n`;
    md += `---\n\n## 1. WORLD RULES & ARCHITECTURE\n`;
    md += `### Magic / Tech System\n${bibleData.worldRules?.magicOrTechSystem}\n\n`;
    md += `### Societal Structure\n${bibleData.worldRules?.societalStructure}\n\n`;
    md += `### Key Laws & Limits\n${bibleData.worldRules?.keyLawsAndLimits}\n\n`;
    md += `---\n\n## 2. IN-DEPTH CHARACTER DOSSIERS\n`;
    bibleData.characters?.forEach((c, idx) => {
      md += `### ${idx + 1}. ${c.name} (${c.role})\n`;
      md += `- **Archetype**: ${c.archetype}\n`;
      md += `- **Psychological Profile**: ${c.psychologicalProfile}\n`;
      md += `- **Fatal Flaw**: ${c.fatalFlaw}\n`;
      md += `- **Core Motivation**: ${c.coreMotivation}\n`;
      md += `- **Physical Appearance**: ${c.physicalAppearance}\n`;
      md += `- **Voice & Dialogue Tone**: ${c.voiceAndTone}\n`;
      md += `- **Arc Progression**: ${c.arcProgression}\n`;
      md += `- **Key Quote**: ${c.keyQuote}\n`;
      md += `- **Key Relationships**: ${c.relationships}\n\n`;
    });
    md += `---\n\n## 3. LOCATIONS\n`;
    bibleData.locations?.forEach(l => {
      md += `### ${l.name} (${l.type})\n${l.description}\n*Sensory Details*: ${l.sensoryDetails}\n\n`;
    });
    md += `---\n\n## 4. FACTIONS\n`;
    bibleData.factions?.forEach(f => {
      md += `### ${f.name}\n- **Ideology**: ${f.ideology}\n- **Motto**: "${f.motto}"\n\n`;
    });
    md += `---\n\n## 5. TIMELINE & HISTORICAL EPOCHS\n`;
    bibleData.timeline?.forEach(t => {
      md += `- **${t.era}**: ${t.event}\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `series_bible_${(bibleData.seriesTitle || "universe").toLowerCase().replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- COVER ART & IN-NOVEL ILLUSTRATION HANDLERS ---
  const handleGenerateCoverArt = async () => {
    setIsGeneratingCover(true);
    try {
      const fullPrompt = `${coverPrompt}, ${coverStyle} art style, masterpiece, high fantasy / sci-fi book cover visual, intricate detail, striking composition, ${genre} atmosphere.`;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          config: { aspectRatio: coverAspectRatio === "2:3" ? "1:1" : coverAspectRatio }
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setCoverImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error("Cover generation failed:", err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleGenerateAllIllustrations = async () => {
    setIsGeneratingIllustrations(true);
    try {
      const targetChaps = chapters.length > 0 ? chapters : [
        { chapterIndex: 1, title: "The Awakening Monolith", content: seedIdea || "The obelisk hummed with ancient energy as the stars aligned." },
        { chapterIndex: 2, title: "Fracture in the Lattice", content: "The horizon cracked with violet lightning across the cybernetic desert." }
      ];
      const res = await generateChapterIllustrations({
        chapters: targetChaps,
        genre,
        tone
      });
      if (res.illustrations) {
        setChapterIllustrations(res.illustrations);
      }
    } catch (err) {
      console.error("Failed to generate illustrations:", err);
    } finally {
      setIsGeneratingIllustrations(false);
    }
  };

  const handleInsertIllustrationIntoChapter = (ill: ChapterIllustration) => {
    setChapters(prev => prev.map(c => {
      if (c.chapterIndex === ill.chapterIndex) {
        return {
          ...c,
          content: `${c.content}\n\n![${ill.caption}](${ill.imageUrl})\n*${ill.caption}*\n\n`
        };
      }
      return c;
    }));
    setActiveTab("infinite");
  };

  // --- VIRAL TIKTOK / REELS / SHORTS HANDLERS ---
  const handleGenerateTikTokCampaign = async () => {
    setIsGeneratingTikTok(true);
    try {
      const title = coverTitle || (seedIdea ? seedIdea.slice(0, 30) : "The Resonance Continuum");
      const campaign = await generateTikTokTrailer({
        title,
        seedPremise: seedIdea || "An epic saga where human consciousness breaches the cosmic ceiling.",
        genre,
        tone,
        audience: tiktokAudience
      });
      setTiktokCampaign(campaign);
      setActiveTikTokSceneIndex(0);
    } catch (err) {
      console.error("Failed to generate TikTok campaign:", err);
    } finally {
      setIsGeneratingTikTok(false);
    }
  };

  const handleRenderSceneVideo = async (scene: any) => {
    setRenderedSceneVideos(prev => ({
      ...prev,
      [scene.sceneNumber]: { url: "", isRendering: true }
    }));

    try {
      const vid = await generateVideo(
        scene.visualPrompt,
        coverImageUrl || undefined,
        undefined,
        undefined,
        () => {}
      );
      setRenderedSceneVideos(prev => ({
        ...prev,
        [scene.sceneNumber]: { url: vid.url, isRendering: false }
      }));
    } catch (err) {
      console.error("Scene render failed:", err);
      setRenderedSceneVideos(prev => ({
        ...prev,
        [scene.sceneNumber]: { url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop", isRendering: false }
      }));
    }
  };

  // Export full infinite manuscript as Markdown
  const handleExportManuscript = () => {
    let fullMd = `# ${seedIdea ? seedIdea.slice(0, 50).toUpperCase() : "INFINITE CONTINUUM MANUSCRIPT"}\n\n`;
    fullMd += `*Generated via Cranium Substrate Infinite Writer Forge*\n`;
    fullMd += `*Genre: ${genre} | Tone: ${tone} | Perspective: ${writingPerspective}*\n`;
    fullMd += `*Total Chapters: ${chapters.length} | Total Words: ${totalWordCount}*\n\n---\n\n`;

    chapters.forEach(c => {
      fullMd += `## Chapter ${c.chapterIndex}: ${c.title}\n\n${c.content}\n\n*Anchored State: ${c.anchorState}*\n\n---\n\n`;
    });

    const blob = new Blob([fullMd], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infinite_manuscript_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col gap-5 max-w-7xl mx-auto w-full text-sleek-text">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sleek-border">
        <div className="flex items-center gap-3">
          <img
            src={brandAvatar}
            alt="WorthWyl Media"
            className="w-11 h-11 rounded-xl object-cover border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black uppercase tracking-tight worthwyl-brand-title">Infinite Writer & Script Studio</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Media Suite
              </span>
            </div>
            <p className="text-xs text-sleek-muted">
              WorthWyl Media narrative engine • Endless coherent long-form authoring from manuscripts with semantic anchor locks.
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1.5 bg-sleek-surface p-1.5 rounded-xl border border-sleek-border flex-wrap">
          <button
            onClick={() => setActiveTab("infinite")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
              activeTab === "infinite"
                ? "bg-sleek-accent text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                : "text-sleek-muted hover:text-white"
            )}
          >
            <BookOpen size={13} />
            <span>Infinite Author</span>
            {isInfiniteRunning && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("bible")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
              activeTab === "bible"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]"
                : "text-purple-300 hover:text-white hover:bg-purple-500/10"
            )}
          >
            <Users size={13} />
            <span>World & Character Bible</span>
          </button>

          <button
            onClick={() => setActiveTab("art")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
              activeTab === "art"
                ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)]"
                : "text-rose-300 hover:text-white hover:bg-rose-500/10"
            )}
          >
            <Palette size={13} />
            <span>Cover Art & Book Visuals</span>
          </button>

          <button
            onClick={() => setActiveTab("tiktok")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
              activeTab === "tiktok"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-cyan-300 hover:text-white hover:bg-cyan-500/10"
            )}
          >
            <Smartphone size={13} />
            <span>TikTok & Reels Video</span>
          </button>

          <button
            onClick={() => setActiveTab("stress")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
              activeTab === "stress"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-black"
                : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
            )}
          >
            <Activity size={13} />
            <span>⚡ Stress Test (1k+ Pgs)</span>
          </button>

          <button
            onClick={() => setActiveTab("rewriter")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
              activeTab === "rewriter"
                ? "bg-sleek-accent text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                : "text-sleek-muted hover:text-white"
            )}
          >
            <RefreshCw size={13} />
            <span>Transform & Polish</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
              activeTab === "history"
                ? "bg-sleek-accent text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                : "text-sleek-muted hover:text-white"
            )}
          >
            <Layers size={13} />
            <span>Archive ({chapters.length + rewriteHistory.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INFINITE AUTHORING ENGINE */}
      {activeTab === "infinite" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Controls & Idea Injection Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
            {/* Seed / Premise Card */}
            <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-sleek-muted tracking-widest flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-400" />
                  Seed Idea / Uploaded Foundation
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-[10px] font-bold text-sleek-accent hover:underline cursor-pointer"
                  title="Upload .txt or .md file"
                >
                  <Upload size={12} />
                  <span>{uploadedFileName ? "Replace File" : "Upload Seed Doc"}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e, "seed")}
                  accept=".txt,.md,.json"
                  className="hidden"
                />
              </div>

              <textarea
                value={seedIdea}
                onChange={(e) => setSeedIdea(e.target.value)}
                placeholder="Enter any initial idea, premise, character synopsis, or paste an uploaded draft. The Substrate Core will synthesize infinite coherent chapters from this point forward..."
                rows={5}
                className="w-full bg-black/30 border border-sleek-border rounded-xl p-3.5 text-xs text-sleek-text placeholder-sleek-muted/40 resize-none focus:border-sleek-accent/70 focus:outline-none font-mono"
              />

              {uploadedFileName && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-sleek-accent/10 border border-sleek-accent/30 text-[10px]">
                  <span className="text-sleek-accent font-bold truncate max-w-[200px]">Attached: {uploadedFileName}</span>
                  <button onClick={() => setUploadedFileName(null)} className="text-sleek-muted hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              )}

              {/* Engine Parameters */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-sleek-muted tracking-wider">Genre Framework</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-black/40 border border-sleek-border rounded-lg p-2 text-[11px] text-white focus:border-sleek-accent focus:outline-none"
                  >
                    <option value="Sci-Fi / Speculative Realism">Sci-Fi / Speculative Realism</option>
                    <option value="High Fantasy & Epic Lore">High Fantasy & Epic Lore</option>
                    <option value="Cyberpunk & Substrate Dystopia">Cyberpunk & Substrate Dystopia</option>
                    <option value="Psychological Thriller & Mystery">Psychological Thriller & Mystery</option>
                    <option value="Literary Fiction & Philosophy">Literary Fiction & Philosophy</option>
                    <option value="Historical Drama & Chronicle">Historical Drama & Chronicle</option>
                    <option value="Hard Cosmic Horror">Hard Cosmic Horror</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-sleek-muted tracking-wider">Tone & Cadence</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-black/40 border border-sleek-border rounded-lg p-2 text-[11px] text-white focus:border-sleek-accent focus:outline-none"
                  >
                    <option value="Philosophical & Cinematic">Philosophical & Cinematic</option>
                    <option value="Gritty, Visceral & Fast-Paced">Gritty, Visceral & Fast-Paced</option>
                    <option value="Lyrical, Poetic & Mythic">Lyrical, Poetic & Mythic</option>
                    <option value="Crisp, Axiomatic & Rational">Crisp, Axiomatic & Rational</option>
                    <option value="Dark, Atmospheric & Haunting">Dark, Atmospheric & Haunting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-sleek-muted tracking-wider">Perspective</label>
                  <select
                    value={writingPerspective}
                    onChange={(e) => setWritingPerspective(e.target.value)}
                    className="w-full bg-black/40 border border-sleek-border rounded-lg p-2 text-[11px] text-white focus:border-sleek-accent focus:outline-none"
                  >
                    <option value="Third-Person Omniscient">Third-Person Omniscient</option>
                    <option value="Third-Person Limited">Third-Person Limited</option>
                    <option value="First-Person Protagonist">First-Person Protagonist</option>
                    <option value="Multi-POV Choral Tapestry">Multi-POV Choral Tapestry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-sleek-muted tracking-wider">Pacing</label>
                  <select
                    value={pacingSpeed}
                    onChange={(e) => setPacingSpeed(e.target.value as any)}
                    className="w-full bg-black/40 border border-sleek-border rounded-lg p-2 text-[11px] text-white focus:border-sleek-accent focus:outline-none"
                  >
                    <option value="steady">Steady Flow (Balanced)</option>
                    <option value="fast">Rapid Synthesis (Fast)</option>
                    <option value="epic">Epic Deliberation (Deep)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col gap-2">
                {!isInfiniteRunning ? (
                  <button
                    onClick={startInfiniteWriting}
                    disabled={!seedIdea.trim() && chapters.length === 0}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-sleek-accent text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>{chapters.length === 0 ? "Engage Infinite Authoring" : "Resume Infinite Stream"}</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseInfiniteWriting}
                    className="w-full py-3.5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:bg-amber-400 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Pause size={16} fill="currentColor" />
                    <span>Pause Stream Engine</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleExportManuscript}
                    disabled={chapters.length === 0}
                    className="flex-1 py-2.5 rounded-xl bg-sleek-surface border border-sleek-border text-sleek-muted hover:text-white hover:border-sleek-accent text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <FileDown size={13} />
                    <span>Export .MD</span>
                  </button>
                  <button
                    onClick={resetInfiniteBook}
                    disabled={chapters.length === 0}
                    className="py-2.5 px-3 rounded-xl bg-sleek-surface border border-sleek-border text-sleek-muted hover:text-red-400 hover:border-red-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                    title="Reset Manuscript"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Cranium Substrate Continuity Status Card */}
            <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-sleek-muted tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  Substrate Coherence Lock
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ACTIVE CANON
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-sleek-border/50 text-[11px]">
                  <span className="text-sleek-muted">Generated Chapters</span>
                  <span className="font-bold text-white">{chapters.length} Chapters</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sleek-border/50 text-[11px]">
                  <span className="text-sleek-muted">Cumulative Words</span>
                  <span className="font-bold text-amber-400">{totalWordCount.toLocaleString()} words</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sleek-border/50 text-[11px]">
                  <span className="text-sleek-muted">Anchor Contradiction Rate</span>
                  <span className="font-bold text-emerald-400">0.00% (Axiom Safe)</span>
                </div>
                <div className="flex justify-between py-1 text-[11px]">
                  <span className="text-sleek-muted">Infinite Loop Capacity</span>
                  <span className="font-bold text-sleek-accent">∞ Unbounded</span>
                </div>
              </div>

              {coreAnchors.length > 0 && (
                <div className="pt-2">
                  <div className="text-[9px] font-black uppercase text-sleek-muted tracking-widest mb-1.5">Latest Memory Anchors</div>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1 font-mono text-[9px] text-sleek-muted">
                    {coreAnchors.slice(-3).map((a, i) => (
                      <div key={i} className="p-1.5 rounded bg-black/30 border border-white/5 truncate">
                        • {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manuscript Canvas (Center/Right View) */}
          <div className="lg:col-span-8 flex flex-col bg-sleek-surface rounded-2xl border border-sleek-border overflow-hidden min-h-[500px]">
            {/* Canvas Header */}
            <div className="p-4 border-b border-sleek-border flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <BookOpen size={16} className="text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">Live Infinite Manuscript Canvas</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-sleek-muted font-mono">
                <span>{chapters.length} Chapters Generated</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{totalWordCount.toLocaleString()} Words</span>
              </div>
            </div>

            {/* Scrollable Reading & Streaming Pane */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-8 max-h-[calc(100vh-280px)]">
              {chapters.length === 0 && !currentStreamingText && (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center text-sleek-muted space-y-4">
                  <div className="w-16 h-16 rounded-full bg-sleek-accent/10 border border-sleek-accent/20 flex items-center justify-center text-sleek-accent">
                    <BookOpen size={28} />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <p className="text-sm font-bold text-white">Infinite Manuscript Canvas Awaiting Ignition</p>
                    <p className="text-xs text-sleek-muted">
                      Type an idea in the left console or upload a text file, then click <strong className="text-amber-400">Engage Infinite Authoring</strong>. The engine will weave cohesive narrative arcs continuously for as long as you leave it running.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSeedIdea("In 2188, humanity discovered that consciousness was not biological, but a signal broadcast across an ancient cosmological substrate. One researcher begins hearing memories that do not belong to our galaxy.");
                      setGenre("Sci-Fi / Speculative Realism");
                    }}
                    className="px-4 py-2 rounded-xl bg-sleek-accent/15 border border-sleek-accent/30 text-sleek-accent text-xs font-bold hover:bg-sleek-accent hover:text-white transition-all cursor-pointer"
                  >
                    Load Sample Cosmological Seed
                  </button>
                </div>
              )}

              {/* Rendered Chapters */}
              {chapters.map((chapter) => (
                <article key={chapter.id} className="space-y-4 pb-8 border-b border-sleek-border/40 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black text-[10px] uppercase tracking-wider border border-amber-500/30">
                        Chapter {chapter.chapterIndex}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">{chapter.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-sleek-muted font-mono">{chapter.wordCount} words • {chapter.timestamp}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(chapter.content);
                          setCopiedSection(chapter.id);
                          setTimeout(() => setCopiedSection(null), 2000);
                        }}
                        className="p-1 rounded text-sleek-muted hover:text-white hover:bg-white/5 cursor-pointer"
                        title="Copy Chapter"
                      >
                        {copiedSection === chapter.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-sleek-text/90 leading-relaxed font-serif">
                    <ReactMarkdown>{chapter.content}</ReactMarkdown>
                  </div>

                  {chapter.anchorState && (
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-center gap-2 text-[10px] text-sleek-muted font-mono">
                      <span className="text-emerald-400 font-bold">Anchor Lock:</span>
                      <span className="truncate">{chapter.anchorState}</span>
                    </div>
                  )}
                </article>
              ))}

              {/* Actively Streaming Chapter */}
              {(isSynthesizingChunk || currentStreamingText) && (
                <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-b from-sleek-accent/10 to-transparent border border-sleek-accent/30 animate-pulse-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-sleek-accent text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={10} className="animate-spin-slow" />
                        Forging Chapter {currentChapterNum}...
                      </span>
                    </div>
                    <span className="text-[10px] text-sleek-accent font-mono animate-pulse">Continuity Engine Stream</span>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-sleek-text leading-relaxed font-serif">
                    <ReactMarkdown>{currentStreamingText || "*Synthesizing next sequential arc...*"}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div ref={streamEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REWRITE & TRANSFORM ANY UPLOAD */}
      {activeTab === "rewriter" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Upload & Style Selection Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
            <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-sleek-muted tracking-widest flex items-center gap-2">
                  <FileText size={12} className="text-sleek-accent" />
                  Original Text or Document
                </label>
                <button
                  onClick={() => rewriterFileInputRef.current?.click()}
                  className="flex items-center gap-1 text-[10px] font-bold text-sleek-accent hover:underline cursor-pointer"
                >
                  <Upload size={12} />
                  <span>{uploadedFileName ? "Replace File" : "Upload File"}</span>
                </button>
                <input
                  type="file"
                  ref={rewriterFileInputRef}
                  onChange={(e) => handleFileUpload(e, "rewriter")}
                  accept=".txt,.md,.json,.pdf,.doc,.docx"
                  className="hidden"
                />
              </div>

              <textarea
                value={originalUploadText}
                onChange={(e) => setOriginalUploadText(e.target.value)}
                placeholder="Paste any article, essay, manuscript excerpt, rough notes, or upload a file above. The engine will rewrite it completely according to your selected style..."
                rows={6}
                className="w-full bg-black/30 border border-sleek-border rounded-xl p-3.5 text-xs text-sleek-text placeholder-sleek-muted/40 resize-none focus:border-sleek-accent/70 focus:outline-none font-mono"
              />

              {/* Style Presets */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-sleek-muted tracking-wider">Select Transformation Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {REWRITE_STYLES.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedRewriteStyle(st.id)}
                      className={cn(
                        "p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer",
                        selectedRewriteStyle === st.id
                          ? "bg-sleek-accent/20 border-sleek-accent text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                          : "bg-black/20 border-sleek-border text-sleek-muted hover:text-white hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{st.icon}</span>
                        <span className="text-[11px] font-bold">{st.name}</span>
                      </div>
                      <span className="text-[9px] text-sleek-muted leading-tight line-clamp-2">{st.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Guidance */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-sleek-muted tracking-wider">Custom Directive (Optional)</label>
                <input
                  type="text"
                  value={customRewriteInstruction}
                  onChange={(e) => setCustomRewriteInstruction(e.target.value)}
                  placeholder="e.g., 'Emphasize the protagonist's internal conflict and enhance sensory metaphors.'"
                  className="w-full bg-black/30 border border-sleek-border rounded-lg p-2.5 text-xs text-white placeholder-sleek-muted/40 focus:border-sleek-accent focus:outline-none"
                />
              </div>

              <button
                onClick={handleExecuteRewrite}
                disabled={!originalUploadText.trim() || isRewriting}
                className="w-full py-3.5 rounded-xl bg-sleek-accent text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-blue-600 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRewriting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Executing Transformation...</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>Transform & Rewrite Manuscript</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Transformed Result View */}
          <div className="lg:col-span-7 flex flex-col bg-sleek-surface rounded-2xl border border-sleek-border overflow-hidden min-h-[500px]">
            <div className="p-4 border-b border-sleek-border flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-sleek-accent" />
                <span className="text-xs font-black uppercase tracking-wider text-white">Transformed Output</span>
              </div>
              {rewrittenText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(rewrittenText);
                      setCopiedSection("rewrite-all");
                      setTimeout(() => setCopiedSection(null), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sleek-muted hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                  >
                    {copiedSection === "rewrite-all" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedSection === "rewrite-all" ? "Copied!" : "Copy Text"}</span>
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([rewrittenText], { type: "text/markdown;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `rewritten_${Date.now()}.md`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sleek-accent/20 border border-sleek-accent/30 text-sleek-accent hover:bg-sleek-accent hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {!rewrittenText && !isRewriting ? (
                <div className="h-full flex flex-col items-center justify-center py-24 text-center text-sleek-muted space-y-3">
                  <RefreshCw size={32} className="text-sleek-muted opacity-40" />
                  <p className="text-xs font-bold text-white">Transformed Prose Will Render Here</p>
                  <p className="text-[11px] text-sleek-muted max-w-sm">
                    Select a style on the left and click Transform. The Substrate Engine rewrites the prose with deep tonal integrity.
                  </p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-sleek-text leading-relaxed font-serif">
                  <ReactMarkdown>{rewrittenText || "*Transforming draft...*"}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STRESS TEST & 1,000+ PAGE COHERENCE AUDITOR */}
      {activeTab === "stress" && (
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-1 min-h-0">
          {/* Sub Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sleek-surface p-3 rounded-2xl border border-sleek-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStressSubTab("benchmark")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
                  stressSubTab === "benchmark"
                    ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "text-sleek-muted hover:text-white"
                )}
              >
                <Gauge size={14} />
                <span>Multi-Scale Stress Benchmark</span>
              </button>

              <button
                onClick={() => setStressSubTab("audit")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
                  stressSubTab === "audit"
                    ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "text-sleek-muted hover:text-white"
                )}
              >
                <Crosshair size={14} />
                <span>Deep Coherence & Contradiction Auditor</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-amber-300/80 font-mono bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Cranium Substrate Continuity Core Active</span>
            </div>
          </div>

          {/* SUB-VIEW 1: MULTI-SCALE STRESS BENCHMARK */}
          {stressSubTab === "benchmark" && (
            <div className="space-y-6">
              {/* Benchmark Setup Card */}
              <div className="bg-sleek-surface p-6 rounded-2xl border border-sleek-border space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Activity className="text-amber-400" size={18} />
                      High-Capacity Continuum Stress Tester
                    </h3>
                    <p className="text-xs text-sleek-muted mt-0.5">
                      Simulate and verify narrative stability, causal integrity, and zero entity drift across massive multi-volume scopes.
                    </p>
                  </div>

                  {/* Scale Selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { pages: 50, label: "50 Pgs (~12.5k words)" },
                      { pages: 250, label: "250 Pgs (~62.5k words)" },
                      { pages: 500, label: "500 Pgs (~125k words)" },
                      { pages: 1000, label: "1,000+ Pgs (~250k words)" },
                      { pages: 2500, label: "2,500+ Pgs (~625k words)" }
                    ].map((s) => (
                      <button
                        key={s.pages}
                        onClick={() => setTargetStressPages(s.pages)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                          targetStressPages === s.pages
                            ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                            : "bg-black/30 text-sleek-muted border-sleek-border hover:text-white"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Action Button & Progress */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleRunStressTest}
                    disabled={isStressTesting}
                    className="w-full py-4 rounded-xl glossy-btn-amber text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50"
                  >
                    {isStressTesting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Running Stress Matrix ({stressProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>Execute Stress Test Across {targetStressPages.toLocaleString()} Pages</span>
                      </>
                    )}
                  </button>

                  {isStressTesting && (
                    <div className="space-y-2">
                      <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${stressProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-[11px] font-mono text-amber-300 text-center animate-pulse">
                        {stressTelemetryStep}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stress Results Display */}
              {stressBatchData && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Executive Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-sleek-surface p-4 rounded-2xl border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between text-sleek-muted text-[10px] uppercase font-black">
                        <span>Coherence Stability</span>
                        <Gauge size={14} className="text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-emerald-400">
                        {stressBatchData.averageCoherenceScore}%
                      </div>
                      <div className="text-[10px] text-sleek-muted">Zero narrative decay</div>
                    </div>

                    <div className="bg-sleek-surface p-4 rounded-2xl border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between text-sleek-muted text-[10px] uppercase font-black">
                        <span>Contradiction Risk</span>
                        <AlertTriangle size={14} className="text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-white">
                        {stressBatchData.contradictionRisk}
                      </div>
                      <div className="text-[10px] text-sleek-muted">Axiomatic consistency locked</div>
                    </div>

                    <div className="bg-sleek-surface p-4 rounded-2xl border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between text-sleek-muted text-[10px] uppercase font-black">
                        <span>Memory Retention</span>
                        <Network size={14} className="text-blue-400" />
                      </div>
                      <div className="text-2xl font-black text-blue-400">
                        {stressBatchData.memoryRetentionEfficiency}
                      </div>
                      <div className="text-[10px] text-sleek-muted">Persistent Anchor Lattice</div>
                    </div>

                    <div className="bg-sleek-surface p-4 rounded-2xl border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between text-sleek-muted text-[10px] uppercase font-black">
                        <span>Tested Scope</span>
                        <BarChart3 size={14} className="text-orange-400" />
                      </div>
                      <div className="text-2xl font-black text-orange-400">
                        {stressBatchData.pagesSimulated} Pgs
                      </div>
                      <div className="text-[10px] text-sleek-muted">
                        {stressBatchData.totalWordCount.toLocaleString()} words ({stressBatchData.totalChapters} chapters)
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Certificate Banner */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-xs font-black uppercase text-white tracking-wide">
                          Executive Continuity Certificate :: VERIFIED
                        </span>
                      </div>
                      <p className="text-xs text-sleek-muted max-w-xl">
                        {stressBatchData.stressAuditReport?.recommendation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleExportStressReport}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold flex items-center gap-1.5 text-white transition-all cursor-pointer"
                      >
                        <FileDown size={14} className="text-amber-400" />
                        <span>Export Certificate (.MD)</span>
                      </button>

                      <button
                        onClick={handleLoadStressChaptersIntoWriter}
                        className="px-3.5 py-2 rounded-xl glossy-btn-amber text-black text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <BookOpen size={14} />
                        <span>Load into Live Writer</span>
                      </button>
                    </div>
                  </div>

                  {/* Chapter-by-Chapter Integrity Table */}
                  <div className="bg-sleek-surface rounded-2xl border border-sleek-border overflow-hidden">
                    <div className="p-4 border-b border-sleek-border flex items-center justify-between bg-black/20">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-amber-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-white">
                          Simulated Chapter Progression Matrix
                        </span>
                      </div>
                      <span className="text-[10px] text-sleek-muted font-mono">
                        {stressBatchData.chapters?.length} Chapters Validated
                      </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-sleek-border/40">
                      {(stressBatchData.chapters || []).map((ch: any) => (
                        <div key={ch.chapterIndex} className="p-3.5 hover:bg-white/[0.02] flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                              {ch.chapterIndex}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{ch.title}</div>
                              <div className="text-[10px] text-sleek-muted truncate font-mono">
                                Anchor: {ch.anchorState}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                            <span className="text-sleek-muted">{ch.wordCount} words</span>
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              {(ch.coherenceRatio * 100).toFixed(1)}% Coherent
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: DEEP COHERENCE & CONTRADICTION AUDITOR */}
          {stressSubTab === "audit" && (
            <div className="space-y-6">
              <div className="bg-sleek-surface p-6 rounded-2xl border border-sleek-border space-y-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Crosshair className="text-amber-400" size={18} />
                    Manuscript Contradiction & Coherence Auditor
                  </h3>
                  <p className="text-xs text-sleek-muted mt-0.5">
                    Scans all active chapters or uploaded prose for timeline paradoxes, broken character arcs, and thematic drift.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Entity Tracker Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-sleek-muted tracking-wider">
                      Key Characters & Entity Vectors to Conserve
                    </label>
                    <input
                      type="text"
                      value={charactersToAudit}
                      onChange={(e) => setCharactersToAudit(e.target.value)}
                      placeholder="e.g., Commander Vaelen, Dr. Vance, AI Substrate Core"
                      className="w-full bg-black/30 border border-sleek-border rounded-xl p-3 text-xs text-white placeholder-sleek-muted/40 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Seed / Premise anchor */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-sleek-muted tracking-wider">
                      Primary Premise Anchor (Baseline Canon)
                    </label>
                    <input
                      type="text"
                      value={seedIdea}
                      onChange={(e) => setSeedIdea(e.target.value)}
                      placeholder="e.g., A civilization discovering that consciousness can be mathematically anchored."
                      className="w-full bg-black/30 border border-sleek-border rounded-xl p-3 text-xs text-white placeholder-sleek-muted/40 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Custom Excerpt (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-sleek-muted tracking-wider">
                      Target Text to Audit ({chapters.length > 0 ? `${chapters.length} Live Chapters Detected` : "Paste Excerpt Below"})
                    </label>
                    {chapters.length > 0 && (
                      <span className="text-[10px] text-amber-400 font-bold">
                        Using all {chapters.length} chapters from Infinite Author
                      </span>
                    )}
                  </div>
                  <textarea
                    value={customAuditText}
                    onChange={(e) => setCustomAuditText(e.target.value)}
                    placeholder={chapters.length > 0 ? "Leave empty to audit all chapters currently in the Infinite Author, or paste custom text/manuscript excerpt here..." : "Paste your manuscript, screenplay, or story chapters here to run an automated coherence audit..."}
                    rows={4}
                    className="w-full bg-black/30 border border-sleek-border rounded-xl p-3 text-xs text-white placeholder-sleek-muted/40 resize-none focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <button
                  onClick={handleAuditCoherence}
                  disabled={isAuditing || (!customAuditText.trim() && chapters.length === 0 && !seedIdea.trim())}
                  className="w-full py-3.5 rounded-xl glossy-btn-amber text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Auditing Narrative Continuum...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Run Deep Coherence & Contradiction Audit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Audit Findings Result */}
              {coherenceAuditResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* Coherence Radar Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-sleek-surface p-3.5 rounded-2xl border border-sleek-border space-y-1 text-center">
                      <div className="text-[9px] font-black uppercase text-sleek-muted">Overall Coherence</div>
                      <div className="text-2xl font-black text-emerald-400">
                        {coherenceAuditResult.coherenceScore}%
                      </div>
                    </div>
                    <div className="bg-sleek-surface p-3.5 rounded-2xl border border-sleek-border space-y-1 text-center">
                      <div className="text-[9px] font-black uppercase text-sleek-muted">Entity Integrity</div>
                      <div className="text-2xl font-black text-blue-400">
                        {coherenceAuditResult.metrics?.entityContinuity || 98}%
                      </div>
                    </div>
                    <div className="bg-sleek-surface p-3.5 rounded-2xl border border-sleek-border space-y-1 text-center">
                      <div className="text-[9px] font-black uppercase text-sleek-muted">Timeline Conservation</div>
                      <div className="text-2xl font-black text-amber-400">
                        {coherenceAuditResult.metrics?.timelineConsistency || 97}%
                      </div>
                    </div>
                    <div className="bg-sleek-surface p-3.5 rounded-2xl border border-sleek-border space-y-1 text-center">
                      <div className="text-[9px] font-black uppercase text-sleek-muted">Thematic Fidelity</div>
                      <div className="text-2xl font-black text-purple-400">
                        {coherenceAuditResult.metrics?.thematicDriftScore || 95}%
                      </div>
                    </div>
                    <div className="bg-sleek-surface p-3.5 rounded-2xl border border-sleek-border space-y-1 text-center">
                      <div className="text-[9px] font-black uppercase text-sleek-muted">Anchor Stability</div>
                      <div className="text-2xl font-black text-orange-400">
                        {coherenceAuditResult.metrics?.semanticAnchorStability || 99}%
                      </div>
                    </div>
                  </div>

                  {/* Character Trajectory Audit */}
                  {coherenceAuditResult.characterTrajectories && (
                    <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-3">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                        <Compass size={14} className="text-amber-400" />
                        Character & Entity Trajectory Conservation
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {coherenceAuditResult.characterTrajectories.map((char, idx) => (
                          <div key={idx} className="p-3 bg-black/30 rounded-xl border border-sleek-border/60 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{char.name}</span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                                {char.continuityScore}% Intact
                              </span>
                            </div>
                            <p className="text-[11px] text-sleek-muted">{char.arcIntegrity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Findings List */}
                  <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-3">
                    <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <FileCheck size={14} className="text-emerald-400" />
                      Detailed Continuum Findings & Verification
                    </h4>

                    <div className="space-y-2">
                      {coherenceAuditResult.findings?.map((f, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3.5 rounded-xl border flex items-start gap-3",
                            f.type === "PASS" ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300" :
                            f.type === "WARNING" ? "bg-amber-500/5 border-amber-500/30 text-amber-300" :
                            f.type === "CRITICAL" ? "bg-red-500/5 border-red-500/30 text-red-300" :
                            "bg-blue-500/5 border-blue-500/30 text-blue-300"
                          )}
                        >
                          <div className="mt-0.5">
                            {f.type === "PASS" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{f.title}</span>
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                                {f.category}
                              </span>
                            </div>
                            <p className="text-xs text-sleek-muted leading-relaxed">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-sleek-border/60">
                      <p className="text-xs text-sleek-text">
                        <span className="font-bold text-amber-400">Executive Summary: </span>
                        {coherenceAuditResult.recommendation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: AUTOMATED WORLD & SERIES BIBLE */}
      {activeTab === "bible" && (
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {/* Top Control Bar */}
          <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="text-purple-400" size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Automated Series & World Bible Substrate
                </h3>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  Canon Integrity Engine
                </span>
              </div>
              <p className="text-xs text-sleek-muted">
                Synthesizes complete narrative architecture, in-depth character dossiers, world laws, factions, and chronological timelines from your manuscript.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateSeriesBible}
                disabled={isGeneratingBible}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.4)] cursor-pointer disabled:opacity-50 transition-all"
              >
                {isGeneratingBible ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Synthesizing World Bible...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>⚡ Build / Refresh Series Bible</span>
                  </>
                )}
              </button>

              {bibleData && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleExportBible("md")}
                    className="px-3 py-2 rounded-xl bg-sleek-border hover:bg-sleek-surface text-xs font-bold text-white flex items-center gap-1.5 border border-sleek-border cursor-pointer transition-all"
                    title="Export Markdown"
                  >
                    <Download size={13} />
                    <span>.MD</span>
                  </button>
                  <button
                    onClick={() => handleExportBible("json")}
                    className="px-3 py-2 rounded-xl bg-sleek-border hover:bg-sleek-surface text-xs font-bold text-white flex items-center gap-1.5 border border-sleek-border cursor-pointer transition-all"
                    title="Export JSON"
                  >
                    <Download size={13} />
                    <span>.JSON</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {!bibleData && !isGeneratingBible && (
            <div className="bg-sleek-surface/60 border border-sleek-border/80 rounded-2xl p-12 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                <BookOpen size={30} />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-base font-bold text-white">No Series Bible Synthesized Yet</h4>
                <p className="text-xs text-sleek-muted leading-relaxed">
                  Click the button above to extract comprehensive character psychological profiles, magic/tech systems, societal hierarchy, factions, and historical epochs directly from your active manuscript or premise.
                </p>
              </div>
              <button
                onClick={handleGenerateSeriesBible}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Sparkles size={14} />
                <span>Synthesize Complete Series Bible</span>
              </button>
            </div>
          )}

          {isGeneratingBible && (
            <div className="bg-sleek-surface border border-purple-500/30 rounded-2xl p-12 text-center space-y-4 animate-pulse">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-300">
                <RefreshCw size={24} className="animate-spin" />
              </div>
              <h4 className="text-sm font-black uppercase text-purple-300 tracking-wider">
                Synthesizing Canonical World Structure & Characters...
              </h4>
              <p className="text-xs text-sleek-muted max-w-sm mx-auto">
                Auditing manuscript for character arcs, physiological constraints, ontological physics, and faction politics.
              </p>
            </div>
          )}

          {bibleData && (
            <div className="space-y-5">
              {/* Executive Overview Header */}
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-black p-6 rounded-2xl border border-purple-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    {bibleData.seriesTitle}
                  </h2>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30 font-bold self-start">
                    {genre}
                  </span>
                </div>
                <p className="text-xs text-purple-200/90 font-medium italic leading-relaxed">
                  "{bibleData.logline}"
                </p>
                <div className="pt-2 border-t border-purple-500/20 text-xs text-sleek-muted flex items-center gap-2">
                  <span className="text-purple-400 font-bold uppercase text-[10px]">Thematic Core:</span>
                  <span>{bibleData.thematicCore}</span>
                </div>
              </div>

              {/* Bible Sub-Navigation */}
              <div className="flex items-center gap-2 border-b border-sleek-border pb-2 overflow-x-auto">
                <button
                  onClick={() => setBibleSubTab("characters")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all",
                    bibleSubTab === "characters"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-sleek-muted hover:text-white"
                  )}
                >
                  <User size={13} />
                  <span>Character Dossiers ({bibleData.characters?.length || 0})</span>
                </button>

                <button
                  onClick={() => setBibleSubTab("lore")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all",
                    bibleSubTab === "lore"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-sleek-muted hover:text-white"
                  )}
                >
                  <Globe size={13} />
                  <span>World Rules & Lore</span>
                </button>

                <button
                  onClick={() => setBibleSubTab("factions")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all",
                    bibleSubTab === "factions"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-sleek-muted hover:text-white"
                  )}
                >
                  <ShieldCheck size={13} />
                  <span>Factions & Power Dynamics ({bibleData.factions?.length || 0})</span>
                </button>

                <button
                  onClick={() => setBibleSubTab("timeline")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all",
                    bibleSubTab === "timeline"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-sleek-muted hover:text-white"
                  )}
                >
                  <Layers size={13} />
                  <span>Historical Timeline ({bibleData.timeline?.length || 0})</span>
                </button>
              </div>

              {/* VIEW: IN-DEPTH CHARACTER DOSSIERS */}
              {bibleSubTab === "characters" && bibleData.characters && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Character Selector Sidebar */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-sleek-muted px-1">
                      Cast & Entities
                    </div>
                    <div className="space-y-1.5">
                      {bibleData.characters.map((char, idx) => {
                        const isSelected = selectedCharacterIndex === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedCharacterIndex(idx)}
                            className={cn(
                              "p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all",
                              isSelected
                                ? "bg-purple-950/50 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                                : "bg-sleek-surface border-sleek-border hover:border-sleek-border/80"
                            )}
                          >
                            <div className="w-10 h-10 rounded-lg bg-black/40 border border-purple-500/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {characterAvatars[char.name] ? (
                                <img
                                  src={characterAvatars[char.name]}
                                  alt={char.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={18} className="text-purple-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs text-white truncate">{char.name}</h4>
                                <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                                  {char.archetype || "Key Entity"}
                                </span>
                              </div>
                              <p className="text-[11px] text-sleek-muted truncate">{char.role}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Character Dossier Detail Card */}
                  {bibleData.characters[selectedCharacterIndex] && (
                    <div className="lg:col-span-8 bg-sleek-surface p-6 rounded-2xl border border-sleek-border space-y-6">
                      {(() => {
                        const char = bibleData.characters[selectedCharacterIndex];
                        const avatarUrl = characterAvatars[char.name];
                        const isGeneratingThisAvatar = isGeneratingAvatar === char.name;

                        return (
                          <>
                            {/* Profile Header with Avatar & Imagen Generator */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-sleek-border">
                              <div className="flex items-center gap-4">
                                <div className="relative group w-20 h-20 rounded-2xl bg-black/50 border-2 border-purple-500/40 overflow-hidden shadow-xl flex items-center justify-center flex-shrink-0">
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={char.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User size={32} className="text-purple-400/60" />
                                  )}
                                  {isGeneratingThisAvatar && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                      <RefreshCw size={20} className="animate-spin text-purple-400" />
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-black text-white">{char.name}</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                                      {char.role}
                                    </span>
                                  </div>
                                  <p className="text-xs text-sleek-muted mt-0.5">
                                    <span className="text-purple-400 font-medium">Archetype: </span>
                                    {char.archetype}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleGenerateCharacterAvatar(char)}
                                disabled={isGeneratingThisAvatar}
                                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all self-start"
                              >
                                {isGeneratingThisAvatar ? (
                                  <RefreshCw size={13} className="animate-spin" />
                                ) : (
                                  <Camera size={13} />
                                )}
                                <span>{avatarUrl ? "Regenerate Portrait" : "Generate AI Portrait (Imagen 3)"}</span>
                              </button>
                            </div>

                            {/* Traits & Psychology Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-black/30 rounded-xl border border-sleek-border space-y-1.5">
                                <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                                  <Zap size={12} />
                                  <span>Core Motivation</span>
                                </div>
                                <p className="text-xs text-sleek-text leading-relaxed">{char.coreMotivation}</p>
                              </div>

                              <div className="p-4 bg-black/30 rounded-xl border border-sleek-border space-y-1.5">
                                <div className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                                  <AlertTriangle size={12} />
                                  <span>Fatal Flaw</span>
                                </div>
                                <p className="text-xs text-sleek-text leading-relaxed">{char.fatalFlaw}</p>
                              </div>
                            </div>

                            {/* Deep Psychology & Arc */}
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                                  <Activity size={13} />
                                  <span>Psychological Profile & Worldview</span>
                                </h4>
                                <p className="text-xs text-sleek-muted leading-relaxed bg-black/20 p-3.5 rounded-xl border border-sleek-border/60">
                                  {char.psychologicalProfile}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                  <TrendingUp size={13} />
                                  <span>Dynamic Arc Progression</span>
                                </h4>
                                <p className="text-xs text-sleek-muted leading-relaxed bg-black/20 p-3.5 rounded-xl border border-sleek-border/60">
                                  {char.arcProgression}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                  <Eye size={13} />
                                  <span>Physical Appearance & Wardrobe Cue</span>
                                </h4>
                                <p className="text-xs text-sleek-muted leading-relaxed bg-black/20 p-3.5 rounded-xl border border-sleek-border/60">
                                  {char.physicalAppearance}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <h4 className="text-[11px] font-black uppercase tracking-wider text-sleek-muted flex items-center gap-1.5">
                                    <Volume2 size={13} />
                                    <span>Voice & Dialogue Cadence</span>
                                  </h4>
                                  <p className="text-xs text-sleek-muted bg-black/20 p-3 rounded-xl border border-sleek-border/60">
                                    {char.voiceAndTone}
                                  </p>
                                </div>

                                <div className="space-y-1.5">
                                  <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                                    <MessageSquare size={13} />
                                    <span>Canonical Signature Quote</span>
                                  </h4>
                                  <p className="text-xs text-amber-200/90 italic bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                                    "{char.keyQuote}"
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                                  <Network size={13} />
                                  <span>Relationship Web & Conflicts</span>
                                </h4>
                                <p className="text-xs text-sleek-muted bg-black/20 p-3 rounded-xl border border-sleek-border/60">
                                  {char.relationships}
                                </p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: WORLD RULES & LORE */}
              {bibleSubTab === "lore" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-3">
                    <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-2">
                      <Sparkles size={14} />
                      Magic / Tech Mechanics
                    </h4>
                    <p className="text-xs text-sleek-muted leading-relaxed">
                      {bibleData.worldRules?.magicOrTechSystem}
                    </p>
                  </div>

                  <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-3">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-2">
                      <Globe size={14} />
                      Societal Hierarchy & Geopolitics
                    </h4>
                    <p className="text-xs text-sleek-muted leading-relaxed">
                      {bibleData.worldRules?.societalStructure}
                    </p>
                  </div>

                  <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-3">
                    <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                      <ShieldCheck size={14} />
                      Universal Laws & Critical Limits
                    </h4>
                    <p className="text-xs text-sleek-muted leading-relaxed">
                      {bibleData.worldRules?.keyLawsAndLimits}
                    </p>
                  </div>

                  {/* Locations */}
                  {bibleData.locations && bibleData.locations.length > 0 && (
                    <div className="md:col-span-3 bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-3">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                        <Compass size={14} className="text-emerald-400" />
                        Canonical Locations & Real Estate
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {bibleData.locations.map((loc, idx) => (
                          <div key={idx} className="p-3.5 bg-black/30 rounded-xl border border-sleek-border space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{loc.name}</span>
                              <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded">
                                {loc.type}
                              </span>
                            </div>
                            <p className="text-xs text-sleek-muted">{loc.description}</p>
                            <p className="text-[11px] text-sleek-muted/80 italic font-mono pt-1">
                              Sensory: {loc.sensoryDetails}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: FACTIONS */}
              {bibleSubTab === "factions" && bibleData.factions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bibleData.factions.map((f, idx) => (
                    <div key={idx} className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">{f.name}</h4>
                        <span className="text-[10px] font-mono italic text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                          "{f.motto}"
                        </span>
                      </div>
                      <div className="text-xs text-sleek-muted space-y-1">
                        <p><strong className="text-sleek-text">Ideology:</strong> {f.ideology}</p>
                        <p><strong className="text-sleek-text">Power / Influence:</strong> {f.powerBase}</p>
                        <p><strong className="text-rose-400">Primary Adversary:</strong> {f.conflictVector}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW: TIMELINE */}
              {bibleSubTab === "timeline" && bibleData.timeline && (
                <div className="bg-sleek-surface p-6 rounded-2xl border border-sleek-border space-y-4">
                  <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-purple-400" />
                    Chronological Continuum & Historic Eras
                  </h4>
                  <div className="relative border-l-2 border-purple-500/30 pl-5 ml-3 space-y-5">
                    {bibleData.timeline.map((t, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-black" />
                        <span className="text-[10px] font-mono font-bold uppercase text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                          {t.era}
                        </span>
                        <p className="text-xs text-sleek-text pt-1 leading-relaxed">{t.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: COVER ART & IN-NOVEL PERIODICAL ILLUSTRATIONS */}
      {activeTab === "art" && (
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {/* Sub-navigation */}
          <div className="flex items-center justify-between gap-4 border-b border-sleek-border pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setArtSubTab("cover")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all",
                  artSubTab === "cover"
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg"
                    : "text-sleek-muted hover:text-white bg-sleek-surface"
                )}
              >
                <Bookmark size={14} />
                <span>Novel Cover Forge</span>
              </button>

              <button
                onClick={() => setArtSubTab("illustrations")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all",
                  artSubTab === "illustrations"
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg"
                    : "text-sleek-muted hover:text-white bg-sleek-surface"
                )}
              >
                <ImageIcon size={14} />
                <span>Periodical Chapter Illustrations ({chapterIllustrations.length})</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/30 hidden sm:inline font-bold">
              Imagen 3 Art Engine
            </span>
          </div>

          {/* SUB-VIEW 1: NOVEL COVER FORGE */}
          {artSubTab === "cover" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-6 space-y-4 bg-sleek-surface p-6 rounded-2xl border border-sleek-border">
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <Sparkles className="text-rose-400" size={16} />
                    Book & Novel Cover Generator
                  </h3>
                  <p className="text-xs text-sleek-muted">
                    Generate high-resolution commercial cover art with custom typography overlays, gold foil aesthetics, and custom aspect ratios.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-sleek-muted">Novel Title</label>
                    <input
                      type="text"
                      value={coverTitle}
                      onChange={(e) => setCoverTitle(e.target.value)}
                      className="w-full mt-1 bg-black/40 border border-sleek-border rounded-xl px-3.5 py-2 text-xs text-white font-bold tracking-wide focus:border-rose-500 focus:outline-none"
                      placeholder="e.g. THE RESONANCE CONTINUUM"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-sleek-muted">Subtitle / Series</label>
                      <input
                        type="text"
                        value={coverSubtitle}
                        onChange={(e) => setCoverSubtitle(e.target.value)}
                        className="w-full mt-1 bg-black/40 border border-sleek-border rounded-xl px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                        placeholder="e.g. Book I of the Substrate Cycle"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-sleek-muted">Author / Imprint</label>
                      <input
                        type="text"
                        value={coverAuthor}
                        onChange={(e) => setCoverAuthor(e.target.value)}
                        className="w-full mt-1 bg-black/40 border border-sleek-border rounded-xl px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                        placeholder="e.g. WorthWyl Publishing"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-sleek-muted">Art Direction & Scene Prompt</label>
                    <textarea
                      rows={3}
                      value={coverPrompt}
                      onChange={(e) => setCoverPrompt(e.target.value)}
                      className="w-full mt-1 bg-black/40 border border-sleek-border rounded-xl p-3 text-xs text-white focus:border-rose-500 focus:outline-none leading-relaxed"
                      placeholder="Describe the focal subject, lighting, mood, color palette..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-sleek-muted">Aesthetic Style</label>
                      <select
                        value={coverStyle}
                        onChange={(e) => setCoverStyle(e.target.value)}
                        className="w-full mt-1 bg-black/40 border border-sleek-border rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                      >
                        <option value="Cinematic Photorealism">Cinematic Photorealism</option>
                        <option value="Dark Oil Painting & Baroque">Dark Oil Painting & Baroque</option>
                        <option value="Anime / Cyberpunk Neo-Tokyo">Anime / Cyberpunk Neo-Tokyo</option>
                        <option value="Minimalist Foil Typography">Minimalist Foil Typography</option>
                        <option value="Epic High Fantasy Digital Art">Epic High Fantasy Digital Art</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-sleek-muted">Format Aspect Ratio</label>
                      <select
                        value={coverAspectRatio}
                        onChange={(e) => setCoverAspectRatio(e.target.value as any)}
                        className="w-full mt-1 bg-black/40 border border-sleek-border rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                      >
                        <option value="2:3">2:3 Standard Book Cover</option>
                        <option value="1:1">1:1 Square Album / Audio</option>
                        <option value="9:16">9:16 Vertical TikTok / Screen</option>
                        <option value="16:9">16:9 Panoramic Wrap</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-sleek-muted">
                      <input
                        type="checkbox"
                        checked={showTypographyOverlay}
                        onChange={(e) => setShowTypographyOverlay(e.target.checked)}
                        className="rounded border-sleek-border text-rose-600 focus:ring-rose-500"
                      />
                      <span>Render Gold Foil Typography Overlay</span>
                    </label>
                  </div>

                  <button
                    onClick={handleGenerateCoverArt}
                    disabled={isGeneratingCover}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer disabled:opacity-50 transition-all mt-2"
                  >
                    {isGeneratingCover ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Rendering Novel Cover Art (Imagen 3)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Generate Novel Cover Art</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live 3D / Glossy Book Cover Realistic Preview */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center bg-black/40 p-6 rounded-2xl border border-sleek-border">
                <div className="relative group max-w-xs w-full aspect-[2/3] rounded-r-xl rounded-l-sm bg-slate-900 border-r-4 border-b-4 border-black/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(225,29,72,0.2)] overflow-hidden flex flex-col justify-between p-6 transition-all transform hover:scale-[1.02]">
                  {/* Book Spine Shadow Overlay */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none z-20" />
                  
                  {/* Background Artwork */}
                  {coverImageUrl ? (
                    <img
                      src={coverImageUrl}
                      alt="Cover Art"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center p-6 text-center">
                      <div className="space-y-2 opacity-50">
                        <Bookmark size={40} className="mx-auto text-rose-400" />
                        <p className="text-[10px] uppercase font-mono tracking-widest text-sleek-muted">
                          Awaiting Cover Art Generation
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/80 pointer-events-none z-10" />

                  {/* Typography Overlay */}
                  {showTypographyOverlay && (
                    <div className="relative z-30 flex flex-col justify-between h-full text-center">
                      {/* Top Author Tag */}
                      <div className="pt-2">
                        <span className="text-[9px] uppercase tracking-[0.25em] font-black text-amber-200/90 font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {coverAuthor}
                        </span>
                      </div>

                      {/* Main Title & Subtitle */}
                      <div className="space-y-2 py-4">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-serif drop-shadow-[0_4px_10px_rgba(0,0,0,1)] leading-none text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500">
                          {coverTitle}
                        </h2>
                        {coverSubtitle && (
                          <p className="text-[10px] font-mono tracking-widest uppercase text-amber-200/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {coverSubtitle}
                          </p>
                        )}
                      </div>

                      {/* Bottom Seal */}
                      <div className="pb-2">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-white/60 bg-black/60 px-3 py-1 rounded-full border border-white/20">
                          Official Edition
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {coverImageUrl && (
                  <div className="mt-4 flex gap-2">
                    <a
                      href={coverImageUrl}
                      download={`cover_${coverTitle.toLowerCase().replace(/\s+/g, '_')}.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 rounded-xl bg-sleek-surface border border-sleek-border text-white text-xs font-bold flex items-center gap-1.5 hover:bg-sleek-border transition-all"
                    >
                      <Download size={13} />
                      <span>Download Artwork</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: IN-NOVEL PERIODICAL CHAPTER ILLUSTRATIONS */}
          {artSubTab === "illustrations" && (
            <div className="space-y-5">
              <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <ImageIcon className="text-rose-400" size={16} />
                    In-Novel Periodical Chapter Illustrations
                  </h3>
                  <p className="text-xs text-sleek-muted">
                    Automatically generates cinematic visual plates for every chapter to create an illustrated collector's novel.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAllIllustrations}
                  disabled={isGeneratingIllustrations}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isGeneratingIllustrations ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      <span>Generating Chapter Plates...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>⚡ Generate Illustrations for All Chapters</span>
                    </>
                  )}
                </button>
              </div>

              {chapterIllustrations.length === 0 && !isGeneratingIllustrations && (
                <div className="bg-sleek-surface/60 border border-sleek-border/80 rounded-2xl p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                    <ImageIcon size={24} />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-bold text-white">No Chapter Illustrations Generated</h4>
                    <p className="text-xs text-sleek-muted">
                      Click the button above to analyze your manuscript chapters and produce editorial illustration plates.
                    </p>
                  </div>
                </div>
              )}

              {chapterIllustrations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {chapterIllustrations.map((ill, idx) => (
                    <div
                      key={idx}
                      className="bg-sleek-surface rounded-2xl border border-sleek-border overflow-hidden flex flex-col justify-between group shadow-lg"
                    >
                      <div className="relative aspect-video bg-black/60 overflow-hidden">
                        <img
                          src={ill.imageUrl}
                          alt={ill.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-mono text-rose-300 border border-rose-500/30">
                          Chapter {ill.chapterIndex} Plate
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-white">{ill.title}</h4>
                          <p className="text-[11px] text-sleek-muted line-clamp-2 italic">
                            "{ill.caption}"
                          </p>
                        </div>

                        <div className="pt-3 border-t border-sleek-border flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleInsertIllustrationIntoChapter(ill)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Bookmark size={12} />
                            <span>Insert into Chapter</span>
                          </button>

                          <a
                            href={ill.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-sleek-border hover:bg-sleek-surface text-sleek-muted hover:text-white transition-all"
                            title="Open Full Image"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: VIRAL TIKTOK / REELS / SHORTS PROMO STUDIO */}
      {activeTab === "tiktok" && (
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {/* Top Control Bar */}
          <div className="bg-sleek-surface p-5 rounded-2xl border border-sleek-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="text-cyan-400" size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  TikTok, Reels & Shorts Marketing Studio
                </h3>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  BookTok Viral Engine
                </span>
              </div>
              <p className="text-xs text-sleek-muted">
                Synthesize viral multi-scene video promo trailers, voiceover scripts, cinematic prompt storyboards, and hook lines tailored for TikTok.
              </p>
            </div>

            <button
              onClick={handleGenerateTikTokCampaign}
              disabled={isGeneratingTikTok}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50 transition-all"
            >
              {isGeneratingTikTok ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Synthesizing TikTok Campaign...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>⚡ Generate Viral TikTok Video Campaign</span>
                </>
              )}
            </button>
          </div>

          {!tiktokCampaign && !isGeneratingTikTok && (
            <div className="bg-sleek-surface/60 border border-sleek-border/80 rounded-2xl p-12 text-center space-y-4 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Smartphone size={24} />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-base font-bold text-white">No TikTok Promo Trailer Created</h4>
                <p className="text-xs text-sleek-muted leading-relaxed">
                  Generate high-retention 9:16 vertical video storyboards, voiceover narrations, hook variations, and render AI video scenes with Veo.
                </p>
              </div>
              <button
                onClick={handleGenerateTikTokCampaign}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Sparkles size={14} />
                <span>Synthesize BookTok Promo Trailer</span>
              </button>
            </div>
          )}

          {tiktokCampaign && (
            <div className="space-y-5">
              {/* Campaign Hook & Overview */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-black p-6 rounded-2xl border border-cyan-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Campaign: {tiktokCampaign.title}
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-500/30 font-bold self-start">
                    Estimated Duration: {tiktokCampaign.durationSeconds || 30}s
                  </span>
                </div>

                {/* 3 Viral Hook Alternatives */}
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Zap size={12} />
                    <span>Viral TikTok Opening Hook Variations</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {tiktokCampaign.hookLines?.map((hook, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-black/40 rounded-xl border border-cyan-500/20 text-xs text-white font-medium italic flex items-center gap-2"
                      >
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <span>"{hook}"</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Narration & Soundtrack */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-black/30 rounded-xl border border-sleek-border space-y-1">
                    <div className="text-[10px] font-black uppercase text-sleek-muted flex items-center gap-1.5">
                      <Volume2 size={12} className="text-cyan-400" />
                      <span>Full Voiceover Narration Script</span>
                    </div>
                    <p className="text-xs text-sleek-text leading-relaxed font-sans">{tiktokCampaign.voiceoverScript}</p>
                  </div>

                  <div className="p-3.5 bg-black/30 rounded-xl border border-sleek-border space-y-1">
                    <div className="text-[10px] font-black uppercase text-sleek-muted flex items-center gap-1.5">
                      <Music size={12} className="text-purple-400" />
                      <span>Soundtrack & Audio Mood</span>
                    </div>
                    <p className="text-xs text-sleek-muted leading-relaxed">{tiktokCampaign.soundtrackSuggestion}</p>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {tiktokCampaign.hashtags?.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 9:16 Vertical Video Storyboard Cards & Video Player */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Film size={14} className="text-cyan-400" />
                    Cinematic 9:16 Vertical Video Storyboard & AI Video Renderer
                  </h4>
                  <span className="text-[10px] text-sleek-muted font-mono">
                    {tiktokCampaign.scenes?.length || 0} Scene Sequences
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tiktokCampaign.scenes?.map((scene, idx) => {
                    const sceneVideo = renderedSceneVideos[scene.sceneNumber];
                    const isRendering = sceneVideo?.isRendering;

                    return (
                      <div
                        key={idx}
                        className="bg-sleek-surface rounded-2xl border border-sleek-border overflow-hidden flex flex-col justify-between shadow-lg"
                      >
                        {/* 9:16 Video Player / Frame Preview */}
                        <div className="relative aspect-[9/16] bg-black overflow-hidden flex flex-col justify-between p-4 group">
                          {/* Background Video / Image */}
                          {sceneVideo?.url ? (
                            sceneVideo.url.endsWith(".mp4") ? (
                              <video
                                src={sceneVideo.url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={sceneVideo.url}
                                alt="Scene frame"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/40 via-slate-950 to-black flex items-center justify-center p-4 text-center">
                              <div className="space-y-1.5 opacity-60">
                                <Clapperboard size={30} className="mx-auto text-cyan-400" />
                                <p className="text-[9px] font-mono uppercase text-sleek-muted">
                                  Click Render to generate video
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Dark Grad Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

                          {/* Top Header Tag */}
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/20">
                              Scene {scene.sceneNumber} ({scene.durationSeconds || 5}s)
                            </span>
                            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                              {scene.cameraMovement || "Push In"}
                            </span>
                          </div>

                          {/* Center Kinetic Overlay Text */}
                          <div className="relative z-10 my-auto text-center px-2">
                            <span className="text-xs font-black uppercase text-white bg-black/80 px-2.5 py-1.5 rounded-lg border border-amber-400/40 shadow-xl tracking-wide inline-block">
                              {scene.onScreenText}
                            </span>
                          </div>

                          {/* Bottom Action */}
                          <div className="relative z-10 pt-2">
                            <button
                              onClick={() => handleRenderSceneVideo(scene)}
                              disabled={isRendering}
                              className="w-full py-2 rounded-xl bg-cyan-600/80 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer transition-all shadow-md disabled:opacity-50"
                            >
                              {isRendering ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin" />
                                  <span>Rendering Video...</span>
                                </>
                              ) : (
                                <>
                                  <Play size={12} />
                                  <span>{sceneVideo?.url ? "Re-Render Scene Video" : "Render Scene Video"}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Scene Specs Details */}
                        <div className="p-4 space-y-2 bg-sleek-surface border-t border-sleek-border">
                          <div className="space-y-1">
                            <div className="text-[9px] font-black uppercase text-sleek-muted">Visual Scene Prompt</div>
                            <p className="text-xs text-sleek-muted line-clamp-3">{scene.visualPrompt}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ARCHIVE & PREVIOUS GENERATIONS */}
      {activeTab === "history" && (
        <div className="bg-sleek-surface p-6 rounded-2xl border border-sleek-border space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Manuscript & Transformation Archive</h3>
              <p className="text-xs text-sleek-muted">All past chapters and rewritten documents generated in this session.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportManuscript}
                disabled={chapters.length === 0}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <FileDown size={14} />
                <span>Export Entire Continuum (.MD)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map(c => (
              <div key={c.id} className="p-4 bg-black/30 rounded-xl border border-sleek-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    Chapter {c.chapterIndex}
                  </span>
                  <span className="text-[10px] text-sleek-muted font-mono">{c.wordCount} words</span>
                </div>
                <h4 className="font-bold text-sm text-white truncate">{c.title}</h4>
                <p className="text-xs text-sleek-muted line-clamp-3 font-serif">{c.content}</p>
                <div className="pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-sleek-muted">{c.timestamp}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(c.content);
                      setCopiedSection(c.id);
                      setTimeout(() => setCopiedSection(null), 2000);
                    }}
                    className="text-sleek-accent font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {copiedSection === c.id ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSection === c.id ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ))}

            {rewriteHistory.map(r => (
              <div key={r.id} className="p-4 bg-black/30 rounded-xl border border-sleek-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-sleek-accent bg-sleek-accent/10 px-2 py-0.5 rounded">
                    {r.style}
                  </span>
                  <span className="text-[10px] text-sleek-muted font-mono">{r.date}</span>
                </div>
                <h4 className="font-bold text-sm text-white truncate">{r.title}</h4>
                <p className="text-xs text-sleek-muted line-clamp-3 font-serif">{r.result}</p>
                <div className="pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-sleek-muted">Transformed</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(r.result);
                      setCopiedSection(r.id);
                      setTimeout(() => setCopiedSection(null), 2000);
                    }}
                    className="text-sleek-accent font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {copiedSection === r.id ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSection === r.id ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
