import { WorldmapLayout } from "@/app/worldmap/_components/worldmap-layout";
import {
  COUNTRY_BORDER,
  EMPTY_COUNTRY_COLOR,
  MAP_SIZE_CLASS,
} from "@/app/worldmap/_constants";
import { WORLD_MAP } from "@/app/worldmap/_data/world-shapes";
import { LegendSkeleton } from "@/components/legend/legend";
import { TimelineSkeleton } from "@/components/timeline/timeline";

const LAND_ID = "land";
const LAND_CLIP_ID = "land-clip";
const SHIMMER_ID = "shimmer";
const SHIMMER_STOPS = [
  [0.15, 0],
  [0.27, 0.03],
  [0.38, 0.14],
  [0.5, 0.22],
  [0.62, 0.14],
  [0.73, 0.03],
  [0.85, 0],
];
const LAND_PATH = WORLD_MAP.shapes.map(({ d }) => d).join("");

export default function Loading() {
  return (
    <WorldmapLayout
      loading
      map={
        <svg
          viewBox={`0 0 ${WORLD_MAP.width} ${WORLD_MAP.height}`}
          className={MAP_SIZE_CLASS}
          role="img"
          aria-label="Ładowanie mapy"
        >
          <defs>
            <linearGradient id={SHIMMER_ID}>
              {SHIMMER_STOPS.map(([offset, opacity]) => (
                <stop
                  key={offset}
                  offset={offset}
                  stopColor="white"
                  stopOpacity={opacity}
                />
              ))}
            </linearGradient>
            <clipPath id={LAND_CLIP_ID}>
              <use href={`#${LAND_ID}`} />
            </clipPath>
          </defs>
          <path
            id={LAND_ID}
            d={LAND_PATH}
            fill={EMPTY_COUNTRY_COLOR}
            {...COUNTRY_BORDER}
          />
          <g clipPath={`url(#${LAND_CLIP_ID})`}>
            <rect
              width={WORLD_MAP.width}
              height={WORLD_MAP.height}
              fill={`url(#${SHIMMER_ID})`}
              className="animate-shimmer motion-reduce:hidden"
            />
          </g>
        </svg>
      }
      footer={
        <>
          <LegendSkeleton />
          <TimelineSkeleton />
        </>
      }
    />
  );
}
