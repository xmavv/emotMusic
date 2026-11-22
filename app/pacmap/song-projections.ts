import { UMAP } from "umap-js";
import { pacmap } from "@/lib/pacmap";
import { createRandom } from "@/lib/random";
import type { SongEmotion } from "@/services/supabase/supabaseTables";
import {
  featureSpaces,
  getFeatureVector,
  type EmotionKey,
  type ProjectedPoint,
  type SongProjections,
  type SpaceProjections,
} from "./projection-options";

const seed = 2026;

export async function projectSongs(songs: SongEmotion[]) {
  "use cache";

  const projections = {} as SongProjections;
  for (const [space, , features] of featureSpaces) {
    projections[space] = projectFeatureSpace(songs, features);
  }

  return projections;
}

function projectFeatureSpace(songs: readonly SongEmotion[], features: readonly EmotionKey[]): SpaceProjections {
  const ids: number[] = [];
  const vectors: number[][] = [];

  for (const song of songs) {
    const vector = getFeatureVector(song, features);
    if (vector) {
      ids.push(song.id);
      vectors.push(vector);
    }
  }

  return {
    pacmap: toPoints(ids, pacmap(vectors, { random: createRandom(seed) })),
    umap: toPoints(ids, runUmap(vectors)),
  };
}

function runUmap(vectors: number[][]) {
  if (vectors.length < 3) return vectors.map(() => [0, 0]);

  const umap = new UMAP({
    nComponents: 2,
    nNeighbors: Math.min(15, vectors.length - 1),
    minDist: 0.1,
    random: createRandom(seed),
  });

  return umap.fit(vectors);
}

function toPoints(ids: readonly number[], coordinates: readonly (readonly number[])[]): ProjectedPoint[] {
  return ids.map((id, index) => ({ id, x: round(coordinates[index][0]), y: round(coordinates[index][1]) }));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}
