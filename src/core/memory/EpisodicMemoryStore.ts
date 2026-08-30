// Episodic Memory Store for WorthWyl OS v3 Novel Engine
import { Novel, Episode, EpisodeSnapshot } from "../../models/domain";

const STORAGE_KEYS = {
  NOVELS: "worthwyl_v3_novels",
  EPISODES: "worthwyl_v3_episodes",
  SNAPSHOTS: "worthwyl_v3_snapshots",
};

export class EpisodicMemoryStore {
  // In-memory cache for fast synchronization
  private static novelsCache: Map<string, Novel> = new Map();
  private static episodesCache: Map<string, Episode[]> = new Map();
  private static snapshotsCache: Map<string, EpisodeSnapshot[]> = new Map();
  private static initialized = false;

  private static init() {
    if (this.initialized || typeof window === "undefined") return;
    try {
      const storedNovels = localStorage.getItem(STORAGE_KEYS.NOVELS);
      if (storedNovels) {
        const list: Novel[] = JSON.parse(storedNovels);
        list.forEach((n) => this.novelsCache.set(n.id, n));
      }

      const storedEpisodes = localStorage.getItem(STORAGE_KEYS.EPISODES);
      if (storedEpisodes) {
        const epMap: Record<string, Episode[]> = JSON.parse(storedEpisodes);
        Object.entries(epMap).forEach(([nId, eps]) => this.episodesCache.set(nId, eps));
      }

      const storedSnapshots = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      if (storedSnapshots) {
        const snapMap: Record<string, EpisodeSnapshot[]> = JSON.parse(storedSnapshots);
        Object.entries(snapMap).forEach(([nId, snaps]) => this.snapshotsCache.set(nId, snaps));
      }
    } catch (e) {
      console.warn("Error initializing EpisodicMemoryStore from localStorage:", e);
    }
    this.initialized = true;
  }

  private static persist() {
    if (typeof window === "undefined") return;
    try {
      const novels = Array.from(this.novelsCache.values());
      localStorage.setItem(STORAGE_KEYS.NOVELS, JSON.stringify(novels));

      const epObj: Record<string, Episode[]> = {};
      this.episodesCache.forEach((eps, nId) => {
        epObj[nId] = eps;
      });
      localStorage.setItem(STORAGE_KEYS.EPISODES, JSON.stringify(epObj));

      const snapObj: Record<string, EpisodeSnapshot[]> = {};
      this.snapshotsCache.forEach((snaps, nId) => {
        snapObj[nId] = snaps;
      });
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapObj));
    } catch (e) {
      console.error("Failed to persist EpisodicMemoryStore:", e);
    }
  }

  // --- Novel Methods ---
  static async listNovels(): Promise<Novel[]> {
    this.init();
    if (this.novelsCache.size === 0) {
      // Seed default novel if empty
      const defaultNovel: Novel = {
        id: "novel_genesis_01",
        title: "Chronicles of the Iron Lattice",
        genre: "Cyberpunk Speculative Fiction",
        premise: "An archivist unearths an unindexed memory cluster beneath the sunken strata of New Kyoto.",
        status: "in_progress",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await this.saveNovel(defaultNovel);
    }
    return Array.from(this.novelsCache.values());
  }

  static async getNovel(id: string): Promise<Novel | null> {
    this.init();
    return this.novelsCache.get(id) || null;
  }

  static async saveNovel(novel: Novel): Promise<Novel> {
    this.init();
    novel.updatedAt = new Date().toISOString();
    this.novelsCache.set(novel.id, novel);
    this.persist();
    return novel;
  }

  // --- Episode Methods ---
  static async getEpisodes(novelId: string): Promise<Episode[]> {
    this.init();
    const eps = this.episodesCache.get(novelId) || [];
    return [...eps].sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  static async saveEpisode(episode: Episode): Promise<Episode> {
    this.init();
    const current = this.episodesCache.get(episode.novelId) || [];
    const index = current.findIndex((e) => e.id === episode.id || e.episodeNumber === episode.episodeNumber);
    if (index >= 0) {
      current[index] = episode;
    } else {
      current.push(episode);
    }
    this.episodesCache.set(episode.novelId, current);
    this.persist();
    return episode;
  }

  // --- Snapshot & Episodic Memory Methods ---
  static async getRecentSnapshots(novelId: string, count = 5): Promise<EpisodeSnapshot[]> {
    this.init();
    const snaps = this.snapshotsCache.get(novelId) || [];
    const sorted = [...snaps].sort((a, b) => a.episodeNumber - b.episodeNumber);
    return sorted.slice(-count);
  }

  static async getAllSnapshots(novelId: string): Promise<EpisodeSnapshot[]> {
    this.init();
    const snaps = this.snapshotsCache.get(novelId) || [];
    return [...snaps].sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  static async saveSnapshot(snapshot: EpisodeSnapshot): Promise<EpisodeSnapshot> {
    this.init();
    const snaps = this.snapshotsCache.get(snapshot.novelId) || [];
    const existingIdx = snaps.findIndex(
      (s) => s.id === snapshot.id || s.episodeNumber === snapshot.episodeNumber
    );

    if (existingIdx >= 0) {
      snaps[existingIdx] = snapshot;
    } else {
      snaps.push(snapshot);
    }

    this.snapshotsCache.set(snapshot.novelId, snaps);
    this.persist();
    return snapshot;
  }
}
