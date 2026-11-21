import {
  emotionColor,
  type EmotionValues,
  type Intensity,
  type PlutchikEmotion,
} from "@/utils/plutchik";
import { shares } from "@/utils/shares";

export function countryColor(
  emotions: EmotionValues,
  active: readonly PlutchikEmotion[],
): string | null {
  const [top] = shares(emotions, active);
  if (!top) return null;
  const even = 1 / active.length;
  const lead = active.length > 1 ? (top.share - even) / (1 - even) : 1;
  const intensity = Math.min(2, Math.floor(lead * 3)) as Intensity;
  return emotionColor(top.emotion, intensity);
}
