// Visual-Text Hybrid Coherence Engine for WorthWyl OS v3 Novel Engine
// Implements the coherence interface that analyzes episodic snapshots (characters, locations, tone, pacing)
// and text content, synthesizing past context into a structured narrative prompt for the next episode via Gemini LLM.

import { EpisodeSnapshot, ContinuityState } from "../../models/domain";
import { LLMClient } from "../llm/LLMClient";
import { VisionClient, VisualAnalysisResult } from "../vision/VisionClient";

export interface CoherenceAuditResult {
  coherenceScore: number; // 0.0 to 1.0
  pacingTrajectory: "accelerating" | "steady" | "decelerating" | "fluctuating";
  characterContinuityScore: number;
  openThreadsCount: number;
  warnings: string[];
  recommendations: string[];
}

export interface ContextSynthesisOptions {
  novelTitle?: string;
  genre?: string;
  premise?: string;
  userDirective?: string;
  maxRecentSnapshots?: number;
}

/**
 * Interface that analyzes episodic snapshots (characters, locations, tone, pacing)
 * and text content to build narrative continuity and context for subsequent episodes.
 */
export interface IVisualTextCoherenceEngine {
  buildNextContext(
    recentSnapshots: EpisodeSnapshot[],
    options?: ContextSynthesisOptions
  ): Promise<string>;
  enrichSnapshot(
    baseSnapshot: EpisodeSnapshot,
    existingCharacters?: string[],
    existingLocations?: string[]
  ): Promise<EpisodeSnapshot>;
  auditCoherence(snapshots: EpisodeSnapshot[]): CoherenceAuditResult;
}

export class VisualTextCoherenceEngine implements IVisualTextCoherenceEngine {
  /**
   * Builds the structured narrative prompt and continuity brief for the next episode.
   * Analyzes episodic snapshots (characters, locations, tone, pacing) and text content,
   * prompting the Gemini LLM to synthesize past context into a structured narrative prompt.
   */
  static async buildNextContext(
    recentSnapshots: EpisodeSnapshot[],
    options?: ContextSynthesisOptions
  ): Promise<string> {
    if (!recentSnapshots || recentSnapshots.length === 0) {
      return `[INITIAL EPISODE DIRECTIVE]
- Phase: Episode 1 (Opening Chapter)
- Mission: Establish primary world setting, introduce core protagonist(s), forge atmospheric baseline, and present the inciting conflict.
- Continuity Constraints: Build foundational lore without relying on prior episode references.`;
    }

    const contextSections: string[] = [];

    // 1. Overall Continuity & Memory Header
    contextSections.push(`=== WORTHWYL OS v3 EPISODIC CONTINUITY MATRIX ===`);
    contextSections.push(`Total Historical Snapshots Analyzed: ${recentSnapshots.length}`);
    if (options?.novelTitle) contextSections.push(`Novel Title: ${options.novelTitle}`);
    if (options?.genre) contextSections.push(`Genre Archetype: ${options.genre}`);
    if (options?.premise) contextSections.push(`Overarching Premise: ${options.premise}`);

    // 2. Sequential Breakdown of Recent Episodes (characters, locations, tone, pacing, threads, excerpt)
    contextSections.push(`\n=== CHRONOLOGICAL EPISODE DIGESTS ===`);
    recentSnapshots.forEach((snap) => {
      const excerpt = snap.thematicSummary 
        ? snap.thematicSummary 
        : snap.text.replace(/\s+/g, " ").slice(0, 240) + "...";

      contextSections.push(`
[Episode ${snap.episodeNumber}: "${snap.title || `Chapter ${snap.episodeNumber}`}"]
• Dramatis Personae (Characters): ${snap.characters.length > 0 ? snap.characters.join(", ") : "Unspecified"}
• Primary Setting (Locations): ${snap.locations.length > 0 ? snap.locations.join(", ") : "Unspecified"}
• Emotional Register (Tone): ${snap.tone}
• Narrative Cadence (Pacing): ${snap.pacing}
• Open Narrative Threads: ${snap.openThreads && snap.openThreads.length > 0 ? snap.openThreads.join("; ") : "None open"}
• Concluded Threads: ${snap.resolvedThreads && snap.resolvedThreads.length > 0 ? snap.resolvedThreads.join("; ") : "None"}
• Thematic Core: "${excerpt}"`);
    });

    // 3. Multi-Episode Trajectory & Thread Synthesis
    const allOpenThreads = Array.from(
      new Set(recentSnapshots.flatMap((s) => s.openThreads || []))
    );
    const allResolvedThreads = Array.from(
      new Set(recentSnapshots.flatMap((s) => s.resolvedThreads || []))
    );
    const activeUnresolved = allOpenThreads.filter(
      (t) => !allResolvedThreads.includes(t)
    );

    const latest = recentSnapshots[recentSnapshots.length - 1];
    const previousPacing = recentSnapshots.map((s) => s.pacing);

    // Calculate pacing momentum
    const fastCount = previousPacing.filter((p) => p === "fast").length;
    const slowCount = previousPacing.filter((p) => p === "slow").length;
    const recommendedPacing =
      fastCount >= 2 ? "medium" : slowCount >= 2 ? "fast" : "medium";

    contextSections.push(`
=== ACTIVE NARRATIVE TENSIONS (UNRESOLVED PLOT THREADS) ===
${
  activeUnresolved.length > 0
    ? activeUnresolved.map((t, i) => `${i + 1}. ${t}`).join("\n")
    : "- Deepen the central mystery and escalate established character stakes."
}`);

    // 4. Immediate Continuity Coupling & Directives
    contextSections.push(`
=== IMMEDIATE EPISODE CONTINUITY CONSTRAINTS ===
1. Direct Temporal Vector: Seamlessly continue from the conclusion of Episode ${latest.episodeNumber}.
2. Core Characters in Focus: ${latest.characters.join(", ") || "Active Protagonists"}. Maintain established voices and psychological states.
3. Setting Momentum: Root the scene in or transitioning from "${latest.locations.join(", ") || "Current Setting"}".
4. Pacing Directive: Target ${recommendedPacing.toUpperCase()} pacing to ensure narrative variety and tension modulation.
5. Coherence Rule: Do not contradict prior revelations; advance at least one unresolved tension.`);

    if (options?.userDirective) {
      contextSections.push(`
=== AUTHOR'S SPECIFIC DIRECTIVE ===
"${options.userDirective}"`);
    }

    const rawContext = contextSections.join("\n");

    // 5. Prompt the Gemini LLM to synthesize past context into a structured narrative prompt for the next episode
    try {
      const llmPrompt = `
You are the Executive Story Architect and Continuity Director for WorthWyl OS v3.
Analyze the following episodic novel continuity context (containing past characters, locations, tone, pacing, and open plot threads).
Synthesize this past context into a structured narrative directive for the upcoming episode.

Continuity Matrix & Snapshot Digests:
"""
${rawContext}
"""

Please output a structured narrative synthesis covering:
1. [NARRATIVE TRAJECTORY]: Where the story immediately picks up from the last scene.
2. [CHARACTER DYNAMICS]: Key characters active, their emotional stakes, and unvoiced conflicts.
3. [SCENE PACING & ATMOSPHERE]: Tone (${latest.tone}), recommended pacing (${recommendedPacing}), and sensory motifs.
4. [KEY CONTINUITY THREADS TO ADVANCE]: Specific open plot threads to progress or twist.

Keep the synthesis sharp, evocative, and actionable for the fiction writing engine.
`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: llmPrompt,
          systemPrompt:
            "You are the master continuity and story architecture engine of WorthWyl OS v3. Synthesize episodic snapshots into precise, high-craft narrative guidance.",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const llmSynthesizedBrief = (data.response || data.text || "").trim();
        if (llmSynthesizedBrief) {
          return `${rawContext}\n\n=== GEMINI LLM NARRATIVE CONTINUITY SYNTHESIS ===\n${llmSynthesizedBrief}`;
        }
      }
    } catch (err) {
      console.warn("Gemini LLM context synthesis fallback triggered:", err);
    }

