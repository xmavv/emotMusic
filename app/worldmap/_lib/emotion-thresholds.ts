import type { StatsByYear } from "@/app/worldmap/_data/stats";
import { mapEmotions, type PlutchikEmotion } from "@/utils/plutchik";

export interface ShadeThresholds {
  medium: number;
  strong: number;
}

export type EmotionThresholds = Record<PlutchikEmotion, ShadeThresholds>;

export function emotionThresholds(statsByYear: StatsByYear): EmotionThresholds {
  const allStats = Object.values(statsByYear).flatMap((yearStats) =>
    Object.values(yearStats),
  );

  const thresholdsOf = (emotion: PlutchikEmotion): ShadeThresholds => {
    const sortedValues = allStats
      .map(({ averageEmotions }) => averageEmotions[emotion])
      .sort((a, b) => a - b);
    const valueAt = (fraction: number) =>
      sortedValues[Math.floor(sortedValues.length * fraction)] ?? 0;

    return { medium: valueAt(1 / 3), strong: valueAt(2 / 3) };
  };

  return mapEmotions(thresholdsOf);
}
