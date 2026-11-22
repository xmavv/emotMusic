import type {
  CountryYearStats,
  StatsByCountry,
  StatsByYear,
} from "@/app/worldmap/_data/stats";
import { mapEmotions, type PlutchikEmotion } from "@/utils/plutchik";

function mergeStats(
  first: CountryYearStats,
  second: CountryYearStats,
): CountryYearStats {
  const songCount = first.songCount + second.songCount;
  const weightedAverage = (emotion: PlutchikEmotion) =>
    (first.averageEmotions[emotion] * first.songCount +
      second.averageEmotions[emotion] * second.songCount) /
    songCount;

  return {
    songCount,
    averageEmotions: mapEmotions(weightedAverage),
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
