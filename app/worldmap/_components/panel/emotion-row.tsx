import type { ReactNode } from "react";
import { EMOTION_LABELS, type PlutchikEmotion } from "@/utils/plutchik";

export const EMOTION_ROW_CLASS =
  "grid grid-cols-[6rem_1fr_2.5rem] items-center gap-2";

interface EmotionRowProps {
  emotion: PlutchikEmotion;
  markerPosition: string;
  value: string;
  children: ReactNode;
}

export function EmotionRow({
  emotion,
  markerPosition,
  value,
  children,
}: EmotionRowProps) {
  return (
    <>
      <span>{EMOTION_LABELS[emotion]}</span>
      <span className="relative h-2 rounded-full bg-neutral-800">
        {children}
        <span
          className="absolute -inset-y-0.5 w-0.5 -translate-x-1/2 bg-neutral-100 transition-[left] duration-300"
          style={{ left: markerPosition }}
        />
      </span>
      <span className="text-right tabular-nums text-neutral-400">{value}</span>
    </>
  );
}
