import { PLUTCHIK_EMOTIONS } from "@/utils/plutchik";
import { LEGEND_CLASSES } from "@/components/legend/constants";
import {
  STEP_WIDTH,
  TIMELINE_INDICATOR_CLASS,
  TIMELINE_VIEWPORT_CLASS,
} from "@/components/timeline/constants";
import { WORLD_MAP } from "@/app/worldmap/_data/world-shapes";
import { WorldmapLayout } from "@/app/worldmap/_components/worldmap-layout";
import {
  COUNTRY_BORDER,
  EMPTY_COUNTRY_COLOR,
  MAP_SIZE_CLASS,
} from "@/app/worldmap/_constants/map";

export default function Loading() {
  return (
    <WorldmapLayout
      loading
      map={
        <svg
          viewBox={`0 0 ${WORLD_MAP.width} ${WORLD_MAP.height}`}
          className={`${MAP_SIZE_CLASS} animate-pulse`}
          role="img"
          aria-label="Loading map"
        >
          {WORLD_MAP.shapes.map(({ d }, i) => (
            <path
              key={i}
              d={d}
              fill={EMPTY_COUNTRY_COLOR}
              {...COUNTRY_BORDER}
            />
          ))}
        </svg>
      }
      footer={
        <>
          <div className={`${LEGEND_CLASSES.horizontal} animate-pulse`}>
            {PLUTCHIK_EMOTIONS.map((emotion) => (
              <span
                key={emotion}
                className="flex items-center gap-1.5 text-neutral-700"
              >
                <span className="h-2 w-2 rounded-full bg-neutral-800" />
                {emotion}
              </span>
            ))}
          </div>
          <div className={`${TIMELINE_VIEWPORT_CLASS} animate-pulse`}>
            <div
              className="absolute inset-y-0 right-1/2 flex"
              style={{ transform: `translateX(${STEP_WIDTH / 2}px)` }}
            >
              {Array.from({ length: 20 }, (_, i) => (
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
        </>
      }
    />
  );
}
