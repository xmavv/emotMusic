import type { EmotionValues, PlutchikEmotion } from "@/utils/plutchik";

export function shares(
  emotions: EmotionValues,
  active: readonly PlutchikEmotion[],
): { emotion: PlutchikEmotion; share: number }[] {
  const total = active.reduce((sum, e) => sum + emotions[e], 0);
  if (total === 0) return [];
  return active
    .map((emotion) => ({ emotion, share: emotions[emotion] / total }))
    .sort((a, b) => b.share - a.share);
}
