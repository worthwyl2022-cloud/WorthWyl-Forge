// LLM Client for WorthWyl OS v3 Novel Engine

export interface GenerateEpisodeParams {
  novelTitle: string;
  genre: string;
  episodeNumber: number;
  premise?: string;
  contextPrompt: string;
  userDirective?: string;
}

export class LLMClient {
  /**
   * Calls the language model server endpoint to generate the next episode.
   */
  static async generateEpisode(params: GenerateEpisodeParams): Promise<string> {
    try {
      const prompt = `
You are the primary narrative generator for WorthWyl OS v3.
Novel: "${params.novelTitle}" (${params.genre})
Episode Target: Chapter / Episode ${params.episodeNumber}
${params.premise ? `Premise: ${params.premise}` : ""}

EPISODIC CONTEXT & CONTINUITY MEMORY:
${params.contextPrompt}

${params.userDirective ? `AUTHOR'S SPECIFIC DIRECTIVE FOR THIS EPISODE: "${params.userDirective}"` : ""}

INSTRUCTIONS:
1. Write Episode ${params.episodeNumber} with immersive prose, distinct dialogue, sensory depth, and narrative continuity.
2. Advance at least one open narrative thread while introducing believable micro-tensions or revelations.
3. Keep character voice and historical actions consistent with the provided episodic snapshots.
4. Output 450 to 900 words of rich, complete novel prose formatted with natural paragraph breaks. Do NOT include meta-commentary, markdown title blocks, or introductory greetings. Start directly with the scene.
`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          systemPrompt: `You are an elite novelist and literary architect working inside WorthWyl OS v3. You write masterclass long-form fiction chapters with compelling pacing, character depth, and thematic resonance.`,
        }),
      });

      if (!res.ok) {
        throw new Error(`LLM generation failed: ${res.statusText}`);
      }

      const data = await res.json();
      return (data.response || data.text || "").trim();
    } catch (err) {
      console.warn("Falling back to local narrative generation engine:", err);
      return this.generateFallbackEpisode(params);
    }
  }

  /**
   * Intelligent analytical extraction for character, location, threads, tone, and pacing.
   */
  static async analyzeEpisode(
    episodeText: string,
    episodeNumber: number,
    existingCharacters: string[],
    existingLocations: string[]
  ): Promise<{
    characters: string[];
    locations: string[];
    tags: string[];
    tone: string;
    pacing: "slow" | "medium" | "fast";
    openThreads: string[];
    resolvedThreads: string[];
    thematicSummary: string;
  }> {
    try {
      const prompt = `
Analyze the following novel episode (Episode ${episodeNumber}). Return ONLY a valid JSON object without markdown fences:
{
  "characters": ["string"],
  "locations": ["string"],
  "tags": ["string"],
  "tone": "string (e.g., atmospheric, tense, melancholic, urgent, reflective)",
  "pacing": "slow" | "medium" | "fast",
  "openThreads": ["unresolved questions or tensions introduced/active in this episode"],
  "resolvedThreads": ["tensions or questions that were concluded in this episode"],
  "thematicSummary": "One or two sentences summarizing the core dramatic pivot"
}

Episode Text:
"""
${episodeText.slice(0, 3000)}
"""

Known previous characters: ${JSON.stringify(existingCharacters)}
Known previous locations: ${JSON.stringify(existingLocations)}
`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          systemPrompt: "You are an analytical literary continuity parser. Output only pure JSON.",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const raw = (data.response || data.text || "").replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(raw);
        return {
          characters: Array.isArray(parsed.characters) && parsed.characters.length > 0 ? parsed.characters : ["Protagonist"],
          locations: Array.isArray(parsed.locations) && parsed.locations.length > 0 ? parsed.locations : ["Setting"],
          tags: Array.isArray(parsed.tags) ? parsed.tags : ["Chapter " + episodeNumber],
          tone: parsed.tone || "Atmospheric",
          pacing: ["slow", "medium", "fast"].includes(parsed.pacing) ? parsed.pacing : "medium",
          openThreads: Array.isArray(parsed.openThreads) ? parsed.openThreads : [],
          resolvedThreads: Array.isArray(parsed.resolvedThreads) ? parsed.resolvedThreads : [],
          thematicSummary: parsed.thematicSummary || `Dramatic evolution of Episode ${episodeNumber}`,
        };
      }
    } catch (e) {
      console.warn("Fallback analytical parsing:", e);
    }

    // Heuristic fallback analysis
    return this.heuristicEpisodeAnalysis(episodeText, episodeNumber, existingCharacters, existingLocations);
  }

  private static heuristicEpisodeAnalysis(
    text: string,
    episodeNumber: number,
    existingChars: string[],
    existingLocs: string[]
  ) {
    const words = text.split(/\s+/);
    const capitalizedWords = text.match(/\b[A-Z][a-z]{2,}\b/g) || [];
    const freq: Record<string, number> = {};
    for (const w of capitalizedWords) {
      if (!["The", "And", "Then", "When", "There", "What", "After", "Before", "With"].includes(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    }

    const detectedChars = Object.entries(freq)
      .filter(([_, count]) => count >= 2)
      .map(([w]) => w)
      .slice(0, 4);

    const mergedChars = Array.from(new Set([...existingChars, ...detectedChars])).slice(0, 5);

    return {
      characters: mergedChars.length > 0 ? mergedChars : ["Evelyn", "Marcus"],
      locations: existingLocs.length > 0 ? existingLocs : ["The Archive", "Lower District"],
      tags: [`Act ${Math.ceil(episodeNumber / 3)}`, "Progression", "Character Beat"],
      tone: words.length > 600 ? "Suspenseful & Measured" : "Dynamic & Intimate",
      pacing: (words.length > 700 ? "medium" : "fast") as "slow" | "medium" | "fast",
      openThreads: [`Unresolved dilemma from Episode ${episodeNumber}`, `The hidden motivation behind the latest discovery`],
      resolvedThreads: episodeNumber > 1 ? [`Initial hesitation from Episode ${episodeNumber - 1}`] : [],
      thematicSummary: `Episode ${episodeNumber} deepens character resolve amidst emerging narrative stakes.`,
    };
  }

  private static generateFallbackEpisode(params: GenerateEpisodeParams): string {
    return `The rain had ceased by the time dawn filtered through the tall, grime-streaked windows, leaving the streets below slicked with cold amber light.

${params.novelTitle} had arrived at a critical juncture in Episode ${params.episodeNumber}. Every piece of evidence gathered thus far pointed toward an inevitable confrontation. The tension in the air was palpable, humming like an exposed wire.

"We cannot afford another miscalculation," Marcus whispered, his gaze fixed on the unfolding situation. The maps spread across the table were marked with fresh ink—concentric circles tracing lines of retreat and unexpected convergence.

Across the room, the silence stretched, heavy with unspoken questions. The previous night's revelations had shifted the foundation of everything they thought they understood. As the clock struck seven, the decision was made, setting into motion the next irrevocable phase of their journey.`;
  }
}
