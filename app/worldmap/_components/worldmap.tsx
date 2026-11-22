"use client";

import { Fragment, memo } from "react";
import { FewSongsPattern } from "@/app/worldmap/_components/few-songs-pattern";
import { ZoomableMap } from "@/app/worldmap/_components/zoomable-map";
import {
  COUNTRY_BORDER,
  EMPTY_COUNTRY_COLOR,
  FEW_SONGS_LIMIT,
  FEW_SONGS_PATTERN_ID,
} from "@/app/worldmap/_constants/map";
import type {
  CountryYearStats,
  StatsByCountry,
} from "@/app/worldmap/_data/stats";
import type {
  CountryShape,
  MapGeometry,
} from "@/app/worldmap/_data/world-shapes";
import type { EmotionThresholds } from "@/app/worldmap/_lib/emotion-thresholds";
import { countryColor } from "@/app/worldmap/_lib/country-color";
import {
  similarityColor,
  type Similarities,
} from "@/app/worldmap/_lib/similarity";
import type { PlutchikEmotion } from "@/utils/plutchik";

export interface MapHover {
  code: string | null;
  name: string;
  x: number;
  y: number;
  mapWidth: number;
}

interface WorldmapProps {
  geometry: MapGeometry;
  stats: StatsByCountry;
  clickableStats: StatsByCountry;
  thresholds: EmotionThresholds;
  similarities: Similarities | null;
  active: PlutchikEmotion[];
  selectedShape: CountryShape | undefined;
  onHover: (hover: MapHover | null) => void;
  onMapClick: (code: string | null) => void;
}

export const Worldmap = memo(function Worldmap({
  geometry: { shapes, width, height },
  stats,
  clickableStats,
  thresholds,
  similarities,
  active,
  selectedShape,
  onHover,
  onMapClick,
}: WorldmapProps) {
  const colorOf = (code: string, { averageEmotions }: CountryYearStats) => {
    if (!similarities) return countryColor(averageEmotions, active, thresholds);
    return code in similarities ? similarityColor(similarities[code]) : null;
  };

  return (
    <ZoomableMap
      width={width}
      height={height}
      focus={selectedShape?.bounds ?? null}
      onMapClick={onMapClick}
    >
      <FewSongsPattern />
      {shapes.map((shape, i) => {
        const countryStats = shape.code ? stats[shape.code] : undefined;
        const color =
          shape.code && countryStats ? colorOf(shape.code, countryStats) : null;
        const hasFewSongs =
          color !== null &&
          countryStats !== undefined &&
          countryStats.songCount < FEW_SONGS_LIMIT;
        const isClickable = shape.code !== null && shape.code in clickableStats;
        const isDimmed = selectedShape !== undefined && shape !== selectedShape;

        return (
          <Fragment key={shape.code ?? `x${i}`}>
            <path
              d={shape.d}
              data-code={shape.code ?? ""}
              {...COUNTRY_BORDER}
              fill={color ?? EMPTY_COUNTRY_COLOR}
              className={`transition-[fill,opacity] duration-300 ${color ? "hover:brightness-125" : ""} ${isClickable ? "cursor-pointer" : ""} ${isDimmed ? "opacity-30" : ""}`}
              onMouseMove={(ev) => {
                const box =
                  ev.currentTarget.ownerSVGElement!.parentElement!.getBoundingClientRect();
                onHover({
                  code: shape.code,
                  name: shape.name,
                  x: ev.clientX - box.left,
                  y: ev.clientY - box.top,
                  mapWidth: box.width,
                });
              }}
              onMouseLeave={() => onHover(null)}
            />
            {hasFewSongs && (
              <path
                d={shape.d}
                fill={`url(#${FEW_SONGS_PATTERN_ID})`}
                className={`pointer-events-none transition-opacity duration-300 ${isDimmed ? "opacity-30" : ""}`}
              />
            )}
          </Fragment>
        );
      })}
    </ZoomableMap>
  );
});
