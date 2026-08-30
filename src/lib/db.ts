// Client adapter for WorthWyl OS v3 Database / Persistence
import { EpisodicMemoryStore } from "../core/memory/EpisodicMemoryStore";
import { Novel, Episode, EpisodeSnapshot, ContinuityState } from "../models/domain";
import { ContinuityTracker } from "../core/coherence/ContinuityTracker";

export const db = {
  novels: {
    findMany: async (): Promise<Novel[]> => {
      return EpisodicMemoryStore.listNovels();
    },
    findById: async (id: string): Promise<Novel | null> => {
      return EpisodicMemoryStore.getNovel(id);
    },
    create: async (novel: Omit<Novel, "createdAt" | "updatedAt">): Promise<Novel> => {
      const full: Novel = {
        ...novel,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return EpisodicMemoryStore.saveNovel(full);
    },
  },
  episodes: {
    findByNovelId: async (novelId: string): Promise<Episode[]> => {
      return EpisodicMemoryStore.getEpisodes(novelId);
    },
    create: async (episode: Episode): Promise<Episode> => {
      return EpisodicMemoryStore.saveEpisode(episode);
    },
  },
  snapshots: {
    findByNovelId: async (novelId: string): Promise<EpisodeSnapshot[]> => {
      return EpisodicMemoryStore.getAllSnapshots(novelId);
    },
    getRecent: async (novelId: string, limit = 5): Promise<EpisodeSnapshot[]> => {
      return EpisodicMemoryStore.getRecentSnapshots(novelId, limit);
    },
    create: async (snapshot: EpisodeSnapshot): Promise<EpisodeSnapshot> => {
      return EpisodicMemoryStore.saveSnapshot(snapshot);
    },
  },
  continuity: {
    getForNovel: async (novelId: string): Promise<ContinuityState> => {
      const snapshots = await EpisodicMemoryStore.getAllSnapshots(novelId);
      return ContinuityTracker.buildState(snapshots);
    },
  },
};
