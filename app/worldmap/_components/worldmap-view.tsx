"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Legend } from "@/components/legend/legend";
import { AllTimeToggle } from "@/components/timeline/all-time-toggle";
import { Timeline } from "@/components/timeline/timeline";
import { WorldmapLayout } from "@/app/worldmap/_components/worldmap-layout";
import { Worldmap, type MapHover } from "@/app/worldmap/_components/worldmap";
import { CountryTooltip } from "@/app/worldmap/_components/country-tooltip";
import { CountryPanel } from "@/app/worldmap/_components/country-panel";
import { FewSongsKey } from "@/app/worldmap/_components/few-songs-key";
import { GenreSelect } from "@/app/worldmap/_components/genre-select";
import { useGenreStats } from "@/app/worldmap/_hooks/use-genre-stats";
import { findGenreGroup } from "@/utils/genres";
import { MapControls } from "@/app/worldmap/_components/map-controls";
import { SimilarityScale } from "@/app/worldmap/_components/similarity-scale";
import { SimilarityDetails } from "@/app/worldmap/_components/similarity-details";
import { StrongestDetails } from "@/app/worldmap/_components/strongest-details";
import {
  mostSimilarCountries,
  similarityToRest,
  type ColorMode,
} from "@/app/worldmap/_lib/similarity";
import { allTimeStats, worldStats } from "@/app/worldmap/_lib/merge-stats";
import type { EmotionThresholds } from "@/app/worldmap/_lib/emotion-thresholds";
import type { MapGeometry } from "@/app/worldmap/_data/world-shapes";
import type { StatsByCountry, StatsByYear } from "@/app/worldmap/_data/stats";
import { PLUTCHIK_EMOTIONS, type PlutchikEmotion } from "@/utils/plutchik";

const NO_STATS: StatsByCountry = {};
const MOST_SIMILAR_COUNT = 5;

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
  const [active, setActive] = useState<PlutchikEmotion[]>([
    ...PLUTCHIK_EMOTIONS,
  ]);
  const [colorMode, setColorMode] = useState<ColorMode>("strongest");
  const [hover, setHover] = useState<MapHover | null>(null);
  const { genre, statsByYear, requestedGenre, isLoading, failed, selectGenre } =
    useGenreStats(allGenresStats);
  const statsAllTime = useMemo(() => allTimeStats(statsByYear), [statsByYear]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const leaveAllTime = useCallback(() => setIsAllTime(false), []);
  const closeCountry = useCallback(() => setSelectedCode(null), []);

  const onMapClick = useCallback(
    (code: string | null) => {
      const isOcean = code === null;
      setHover(null);
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

  const periodStats = isAllTime
    ? statsAllTime
    : (statsByYear[year] ?? NO_STATS);
  const world = useMemo(() => worldStats(periodStats), [periodStats]);
  const isSimilarity = colorMode === "similarity";
  const shownEmotions = isSimilarity ? PLUTCHIK_EMOTIONS : active;
  const similarities = useMemo(
    () => (isSimilarity ? similarityToRest(periodStats) : null),
    [isSimilarity, periodStats],
  );
  const hoveredStats = hover?.code ? periodStats[hover.code] : undefined;
  const selectedShape = selectedCode
    ? geometry.shapes.find(({ code }) => code === selectedCode)
    : undefined;

  const selectedStats = selectedCode ? periodStats[selectedCode] : undefined;

  const mostSimilarTo = (code: string) =>
    mostSimilarCountries(periodStats, code)
      .flatMap((similar) => {
        const shape = geometry.shapes.find(({ code }) => code === similar.code);
        return shape ? [{ ...similar, name: shape.name }] : [];
      })
      .slice(0, MOST_SIMILAR_COUNT);

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
      controls={
        <>
          <MapControls colorMode={colorMode} onColorModeChange={setColorMode} />
          <GenreSelect
            genre={requestedGenre}
            isLoading={isLoading}
            failed={failed}
            onGenreChange={selectGenre}
          />
        </>
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
            onHover={setHover}
          />
          {selectedCode && selectedShape && (
            <CountryPanel
              key={selectedCode}
              name={selectedShape.name}
              year={isAllTime ? null : year}
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
                    mostSimilar={mostSimilarTo(selectedCode)}
                    onCountrySelect={setSelectedCode}
                  />
                ) : (
                  <StrongestDetails
                    code={selectedCode}
                    year={isAllTime ? null : year}
                    genre={genre}
                    stats={selectedStats}
                    world={world}
                    active={active}
                  />
                ))}
            </CountryPanel>
          )}
          {hover && hoveredStats && hover.code !== selectedCode && (
            <CountryTooltip
              hover={hover}
              stats={hoveredStats}
              similarity={hover.code ? similarities?.[hover.code] : undefined}
              active={shownEmotions}
            />
          )}
        </>
      }
      footer={
        <>
          <div className="grid *:[grid-area:1/1]">
            <div className={isSimilarity ? "invisible" : undefined}>
              <Legend active={active} onToggle={toggle}>
                <FewSongsKey />
              </Legend>
            </div>
            {isSimilarity && <SimilarityScale />}
          </div>
          <div className="relative">
            <Timeline
              minYear={minYear}
              maxYear={maxYear}
              year={year}
              onYearChange={setYear}
              muted={isAllTime}
              onInteract={leaveAllTime}
            />
            <AllTimeToggle
              isAllTime={isAllTime}
              onToggle={() => setIsAllTime((current) => !current)}
            />
          </div>
        </>
      }
    />
  );
}
