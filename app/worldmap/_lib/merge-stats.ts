import type {
  CountryYearStats,
  StatsByCountry,
  StatsByYear,
} from "@/app/worldmap/_data/stats";
import { PLUTCHIK_EMOTIONS, type EmotionValues } from "@/utils/plutchik";

function mergeStats(
  first: CountryYearStats,
  second: CountryYearStats,
): CountryYearStats {
  const songCount = first.songCount + second.songCount;
  const weightedAverage = (emotion: keyof EmotionValues) =>
    (first.averageEmotions[emotion] * first.songCount +
      second.averageEmotions[emotion] * second.songCount) /
    songCount;

  return {
    songCount,
    averageEmotions: Object.fromEntries(
      PLUTCHIK_EMOTIONS.map((emotion) => [emotion, weightedAverage(emotion)]),
    ) as EmotionValues,
  };
}

export function allTimeStats(statsByYear: StatsByYear): StatsByCountry {
  const statsByCountry: StatsByCountry = {};

  for (const yearStats of Object.values(statsByYear)) {
    for (const [country, stats] of Object.entries(yearStats)) {
      const collected = statsByCountry[country];
      statsByCountry[country] = collected
        ? mergeStats(collected, stats)
        : stats;
    }
  }

  return statsByCountry;
}

export function worldStats(
  statsByCountry: StatsByCountry,
): CountryYearStats | undefined {
  const countries = Object.values(statsByCountry);
  return countries.length > 0 ? countries.reduce(mergeStats) : undefined;
}
