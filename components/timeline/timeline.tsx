"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

import {
  STEP_WIDTH,
  TIMELINE_INDICATOR_CLASS,
  TIMELINE_VIEWPORT_CLASS,
} from "@/components/timeline/constants";

interface TimelineProps {
  minYear: number;
  maxYear: number;
  year: number;
  onYearChange: (year: number) => void;
  muted?: boolean;
  onInteract?: () => void;
}

export function Timeline({
  minYear,
  maxYear,
  year,
  onYearChange,
  muted = false,
  onInteract,
}: TimelineProps) {
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  );

  const [startIndex] = useState(year - minYear);
  const [viewportRef, api] = useEmblaCarousel(
    {
      containScroll: false,
      dragFree: true,
      duration: 15,
      startIndex,
    },
    [WheelGesturesPlugin()],
  );

  useEffect(() => {
    if (!api) return;
    const last = api.scrollSnapList().length - 1;
    const update = () => {
      const index = Math.round(api.scrollProgress() * last);
      onYearChange(minYear + Math.min(Math.max(index, 0), last));
    };
    const snap = () => api.internalEngine().scrollTo.distance(0, true);
    api.on("scroll", update).on("pointerUp", snap);
    return () => {
      api.off("scroll", update).off("pointerUp", snap);
    };
  }, [api, minYear, onYearChange]);

  useEffect(() => {
    if (!api || !onInteract) return;
    api.on("pointerDown", onInteract);
    return () => {
      api.off("pointerDown", onInteract);
    };
  }, [api, onInteract]);

  useEffect(() => {
    if (!api) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") api.scrollPrev();
      else if (e.key === "ArrowRight") api.scrollNext();
      else return;
      onInteract?.();
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [api, onInteract]);

  return (
    <div
      ref={viewportRef}
      tabIndex={0}
      role="slider"
      aria-label="Year"
      aria-valuemin={minYear}
      aria-valuemax={maxYear}
      aria-valuenow={year}
      aria-valuetext={muted ? "All time" : undefined}
      className={`${TIMELINE_VIEWPORT_CLASS} cursor-grab select-none transition-opacity rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-amber-300/50 active:cursor-grabbing ${muted ? "opacity-40" : ""}`}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translate3d(calc(50% - ${(startIndex + 0.5) * STEP_WIDTH}px), 0, 0)`,
        }}
      >
        {years.map((y) => {
          const isActive = !muted && y === year;
          const isMajor = y % 5 === 0;
          return (
            <div
              key={y}
              className="flex shrink-0 flex-col items-center pt-3"
              style={{ width: STEP_WIDTH }}
            >
              <span
                className={`w-px rounded-full transition-colors duration-150 ${
                  isMajor ? "h-6" : "mt-2.5 h-3.5"
                } ${isActive ? "bg-amber-300" : isMajor ? "bg-neutral-400" : "bg-neutral-600"}`}
              />
              <span
                className={`mt-2 text-sm tabular-nums transition-colors duration-150 ${
                  isActive
                    ? "font-semibold text-amber-300"
                    : isMajor
                      ? "text-neutral-300"
                      : "text-neutral-500"
                }`}
              >
                {y}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className={`${TIMELINE_INDICATOR_CLASS} ${muted ? "bg-neutral-600" : "bg-amber-300 shadow-[0_0_10px] shadow-amber-300/60"}`}
      />
    </div>
  );
}
