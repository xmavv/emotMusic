import type { Emotion } from "@/services/supabase/tables";

export const emotions = [
  ["joy", "Radość", "#f9e56f"],
  ["trust", "Zaufanie", "#6cf2b5"],
  ["anticipation", "Oczekiwanie", "#ffba75"],
  ["surprise", "Zaskoczenie", "#c9a4ff"],
  ["fear", "Strach", "#99b1ff"],
  ["sadness", "Smutek", "#71d9ff"],
  ["disgust", "Wstręt", "#c8ed7b"],
  ["anger", "Złość", "#ff8296"],
  ["positive", "Pozytywność", "#64ebe4"],
  ["negative", "Negatywność", "#ff92d9"],
  ["neutral", "Neutralność", "#d5ccd9"],
] as const satisfies readonly [Exclude<keyof Emotion, "id">, string, string][];

export const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "medium",
  timeZone: "UTC",
});
export const scoreFormat = new Intl.NumberFormat("pl-PL", {
  maximumSignificantDigits: 4,
});

export type EmotionScores = Partial<Omit<Emotion, "id">>;
