"use client";

import { useId } from "react";
import {
  EMOTION_LABELS,
  emotionColor,
  INTENSITIES,
  PLUTCHIK_EMOTIONS,
  type PlutchikEmotion,
} from "@/utils/plutchik";
import { SHIMMER_SYNC } from "@/utils/shimmer";

export const LEGEND_CLASS =
  "mb-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs";

const SWATCH_CLASS = "flex h-2 w-6 overflow-hidden rounded-full";

const LEAD_HINT = "bledszy kolor = mniejsza przewaga nad innymi emocjami";
const STRENGTH_HINT = "bledszy kolor = słabsza emocja";
const HINT_CLASS =
  "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900/90 px-3 py-2 text-xs text-neutral-300 opacity-0 backdrop-blur transition-opacity group-has-[button:focus-visible]:opacity-100 group-has-[button:hover]:opacity-100";

interface LegendProps {
  active: PlutchikEmotion[];
  onToggle: (emotion: PlutchikEmotion) => void;
}

export function Legend({ active, onToggle }: LegendProps) {
  const hintId = useId();

  return (
    <div className="group relative">
      <div className={LEGEND_CLASS}>
        {PLUTCHIK_EMOTIONS.map((emotion) => {
          const isActive = active.includes(emotion);
          return (
            <button
              key={emotion}
              type="button"
              onClick={() => onToggle(emotion)}
              aria-pressed={isActive}
              aria-describedby={hintId}
              className={`flex items-center gap-1.5 transition-opacity ${
                isActive ? "text-neutral-300" : "text-neutral-600 opacity-50"
              } hover:opacity-100`}
            >
              <span className={SWATCH_CLASS}>
                {INTENSITIES.map((intensity) => (
                  <span
                    key={intensity}
                    className="flex-1"
                    style={{ background: emotionColor(emotion, intensity) }}
                  />
                ))}
              </span>
              {EMOTION_LABELS[emotion]}
            </button>
          );
        })}
      </div>
      <span id={hintId} role="tooltip" className={HINT_CLASS}>
        {active.length === 1 ? STRENGTH_HINT : LEAD_HINT}
      </span>
    </div>
  );
}

export function LegendSkeleton() {
  return (
    <div className={`${LEGEND_CLASS} animate-pulse`} style={SHIMMER_SYNC}>
      {PLUTCHIK_EMOTIONS.map((emotion) => (
        <span
          key={emotion}
          className="flex items-center gap-1.5 text-neutral-700"
        >
          <span className={`${SWATCH_CLASS} bg-neutral-800`} />
          {EMOTION_LABELS[emotion]}
        </span>
      ))}
    </div>
  );
}
