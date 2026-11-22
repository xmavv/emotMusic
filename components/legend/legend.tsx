"use client";

import { useId, type ReactNode } from "react";
import {
  emotionColor,
  INTENSITIES,
  PLUTCHIK_EMOTIONS,
  type PlutchikEmotion,
} from "@/utils/plutchik";
import {
  HINT_CLASS,
  LEAD_HINT,
  LEGEND_CLASS,
  STRENGTH_HINT,
  SWATCH_CLASS,
} from "@/components/legend/constants";

interface LegendProps {
  active: PlutchikEmotion[];
  onToggle: (emotion: PlutchikEmotion) => void;
  children?: ReactNode;
}

export function Legend({ active, onToggle, children }: LegendProps) {
  const hintId = useId();

  return (
    <div className="group relative">
      <div className={LEGEND_CLASS}>
        {PLUTCHIK_EMOTIONS.map((emotion) => {
          const isActive = active.includes(emotion);
          return (
            <button
              key={emotion}
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
              {emotion}
            </button>
          );
        })}
        {children}
      </div>
      <span id={hintId} role="tooltip" className={HINT_CLASS}>
        {active.length === 1 ? STRENGTH_HINT : LEAD_HINT}
      </span>
    </div>
  );
}
