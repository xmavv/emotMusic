"use client";

import { useState } from "react";
import { Legend } from "@/components/legend/legend";
import { Timeline } from "@/components/timeline/timeline";
import { WorldmapLayout } from "@/app/worldmap/_components/worldmap-layout";
import { Worldmap, type MapHover } from "@/app/worldmap/_components/worldmap";
import { CountryTooltip } from "@/app/worldmap/_components/country-tooltip";
import { countryColor } from "@/app/worldmap/_lib/country-color";
import type { MapGeometry } from "@/app/worldmap/_data/world-shapes";
import type { StatsByYear } from "@/app/worldmap/_data/stats";
import { PLUTCHIK_EMOTIONS, type PlutchikEmotion } from "@/utils/plutchik";

interface WorldmapViewProps {
  geometry: MapGeometry;
  statsByYear: StatsByYear;
  minYear: number;
  maxYear: number;
}

export function WorldmapView({
  geometry,
  statsByYear,
  minYear,
  maxYear,
}: WorldmapViewProps) {
  const [year, setYear] = useState(maxYear);
  const [active, setActive] = useState<PlutchikEmotion[]>([
    ...PLUTCHIK_EMOTIONS,
  ]);
  const [hover, setHover] = useState<MapHover | null>(null);

  const statsThisYear = (code: string | null | undefined) =>
    code ? statsByYear[year]?.[code] : undefined;
  const hoveredStats = statsThisYear(hover?.code);

  const toggle = (emotion: PlutchikEmotion) =>
    setActive((current) =>
      current.includes(emotion)
        ? current.filter((activeEmotion) => activeEmotion !== emotion)
        : PLUTCHIK_EMOTIONS.filter(
            (option) => option === emotion || current.includes(option),
          ),
    );

  return (
    <WorldmapLayout
      onMapMouseLeave={() => setHover(null)}
      map={
        <>
          <Worldmap
            geometry={geometry}
            colorOf={(code) => {
              const stats = statsThisYear(code);
              return stats ? countryColor(stats.averageEmotions, active) : null;
            }}
            onHover={setHover}
          />
          {hover && hoveredStats && (
            <CountryTooltip
              hover={hover}
              stats={hoveredStats}
              active={active}
            />
          )}
        </>
      }
      footer={
        <>
          <Legend active={active} onToggle={toggle} />
          <Timeline
            minYear={minYear}
            maxYear={maxYear}
            year={year}
            onYearChange={setYear}
          />
        </>
      }
    />
  );
}
