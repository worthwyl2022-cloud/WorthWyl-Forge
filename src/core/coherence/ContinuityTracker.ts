// Continuity Tracker for WorthWyl OS v3
import { EpisodeSnapshot, ContinuityState } from "../../models/domain";

export class ContinuityTracker {
  /**
   * Rebuilds global continuity state across all snapshots for a novel.
   */
  static buildState(allSnapshots: EpisodeSnapshot[]): ContinuityState {
    const characters: Record<string, { firstSeen: number; lastSeen: number; archetype?: string }> = {};
    const locations: Record<string, { firstSeen: number; lastSeen: number }> = {};
    const openThreadsSet = new Set<string>();
    const resolvedThreadsSet = new Set<string>();
    const pacingTrend: Array<{ episodeNumber: number; pacing: "slow" | "medium" | "fast"; tone: string }> = [];

    // Sort snapshots ascending
    const sorted = [...allSnapshots].sort((a, b) => a.episodeNumber - b.episodeNumber);

    for (const snap of sorted) {
      const epNum = snap.episodeNumber;

      // Track Characters
      (snap.characters || []).forEach((char) => {
        const trimmed = char.trim();
        if (!trimmed) return;
        if (!characters[trimmed]) {
          characters[trimmed] = { firstSeen: epNum, lastSeen: epNum };
        } else {
          characters[trimmed].lastSeen = epNum;
        }
      });

      // Track Locations
      (snap.locations || []).forEach((loc) => {
        const trimmed = loc.trim();
        if (!trimmed) return;
        if (!locations[trimmed]) {
          locations[trimmed] = { firstSeen: epNum, lastSeen: epNum };
        } else {
          locations[trimmed].lastSeen = epNum;
        }
      });

      // Track Resolved threads
      (snap.resolvedThreads || []).forEach((th) => {
        const t = th.trim();
        if (t) {
          resolvedThreadsSet.add(t);
          openThreadsSet.delete(t);
        }
      });

      // Track Open threads
      (snap.openThreads || []).forEach((th) => {
        const t = th.trim();
        if (t && !resolvedThreadsSet.has(t)) {
          openThreadsSet.add(t);
        }
      });

      pacingTrend.push({
        episodeNumber: epNum,
        pacing: snap.pacing || "medium",
        tone: snap.tone || "Atmospheric",
      });
    }

    return {
      characters,
      locations,
      openThreads: Array.from(openThreadsSet),
      resolvedThreads: Array.from(resolvedThreadsSet),
      pacingTrend,
    };
  }
}
