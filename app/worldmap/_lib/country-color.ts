import type {
  EmotionThresholds,
  ShadeThresholds,
} from "@/app/worldmap/_lib/emotion-thresholds";
import {
  emotionColor,
  type EmotionValues,
  type Intensity,
  type PlutchikEmotion,
} from "@/utils/plutchik";
import { shares } from "@/utils/shares";

function strengthIntensity(
  value: number,
  { medium, strong }: ShadeThresholds,
): Intensity {
  if (value >= strong) return 2;
  return value >= medium ? 1 : 0;
}

function leadIntensity(topShare: number, emotionCount: number): Intensity {
  const evenShare = 1 / emotionCount;
  const lead = (topShare - evenShare) / (1 - evenShare);
  return Math.min(2, Math.floor(lead * 3)) as Intensity;
}

export function countryColor(
  emotions: EmotionValues,
  active: readonly PlutchikEmotion[],
  thresholds: EmotionThresholds,
): string | null {
  if (active.length === 1) {
    const [emotion] = active;
    return emotionColor(
      emotion,
      strengthIntensity(emotions[emotion], thresholds[emotion]),
    );
  }

  const [top] = shares(emotions, active);
  if (!top) return null;
  return emotionColor(top.emotion, leadIntensity(top.share, active.length));
}
