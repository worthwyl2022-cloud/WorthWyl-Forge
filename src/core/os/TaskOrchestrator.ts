// Task Orchestrator for WorthWyl OS v3 Novel Engine
// Implements the behavioral contract for episodic autonomous novel writing and continuity coherence.

import { EpisodeSnapshot, ContinuityState, Novel, Episode } from "../../models/domain";
import { EpisodicMemoryStore } from "../memory/EpisodicMemoryStore";
import { VisualTextCoherenceEngine } from "../coherence/VisualTextCoherenceEngine";
import { ContinuityTracker } from "../coherence/ContinuityTracker";
import { LLMClient } from "../llm/LLMClient";
import { ScreenshotService } from "../screenshots/ScreenshotService";

export interface TaskOrchestratorContract {
  writeNextEpisode(
    novelId: string,
    userDirective?: string,
    onProgress?: (step: string) => void
  ): Promise<{
    episodeText: string;
    snapshot: EpisodeSnapshot;
    continuity: ContinuityState;
  }>;
}

export class TaskOrchestrator implements TaskOrchestratorContract {
  /**
   * Complete cognitive loop for authoring next novel episode with visual-text hybrid coherence and continuity tracking.
   */
  async writeNextEpisode(
    novelId: string,
    userDirective?: string,
    onProgress?: (step: string) => void
  ): Promise<{
    episodeText: string;
    snapshot: EpisodeSnapshot;
    continuity: ContinuityState;
  }> {
    if (onProgress) onProgress("1/6 Loading episodic memory & historical snapshots...");
    // 1. Fetch novel data
    let novel = await EpisodicMemoryStore.getNovel(novelId);
    if (!novel) {
      const novels = await EpisodicMemoryStore.listNovels();
      novel = novels.find((n) => n.id === novelId) || novels[0];
    }
    const novelTitle = novel?.title || "WorthWyl Continuum";
    const genre = novel?.genre || "Speculative Fiction";
    const premise = novel?.premise || "";

    // 2. Load recent episodic memory (last 3-5 snapshots)
    const recentSnapshots = await EpisodicMemoryStore.getRecentSnapshots(novelId, 5);
    const allExistingSnapshots = await EpisodicMemoryStore.getAllSnapshots(novelId);
    const nextEpisodeNumber = allExistingSnapshots.length + 1;

    // 3. Build episodic context using VisualTextCoherenceEngine
    if (onProgress) onProgress("2/6 Building multimodal context matrix across recent episodes...");
    const contextPrompt = await VisualTextCoherenceEngine.buildNextContext(recentSnapshots, {
      novelTitle,
      genre,
      premise,
      userDirective,
    });

    // 4. Call LLM to generate the next episode text
    if (onProgress) onProgress(`3/6 Synthesizing Chapter / Episode ${nextEpisodeNumber} narrative prose...`);
    const episodeText = await LLMClient.generateEpisode({
      novelTitle,
      genre,
      episodeNumber: nextEpisodeNumber,
      premise,
      contextPrompt,
      userDirective,
    });

    // 5. Render + screenshot the episode manuscript page via ScreenshotService
    if (onProgress) onProgress("4/6 Rendering high-resolution manuscript page snapshot...");
    const screenshotUrl = await ScreenshotService.capture(
      nextEpisodeNumber,
      novelTitle,
      episodeText,
      genre
    );

    // 6. Extract existing characters & locations from prior continuity to cross-reference
    const existingContinuity = ContinuityTracker.buildState(allExistingSnapshots);
    const knownCharacters = Object.keys(existingContinuity.characters);
    const knownLocations = Object.keys(existingContinuity.locations);

    // 7. Create base EpisodeSnapshot
    const baseSnapshot: EpisodeSnapshot = {
      id: `snap_${novelId}_ep${nextEpisodeNumber}_${Date.now()}`,
      novelId,
      episodeNumber: nextEpisodeNumber,
      title: `Episode ${nextEpisodeNumber}`,
      createdAt: new Date().toISOString(),
      text: episodeText,
      screenshotUrl,
      characters: knownCharacters.slice(0, 3),
      locations: knownLocations.slice(0, 2),
      tags: [genre, `Ep.${nextEpisodeNumber}`],
      tone: "Atmospheric",
      pacing: "medium",
      openThreads: [],
      resolvedThreads: [],
    };

    // 8. Enrich snapshot via VisualTextCoherenceEngine (multimodal semantic + vision analysis)
    if (onProgress) onProgress("5/6 Analyzing visual-text coherence, character arcs, and threads...");
    const enrichedSnapshot = await VisualTextCoherenceEngine.enrichSnapshot(
      baseSnapshot,
      knownCharacters,
      knownLocations
    );

    // 9. Persist episode and snapshot via EpisodicMemoryStore
    if (onProgress) onProgress("6/6 Persisting episodic memory & rebuilding continuity lattice...");
    const episodeRecord: Episode = {
      id: `ep_${novelId}_${nextEpisodeNumber}`,
      novelId,
      episodeNumber: nextEpisodeNumber,
      title: enrichedSnapshot.title,
      text: episodeText,
      createdAt: new Date().toISOString(),
    };
    await EpisodicMemoryStore.saveEpisode(episodeRecord);
    await EpisodicMemoryStore.saveSnapshot(enrichedSnapshot);

    // 10. Rebuild global continuity state across all snapshots for this novel
    const updatedSnapshots = await EpisodicMemoryStore.getAllSnapshots(novelId);
    const updatedContinuity = ContinuityTracker.buildState(updatedSnapshots);

    return {
      episodeText,
      snapshot: enrichedSnapshot,
      continuity: updatedContinuity,
    };
  }
}

export const orchestrator = new TaskOrchestrator();
export const taskOrchestrator = orchestrator;
