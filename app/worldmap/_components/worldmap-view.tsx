"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Timeline } from "@/components/timeline/timeline";
import { WorldmapLayout } from "@/app/worldmap/_components/worldmap-layout";
import { Worldmap } from "@/app/worldmap/_components/map/worldmap";
import { CountryPanel } from "@/app/worldmap/_components/panel/country-panel";
import { useGenreStats } from "@/app/worldmap/_hooks/use-genre-stats";
import { findGenreGroup } from "@/utils/genres";
import { MapControls } from "@/app/worldmap/_components/controls/map-controls";
import { MapLegend } from "@/app/worldmap/_components/map/map-legend";
import { SimilarityDetails } from "@/app/worldmap/_components/panel/similarity-details";
import { StrongestDetails } from "@/app/worldmap/_components/panel/strongest-details";
import {
  countriesBySimilarity,
  similarityToRest,
  type ColorMode,
} from "@/app/worldmap/_lib/similarity";
import { allTimeStats, worldStats } from "@/app/worldmap/_lib/merge-stats";
import type { EmotionThresholds } from "@/app/worldmap/_lib/emotion-thresholds";
import type { MapGeometry } from "@/app/worldmap/_data/world-shapes";
import type { StatsByCountry, StatsByYear } from "@/app/worldmap/_data/stats";
import { PLUTCHIK_EMOTIONS, type PlutchikEmotion } from "@/utils/plutchik";

const NO_STATS: StatsByCountry = {};

interface WorldmapViewProps {
  geometry: MapGeometry;
  allGenresStats: StatsByYear;
  thresholds: EmotionThresholds;
  minYear: number;
  maxYear: number;
}

export function WorldmapView({
  geometry,
  allGenresStats,
  thresholds,
  minYear,
  maxYear,
}: WorldmapViewProps) {
  const [year, setYear] = useState(maxYear);
  const [isAllTime, setIsAllTime] = useState(false);
  const [active, setActive] = useState(PLUTCHIK_EMOTIONS);
  const [colorMode, setColorMode] = useState<ColorMode>("strongest");
  const { genre, statsByYear, requestedGenre, isLoading, failed, selectGenre } =
    useGenreStats(allGenresStats);
  const statsAllTime = useMemo(() => allTimeStats(statsByYear), [statsByYear]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const closeCountry = useCallback(() => setSelectedCode(null), []);

  const onMapClick = useCallback(
    (code: string | null) => {
      const isOcean = code === null;
      setSelectedCode((current) => {
        if (code === current) return null;
        return isOcean || code in statsAllTime ? code : current;
      });
    },
    [statsAllTime],
  );

  useEffect(() => {
    if (!selectedCode) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      const isInOpenList = ev.target instanceof HTMLOptionElement;
      if (ev.key === "Escape" && !isInOpenList) closeCountry();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCode, closeCountry]);

  const shownYear = isAllTime ? null : year;
  const periodStats = isAllTime
    ? statsAllTime
    : (statsByYear[year] ?? NO_STATS);
  const world = useMemo(() => worldStats(periodStats), [periodStats]);
  const isSimilarity = colorMode === "similarity";
  const shownEmotions = isSimilarity ? PLUTCHIK_EMOTIONS : active;
  const similarities = useMemo(
    () => (isSimilarity && world ? similarityToRest(periodStats, world) : null),
    [isSimilarity, periodStats, world],
  );
  const shapesByCode = useMemo(
    () => new Map(geometry.shapes.map((shape) => [shape.code, shape])),
    [geometry],
  );
  const selectedShape = selectedCode
    ? shapesByCode.get(selectedCode)
    : undefined;
  const selectedStats = selectedCode ? periodStats[selectedCode] : undefined;

  const namedCountriesBySimilarity = (code: string) =>
    countriesBySimilarity(periodStats, code).flatMap((similar) => {
      const shape = shapesByCode.get(similar.code);
      return shape ? [{ ...similar, name: shape.name }] : [];
    });

  const toggle = (emotion: PlutchikEmotion) =>
    setActive((current) =>
      PLUTCHIK_EMOTIONS.filter((option) =>
        option === emotion
          ? !current.includes(option)
          : current.includes(option),
      ),
    );

  return (
    <WorldmapLayout
      controls={
        <MapControls
          colorMode={colorMode}
          onColorModeChange={setColorMode}
          genre={requestedGenre}
          isLoading={isLoading}
          failed={failed}
          onGenreChange={selectGenre}
        />
      }
      map={
        <>
          <Worldmap
            geometry={geometry}
            stats={periodStats}
            clickableStats={statsAllTime}
            thresholds={thresholds}
            similarities={similarities}
            active={shownEmotions}
            selectedShape={selectedShape}
            onMapClick={onMapClick}
          />
          {selectedCode && selectedShape && (
            <CountryPanel
              key={selectedCode}
              name={selectedShape.name}
              year={shownYear}
              genreLabel={findGenreGroup(genre)?.label}
              songCount={selectedStats?.songCount ?? 0}
              onClose={closeCountry}
            >
              {selectedStats &&
                world &&
                (isSimilarity ? (
                  <SimilarityDetails
                    stats={selectedStats}
                    world={world}
                    mostSimilarFirst={namedCountriesBySimilarity(selectedCode)}
                    onCountrySelect={setSelectedCode}
                  />
                ) : (
                  <StrongestDetails
                    code={selectedCode}
                    year={shownYear}
                    genre={genre}
                    stats={selectedStats}
                    world={world}
                    active={active}
                  />
                ))}
            </CountryPanel>
          )}
        </>
      }
      footer={
        <>
          <MapLegend
            isSimilarity={isSimilarity}
            active={active}
            onToggle={toggle}
          />
          <Timeline
            minYear={minYear}
            maxYear={maxYear}
            year={year}
            onYearChange={setYear}
            isAllTime={isAllTime}
            onAllTimeChange={setIsAllTime}
          />
        </>
      }
    />
  );
}
