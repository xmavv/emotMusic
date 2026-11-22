import { FEW_SONGS_LIMIT } from "@/app/worldmap/_constants/map";
import type {
  CountryYearStats,
  StatsByCountry,
} from "@/app/worldmap/_data/stats";
import { worldStats } from "@/app/worldmap/_lib/merge-stats";
import {
  PLUTCHIK_EMOTIONS,
  type EmotionValues,
  type PlutchikEmotion,
} from "@/utils/plutchik";

export const SIMILARITY_COLORS = [
  "#cde2fb",
  "#86b6ef",
  "#3987e5",
  "#256abf",
  "#184f95",
] as const;

export type ColorMode = "strongest" | "similarity";
export type Similarities = Record<string, number>;

export interface SimilarCountry {
  code: string;
  similarity: number;
}

export function restOfWorld(
  world: CountryYearStats,
  country: CountryYearStats,
): EmotionValues | null {
  const restSongCount = world.songCount - country.songCount;
  if (restSongCount <= 0) return null;

  const restAverage = (emotion: PlutchikEmotion) =>
    (world.averageEmotions[emotion] * world.songCount -
      country.averageEmotions[emotion] * country.songCount) /
    restSongCount;

  return Object.fromEntries(
    PLUTCHIK_EMOTIONS.map((emotion) => [
      emotion,
      Math.max(0, restAverage(emotion)),
    ]),
  ) as EmotionValues;
}

export function similarityBetween(
  first: EmotionValues,
  second: EmotionValues,
): number {
  let overlap = 0;
  let union = 0;
  for (const emotion of PLUTCHIK_EMOTIONS) {
    overlap += Math.min(first[emotion], second[emotion]);
    union += Math.max(first[emotion], second[emotion]);
  }
  return union === 0 ? 1 : overlap / union;
}

export function similarityToRest(statsByCountry: StatsByCountry): Similarities {
  const world = worldStats(statsByCountry);
  const similarities: Similarities = {};
  if (!world) return similarities;

  for (const [code, stats] of Object.entries(statsByCountry)) {
    const rest = restOfWorld(world, stats);
    if (rest)
      similarities[code] = similarityBetween(stats.averageEmotions, rest);
  }
  return similarities;
}

export function mostSimilarCountries(
  statsByCountry: StatsByCountry,
  code: string,
): SimilarCountry[] {
  const { averageEmotions } = statsByCountry[code];

  return Object.entries(statsByCountry)
    .filter(
      ([otherCode, { songCount }]) =>
        otherCode !== code && songCount >= FEW_SONGS_LIMIT,
    )
    .map(([otherCode, other]) => ({
      code: otherCode,
      similarity: similarityBetween(averageEmotions, other.averageEmotions),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

export function similarityColor(similarity: number): string {
  const step = Math.floor(similarity * SIMILARITY_COLORS.length);
  return SIMILARITY_COLORS[Math.min(step, SIMILARITY_COLORS.length - 1)];
}
