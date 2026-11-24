import { dominantEmotions, emotions } from "@/components/song/song-emotions";
import type { SongEmotion } from "@/services/supabase/tables";

export type EmotionKey = (typeof emotions)[number][0];

export const projectionMethods = [
  ["pacmap", "PaCMAP"],
  ["umap", "UMAP"],
] as const;

export const featureSpaces = [
  ["plutchik", "8 emocji Plutchika", dominantEmotions.map(([key]) => key)],
  ["profile", "Emocje i nastrój (11 wymiarów)", emotions.map(([key]) => key)],
] as const satisfies readonly [string, string, readonly EmotionKey[]][];

export type ProjectionMethod = (typeof projectionMethods)[number][0];
export type FeatureSpace = (typeof featureSpaces)[number][0];

export type ProjectedPoint = { id: number; x: number; y: number };
export type SpaceProjections = Record<ProjectionMethod, ProjectedPoint[]>;
export type SongProjections = Record<FeatureSpace, SpaceProjections>;

export function getFeatureVector(song: SongEmotion, features: readonly EmotionKey[]) {
  const vector: number[] = [];

  for (const key of features) {
    const value = song.SongsEmotions?.[key];
    if (value == null || !Number.isFinite(value)) return undefined;
    vector.push(value);
  }

  return vector;
}