    return rawContext;
  }

  /**
   * Instance method implementing IVisualTextCoherenceEngine.
   */
  async buildNextContext(
    recentSnapshots: EpisodeSnapshot[],
    options?: ContextSynthesisOptions
  ): Promise<string> {
    return VisualTextCoherenceEngine.buildNextContext(recentSnapshots, options);
  }

  /**
   * Enriches a raw episode snapshot with deep text semantics & vision analysis.
   * Extracts character appearances, locations, open/resolved threads, tone, pacing, and visual atmospheric metadata.
   */
  static async enrichSnapshot(
    baseSnapshot: EpisodeSnapshot,
    existingCharacters: string[] = [],
    existingLocations: string[] = []
  ): Promise<EpisodeSnapshot> {
    // 1. Semantic and literary analysis via LLM
    const textAnalysis = await LLMClient.analyzeEpisode(
      baseSnapshot.text,
      baseSnapshot.episodeNumber,
      existingCharacters,
      existingLocations
    );

    // 2. Multimodal visual manuscript analysis via VisionClient
    let visualData: VisualAnalysisResult = {
      visualDensity: 0.75,
      compositionalBalance: "balanced",
      dominantAtmosphere: "Atmospheric Indigo",
      visualWordCountEstimate: baseSnapshot.text.split(/\s+/).filter(Boolean).length,
      aestheticScore: 0.95,
    };

    try {
      visualData = await VisionClient.analyzeScreenshot(
        baseSnapshot.screenshotUrl,
        baseSnapshot.text
      );
    } catch (vErr) {
      console.warn("Visual analysis warning:", vErr);
    }

    // 3. Synthesize combined tags and title
    const combinedTags = Array.from(
      new Set([
        ...baseSnapshot.tags,
        ...textAnalysis.tags,
        visualData.dominantAtmosphere,
        `Pacing: ${textAnalysis.pacing}`,
        `Tone: ${textAnalysis.tone}`,
      ])
    ).filter(Boolean);

    // Derive or refine episode title if currently generic
    let episodeTitle = baseSnapshot.title;
    if (
      !episodeTitle ||
      episodeTitle === `Episode ${baseSnapshot.episodeNumber}` ||
      episodeTitle.trim() === ""
    ) {
      if (textAnalysis.thematicSummary) {
        const words = textAnalysis.thematicSummary.split(" ");
        if (words.length >= 3) {
          episodeTitle = words.slice(0, 4).join(" ").replace(/[.,:;]/g, "");
        }
      }
      if (!episodeTitle) {
        episodeTitle = `Chapter ${baseSnapshot.episodeNumber}: The Threshold`;
      }
    }

    return {
      ...baseSnapshot,
      title: episodeTitle,
      characters: textAnalysis.characters,
      locations: textAnalysis.locations,
      tags: combinedTags,
      tone: textAnalysis.tone,
      pacing: textAnalysis.pacing,
      openThreads: textAnalysis.openThreads,
      resolvedThreads: textAnalysis.resolvedThreads,
      thematicSummary: textAnalysis.thematicSummary,
    };
  }

  /**
   * Instance method implementing IVisualTextCoherenceEngine.
   */
  async enrichSnapshot(
    baseSnapshot: EpisodeSnapshot,
    existingCharacters: string[] = [],
    existingLocations: string[] = []
  ): Promise<EpisodeSnapshot> {
    return VisualTextCoherenceEngine.enrichSnapshot(
      baseSnapshot,
      existingCharacters,
      existingLocations
    );
  }

  /**
   * Evaluates the continuity coherence across an entire series of snapshots.
   * Identifies narrative drift, thread accumulation, and pacing uniformity.
   */
  static auditCoherence(snapshots: EpisodeSnapshot[]): CoherenceAuditResult {
    if (!snapshots || snapshots.length === 0) {
      return {
        coherenceScore: 1.0,
        pacingTrajectory: "steady",
        characterContinuityScore: 1.0,
        openThreadsCount: 0,
        warnings: [],
        recommendations: ["Generate Episode 1 to initiate the continuity matrix."],
      };
    }

    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Track thread resolution health
    const allOpen = snapshots.flatMap((s) => s.openThreads || []);
    const allResolved = snapshots.flatMap((s) => s.resolvedThreads || []);
    const netOpenCount = allOpen.length - allResolved.length;

    if (netOpenCount > 6) {
      warnings.push(`High thread accumulation: ${netOpenCount} unresolved narrative tensions active.`);
      recommendations.push("Consider resolving 1-2 open subplots in upcoming episodes to preserve focus.");
    }

    // Pacing balance analysis
    const pacingSequence = snapshots.map((s) => s.pacing);
    const hasOnlyFast = pacingSequence.length >= 3 && pacingSequence.every((p) => p === "fast");
    const hasOnlySlow = pacingSequence.length >= 3 && pacingSequence.every((p) => p === "slow");

    let pacingTrajectory: "accelerating" | "steady" | "decelerating" | "fluctuating" = "steady";
    if (hasOnlyFast) {
      pacingTrajectory = "accelerating";
      recommendations.push("Introduce a character reflection or worldbuilding scene to pace intense action.");
    } else if (hasOnlySlow) {
      pacingTrajectory = "decelerating";
      recommendations.push("Inject an external crisis, revelation, or confrontation to accelerate dramatic momentum.");
    } else {
      pacingTrajectory = "fluctuating";
    }

    // Character persistence check
    const characterOccurrences: Record<string, number> = {};
    snapshots.forEach((s) => {
      s.characters.forEach((c) => {
        characterOccurrences[c] = (characterOccurrences[c] || 0) + 1;
      });
    });

    const totalCharacters = Object.keys(characterOccurrences).length;
    const recurringCharacters = Object.values(characterOccurrences).filter((cnt) => cnt > 1).length;
    const characterContinuityScore =
      totalCharacters > 0 ? Math.min(1.0, recurringCharacters / totalCharacters + 0.3) : 1.0;

    if (totalCharacters > 8 && recurringCharacters < 2) {
      warnings.push("High character turnover: Many one-off characters detected across recent episodes.");
      recommendations.push("Anchor scenes around core recurring cast members to deepen character attachments.");
    }

    // Calculate composite score
    let score = 0.95;
    if (warnings.length > 0) score -= warnings.length * 0.1;
    if (characterContinuityScore < 0.5) score -= 0.15;
    score = Math.max(0.4, Math.min(1.0, score));

    return {
      coherenceScore: Number(score.toFixed(2)),
      pacingTrajectory,
      characterContinuityScore: Number(characterContinuityScore.toFixed(2)),
      openThreadsCount: Math.max(0, netOpenCount),
      warnings,
      recommendations,
    };
  }

  /**
   * Instance method implementing IVisualTextCoherenceEngine.
   */
  auditCoherence(snapshots: EpisodeSnapshot[]): CoherenceAuditResult {
    return VisualTextCoherenceEngine.auditCoherence(snapshots);
  }
}

export const visualTextCoherenceEngine = new VisualTextCoherenceEngine();
