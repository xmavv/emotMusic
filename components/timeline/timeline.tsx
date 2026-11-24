"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { SHIMMER_SYNC } from "@/utils/shimmer";

const STEP_WIDTH = 90;
const TIMELINE_VIEWPORT_CLASS =
  "relative h-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]";
const TIMELINE_INDICATOR_CLASS =
  "pointer-events-none absolute left-1/2 top-1 h-9 w-0.5 -translate-x-1/2 rounded-full";
const ALL_TIME_TOGGLE_CLASS =
  "absolute right-0 top-1/2 -translate-y-1/2 rounded-full border bg-neutral-950 px-3 py-1 text-xs";
const SKELETON_YEARS = 20;
const FORM_FIELDS = "input, select, textarea";
export const ALL_TIME_LABEL = "Wszystkie lata";

interface TimelineProps {
  minYear: number;
  maxYear: number;
  year: number;
  onYearChange: (year: number) => void;
  isAllTime: boolean;
  onAllTimeChange: (isAllTime: boolean) => void;
}

export function Timeline({
  minYear,
  maxYear,
  year,
  onYearChange,
  isAllTime,
  onAllTimeChange,
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
    const leaveAllTime = () => onAllTimeChange(false);
    api
      .on("scroll", update)
      .on("pointerUp", snap)
      .on("pointerDown", leaveAllTime);
    return () => {
      api
        .off("scroll", update)
        .off("pointerUp", snap)
        .off("pointerDown", leaveAllTime);
    };
  }, [api, minYear, onYearChange, onAllTimeChange]);

  useEffect(() => {
    if (!api) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const isShortcut = e.altKey || e.ctrlKey || e.metaKey;
      const isInFormField =
        e.target instanceof Element && e.target.closest(FORM_FIELDS) !== null;
      if (isShortcut || isInFormField) return;

      if (e.key === "ArrowLeft") api.scrollPrev();
      else if (e.key === "ArrowRight") api.scrollNext();
      else return;
      onAllTimeChange(false);
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [api, onAllTimeChange]);

  return (
    <div className="relative">
      <div
        ref={viewportRef}
        tabIndex={0}
        role="slider"
        aria-label="Rok"
        aria-valuemin={minYear}
        aria-valuemax={maxYear}
        aria-valuenow={year}
        aria-valuetext={isAllTime ? ALL_TIME_LABEL : undefined}
        className={`${TIMELINE_VIEWPORT_CLASS} cursor-grab select-none transition-opacity rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-amber-300/50 active:cursor-grabbing ${isAllTime ? "opacity-40" : ""}`}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translate3d(calc(50% - ${(startIndex + 0.5) * STEP_WIDTH}px), 0, 0)`,
          }}
        >
          {years.map((y) => {
            const isActive = !isAllTime && y === year;
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
          className={`${TIMELINE_INDICATOR_CLASS} ${isAllTime ? "bg-neutral-600" : "bg-amber-300 shadow-[0_0_10px] shadow-amber-300/60"}`}
        />
      </div>
      <AllTimeToggle
        isAllTime={isAllTime}
        onToggle={() => onAllTimeChange(!isAllTime)}
      />
    </div>
  );
}

interface AllTimeToggleProps {
  isAllTime: boolean;
  onToggle: () => void;
}

function AllTimeToggle({ isAllTime, onToggle }: AllTimeToggleProps) {
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
      {ALL_TIME_LABEL}
    </button>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="relative animate-pulse" style={SHIMMER_SYNC}>
      <div className={TIMELINE_VIEWPORT_CLASS}>
        <div
          className="absolute inset-y-0 right-1/2 flex"
          style={{ transform: `translateX(${STEP_WIDTH / 2}px)` }}
        >
          {Array.from({ length: SKELETON_YEARS }, (_, i) => (
            <div
              key={i}
              className="flex shrink-0 flex-col items-center pt-3"
              style={{ width: STEP_WIDTH }}
            >
              <span className="mt-2.5 h-3.5 w-px rounded-full bg-neutral-800" />
              <span className="mt-3 h-3 w-9 rounded bg-neutral-800" />
            </div>
          ))}
        </div>
        <div className={`${TIMELINE_INDICATOR_CLASS} bg-neutral-600`} />
      </div>
      <span
        className={`${ALL_TIME_TOGGLE_CLASS} border-neutral-800 text-neutral-700`}
      >
        {ALL_TIME_LABEL}
      </span>
    </div>
  );
}
