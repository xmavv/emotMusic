"use client";

import {
  emotionColor,
  PLUTCHIK_EMOTIONS,
  type PlutchikEmotion,
} from "@/utils/plutchik";
import { LEGEND_CLASSES } from "@/components/legend/constants";

type Orientation = keyof typeof LEGEND_CLASSES;

interface LegendProps {
  active: PlutchikEmotion[];
  onToggle: (emotion: PlutchikEmotion) => void;
  orientation?: Orientation;
}

export function Legend({
  active,
  onToggle,
  orientation = "horizontal",
}: LegendProps) {
  return (
    <div className={LEGEND_CLASSES[orientation]}>
      {PLUTCHIK_EMOTIONS.map((emotion) => {
        const isActive = active.includes(emotion);
        return (
          <button
            key={emotion}
            onClick={() => onToggle(emotion)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 transition-opacity ${
              isActive ? "text-neutral-300" : "text-neutral-600 opacity-50"
            } hover:opacity-100`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: emotionColor(emotion) }}
            />
            {emotion}
          </button>
        );
      })}
    </div>
  );
}
