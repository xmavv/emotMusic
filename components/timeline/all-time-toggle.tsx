"use client";

import { ALL_TIME_TOGGLE_CLASS } from "@/components/timeline/constants";

interface AllTimeToggleProps {
  isAllTime: boolean;
  onToggle: () => void;
}

export function AllTimeToggle({ isAllTime, onToggle }: AllTimeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isAllTime}
      className={`${ALL_TIME_TOGGLE_CLASS} cursor-pointer transition-colors outline-none focus-visible:ring-1 focus-visible:ring-amber-300/50 ${
        isAllTime
          ? "border-amber-300 text-amber-300"
          : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-100"
      }`}
    >
      All time
    </button>
  );
}
