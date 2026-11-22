import type { CountryYearEmotions } from "@/services/supabase/tables";

// https://commons.wikimedia.org/wiki/File:Plutchik-wheel.svg
const WHEEL = {
  joy: ["#FFFFB1", "#FFFF54", "#FFE854"],
  trust: ["#8CFF8C", "#54FF54", "#00B400"],
  fear: ["#8CC68C", "#009600", "#008000"],
  surprise: ["#A5DBFF", "#59BDFF", "#0089E0"],
  sadness: ["#8C8CFF", "#5151FF", "#0000C8"],
  disgust: ["#FFC6FF", "#FF54FF", "#DE00DE"],
  anger: ["#FF8C8C", "#FF0000", "#D40000"],
  anticipation: ["#FFC48C", "#FFA854", "#FF7D00"],
} as const satisfies Partial<
  Record<keyof CountryYearEmotions, readonly string[]>
>;

export type PlutchikEmotion = keyof typeof WHEEL;
export type EmotionValues = Record<PlutchikEmotion, number>;

export const PLUTCHIK_EMOTIONS = Object.keys(WHEEL) as PlutchikEmotion[];

export const EMOTION_LABELS: Record<PlutchikEmotion, string> = {
  joy: "radość",
  trust: "zaufanie",
  fear: "strach",
  surprise: "zaskoczenie",
  sadness: "smutek",
  disgust: "wstręt",
  anger: "złość",
  anticipation: "oczekiwanie",
};

export const EMOTION_GENITIVE_LABELS: Record<PlutchikEmotion, string> = {
  joy: "radości",
  trust: "zaufania",
  fear: "strachu",
  surprise: "zaskoczenia",
  sadness: "smutku",
  disgust: "wstrętu",
  anger: "złości",
  anticipation: "oczekiwania",
};

export const mapEmotions = <Value>(
  valueOf: (emotion: PlutchikEmotion) => Value,
) =>
  Object.fromEntries(
    PLUTCHIK_EMOTIONS.map((emotion) => [emotion, valueOf(emotion)]),
  ) as Record<PlutchikEmotion, Value>;

export const INTENSITIES = [0, 1, 2] as const;
export type Intensity = (typeof INTENSITIES)[number];

export const emotionColor = (
  emotion: PlutchikEmotion,
  intensity: Intensity = 1,
) => WHEEL[emotion][intensity];
