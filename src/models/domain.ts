// Domain models for WorthWyl OS v3 Novel Engine

export type Novel = {
  id: string;
  title: string;
  genre: string;
  premise?: string;
  status: "in_progress" | "complete";
  createdAt: string;
  updatedAt: string;
};

export type Episode = {
  id: string;
  novelId: string;
  episodeNumber: number;
  title?: string;
  text: string;
  createdAt: string;
};

export type EpisodeSnapshot = {
  id: string;
  novelId: string;
  episodeNumber: number;
  createdAt: string;
  title?: string;
  text: string;
  screenshotUrl: string;
  characters: string[];
  locations: string[];
  tags: string[];
  tone: string;
  pacing: "slow" | "medium" | "fast";
  openThreads: string[];
  resolvedThreads: string[];
  thematicSummary?: string;
};

export type ContinuityState = {
  characters: Record<string, { firstSeen: number; lastSeen: number; archetype?: string; status?: string }>;
  locations: Record<string, { firstSeen: number; lastSeen: number; description?: string }>;
  openThreads: string[];
  resolvedThreads: string[];
  pacingTrend?: Array<{ episodeNumber: number; pacing: "slow" | "medium" | "fast"; tone: string }>;
};
