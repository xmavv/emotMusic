"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { Artist, SongEmotion } from "@/services/supabase/supabaseTables";
import { Scatterplot } from "@/app/components/scatterplot";
import { EmotionScoreBar } from "@/app/components/song-emotion-scores";
import { SongDetailsModal } from "@/app/components/song-details-modal";
import { dateFormat, dominantEmotions, getDominantEmotion, scoreFormat } from "@/app/components/song-emotions";
import { euclideanDistance } from "@/lib/pacmap";
import { getSongDate, getSongGenres } from "@/lib/songs";
import {
  featureSpaces,
  getFeatureVector,
  projectionMethods,
  type EmotionKey,
  type FeatureSpace,
  type ProjectedPoint,
  type ProjectionMethod,
  type SongProjections,
} from "./projection-options";

type ProjectionPoint = ProjectedPoint & {
  color?: string;
  song: SongEmotion;
  credit: string;
  dominant?: ReturnType<typeof getDominantEmotion>;
};

const panelClass = "mx-auto max-w-6xl rounded-2xl border border-[#49364f] bg-[#100d14] p-[clamp(0.9rem,3vw,2rem)]";
const toggleClass =
  "rounded-[0.4rem] border border-[#49364f] bg-[#191420] px-[0.65rem] py-[0.3rem] text-[#faf7fb] " +
  "inline-flex cursor-pointer items-center gap-[0.4rem] hover:border-[color:var(--swatch)] " +
  "aria-pressed:border-[color:var(--swatch)] aria-pressed:bg-[color-mix(in_srgb,var(--swatch)_18%,#191420)]";
const fieldClass =
  "w-full rounded-[0.4rem] border border-[#6c5573] bg-[#191420] px-[0.65rem] py-[0.35rem] text-[#faf7fb]";
const accentColor = "#d596f1";
const tickFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });
const distanceFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 3 });
const similarSongCount = 10;

export function ProjectionMap({
  songs,
  artists,
  projections,
}: {
  songs: SongEmotion[];
  artists: Artist[];
  projections: SongProjections;
}) {
  const [method, setMethod] = useState<ProjectionMethod>("pacmap");
  const [space, setSpace] = useState<FeatureSpace>("plutchik");
  const [genre, setGenre] = useState("");
  const [query, setQuery] = useState("");
  const [fromYear, setFromYear] = useState<number>();
  const [toYear, setToYear] = useState<number>();
  const [hiddenEmotions, setHiddenEmotions] = useState<ReadonlySet<string>>(new Set());
  const [trackedId, setTrackedId] = useState<number>();
  const [onlySimilar, setOnlySimilar] = useState(false);
  const songsById = useMemo(() => indexById(songs), [songs]);
  const artistsById = useMemo(() => indexById(artists), [artists]);
  const genres = useMemo(() => getGenres(songs), [songs]);
  const years = useMemo(() => getReleaseYears(songs), [songs]);

  const methodLabel = projectionMethods.find(([key]) => key === method)?.[1];
  const [, spaceLabel, features] = featureSpaces.find(([key]) => key === space) ?? featureSpaces[0];
  const projected = projections[space][method];
  const axisTicks = useMemo(() => getAxisTicks(projected), [projected]);

  const getArtist = (song: SongEmotion) => (song.artistId == null ? undefined : artistsById.get(song.artistId));
  const trackedSong = trackedId === undefined ? undefined : songsById.get(trackedId);
  const trackedArtist = trackedSong && getArtist(trackedSong);
  const trackedCredit = trackedSong ? formatSongCredit(trackedSong, trackedArtist) : "";
  const trackedDominant = getDominantEmotion(trackedSong?.SongsEmotions);
  const similarSongs = trackedSong ? findSimilarSongs(trackedSong, songs, features) : [];
  const similarIds =
    onlySimilar && trackedId !== undefined ? new Set([trackedId, ...similarSongs.map(({ id }) => id)]) : null;

  const queryText = query.trim().toLocaleLowerCase("pl");
  const isSongVisible = (song: SongEmotion) => {
    const year = new Date(getSongDate(song)).getUTCFullYear();
    const hasYear = Number.isFinite(year);
    const searchable = `${song.name ?? ""} ${getArtist(song)?.artist ?? ""}`.toLocaleLowerCase("pl");
    const dominant = getDominantEmotion(song.SongsEmotions);

    return (
      searchable.includes(queryText) &&
      (!genre || getSongGenres(song).includes(genre)) &&
      (fromYear === undefined || (hasYear && year >= fromYear)) &&
      (toYear === undefined || (hasYear && year <= toYear)) &&
      !(dominant && hiddenEmotions.has(dominant.label))
    );
  };

  const points: ProjectionPoint[] = [];
  for (const point of projected) {
    const song = songsById.get(point.id);
    if (!song || !isSongVisible(song) || (similarIds && !similarIds.has(point.id))) continue;

    const dominant = getDominantEmotion(song.SongsEmotions);
    points.push({ ...point, color: dominant?.color, song, credit: formatSongCredit(song, getArtist(song)), dominant });
  }

  function toggleEmotion(label: string) {
    const next = new Set(hiddenEmotions);
    if (!next.delete(label)) next.add(label);
    setHiddenEmotions(next);
  }

  function stopTracking() {
    setTrackedId(undefined);
    setOnlySimilar(false);
  }

  return (
    <section
      className={panelClass}
      style={{ "--accent": trackedDominant?.color ?? accentColor } as CSSProperties}
      aria-label="Mapa podobieństwa utworów"
    >
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <fieldset className="min-w-0">
          <legend className="text-[1.05rem] text-[#dfcedf]">Metoda redukcji wymiarów</legend>
          <div className="mt-[0.35rem] flex flex-wrap gap-[0.4rem]">
            {projectionMethods.map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={toggleClass}
                style={{ "--swatch": accentColor } as CSSProperties}
                aria-pressed={method === key}
                onClick={() => setMethod(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="min-w-0">
          <legend className="text-[1.05rem] text-[#dfcedf]">Przestrzeń cech</legend>
          <div className="mt-[0.35rem] flex flex-wrap gap-[0.4rem]">
            {featureSpaces.map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={toggleClass}
                style={{ "--swatch": accentColor } as CSSProperties}
                aria-pressed={space === key}
                onClick={() => setSpace(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-[0.55rem]">
        <label className="grid min-w-0 flex-[1_1_10rem] gap-1 text-[#dfcedf]">
          Gatunek
          <select className={fieldClass} value={genre} onChange={(event) => setGenre(event.currentTarget.value)}>
            <option value="">Wszystkie gatunki</option>
            {genres.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 flex-[2_1_14rem] gap-1 text-[#dfcedf]">
          Tytuł lub wykonawca
          <input
            className={fieldClass}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </label>
        <label className="grid min-w-0 flex-[1_1_7rem] gap-1 text-[#dfcedf]">
          Rok od
          <select
            className={fieldClass}
            value={fromYear ?? ""}
            onChange={(event) => setFromYear(parseYear(event.currentTarget.value))}
          >
            <option value="">Dowolny</option>
            {years.map((year) => (
              <option key={year} value={year} disabled={toYear !== undefined && year > toYear}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 flex-[1_1_7rem] gap-1 text-[#dfcedf]">
          Rok do
          <select
            className={fieldClass}
            value={toYear ?? ""}
            onChange={(event) => setToYear(parseYear(event.currentTarget.value))}
          >
            <option value="">Dowolny</option>
            {years.map((year) => (
              <option key={year} value={year} disabled={fromYear !== undefined && year < fromYear}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="mt-4 min-w-0">
        <legend className="text-[1.05rem] text-[#dfcedf]">Dominująca emocja (kliknij, aby ukryć lub pokazać)</legend>
        <div className="mt-[0.35rem] flex flex-wrap gap-[0.4rem]">
          {dominantEmotions.map(([key, label, color]) => (
            <button
              type="button"
              key={key}
              className={toggleClass + " before:size-[0.45rem] before:rounded-full before:bg-[color:var(--swatch)]"}
              style={{ "--swatch": color } as CSSProperties}
              aria-pressed={!hiddenEmotions.has(label)}
              onClick={() => toggleEmotion(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div
        className={
          "mt-[1.65rem] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t " +
          "border-[#322638] pt-[0.9rem] text-[#cdbed0]"
        }
      >
        <h2 className="text-[1.9rem] font-normal text-[#f5a4ed]">
          {methodLabel} · {spaceLabel}
        </h2>
        <span role="status">
          Liczba utworów: {points.length} z {projected.length}
        </span>
      </div>
      <Scatterplot
        color={accentColor}
        xAxis={{
          label: `${methodLabel} 1`,
          ticks: similarIds ? undefined : axisTicks.x,
          formatTick: (value) => tickFormat.format(value),
        }}
        yAxis={{
          label: `${methodLabel} 2`,
          ticks: similarIds ? undefined : axisTicks.y,
          formatTick: (value) => tickFormat.format(value),
        }}
        points={points}
        label={`Mapa ${methodLabel}: ${spaceLabel}`}
        selectedId={trackedId}
        onPointSelect={(point) => setTrackedId(point.id)}
        emptyMessage="Brak utworów dla tego wyboru."
        renderPointDetails={(point) =>
          point ? (
            <>
              <strong>{point.song.name || "Utwór bez tytułu"}</strong>
              {point.credit && <span>{point.credit}</span>}
              {point.dominant && (
                <span style={{ color: point.dominant.color }}>
                  {point.dominant.label}: {scoreFormat.format(point.dominant.score)}
                </span>
              )}
            </>
          ) : (
            "Kliknij punkt, aby przypiąć utwór i zobaczyć utwory o najbardziej podobnym profilu emocji."
          )
        }
      />

      {trackedSong && (
        <div
          className={
            "flex flex-wrap items-center gap-x-[0.85rem] gap-y-1 mt-[0.55rem] justify-between " +
            "rounded-[0.4rem] border border-[color:var(--accent)] bg-[#191420] px-3 py-[0.55rem]"
          }
        >
          <p className="flex flex-wrap items-center gap-x-[0.85rem] gap-y-1" aria-live="polite">
            Śledzony utwór{" "}
            <strong className="text-[color:var(--accent)]">{trackedSong.name || "Utwór bez tytułu"}</strong>
            {trackedCredit && <span>{trackedCredit}</span>}
            {Number.isFinite(getSongDate(trackedSong)) && <span>{dateFormat.format(getSongDate(trackedSong))}</span>}
            <span>
              {!isSongVisible(trackedSong)
                ? "Ukryty przez filtry"
                : trackedDominant
                  ? `${trackedDominant.label}: ${scoreFormat.format(trackedDominant.score)}`
                  : "Brak wyników emocji"}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-[0.85rem] gap-y-1">
            <SongDetailsModal song={trackedSong} artist={trackedArtist} />
            <button
              type="button"
              className={
                "cursor-pointer rounded-[0.4rem] border border-[#716078] px-[0.6rem] py-1 " +
                "hover:border-[color:var(--accent)]"
              }
              onClick={stopTracking}
            >
              Zakończ śledzenie
            </button>
          </div>
        </div>
      )}

      {trackedSong && (
        <section className="mt-[1.15rem] border-t border-[#49364f] pt-[0.85rem]" aria-label="Podobne utwory">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="text-[1.65rem] text-[#f5a4ed]">Najbardziej podobne utwory</h2>
            {similarSongs.length > 0 && (
              <label className="flex items-center gap-2 text-[#dfcedf]">
                <input
                  type="checkbox"
                  className="accent-[#d596f1]"
                  checked={onlySimilar}
                  onChange={(event) => setOnlySimilar(event.currentTarget.checked)}
                />
                Pokaż na mapie tylko ten utwór i podobne
              </label>
            )}
          </div>
          {similarSongs.length === 0 ? (
            <p className="mt-[0.4rem]">Brak pełnego wektora emocji dla tego utworu w wybranej przestrzeni.</p>
          ) : (
            <ol className="mt-[0.4rem]">
              {similarSongs.map(({ id, distance }) => {
                const song = songsById.get(id);
                if (!song) return null;
                const credit = formatSongCredit(song, getArtist(song));
                const dominant = getDominantEmotion(song.SongsEmotions);

                return (
                  <li
                    key={id}
                    className={
                      "grid grid-cols-[minmax(0,1fr)_minmax(7rem,30%)_6rem] items-center gap-x-4 gap-y-2 " +
                      "border-t border-[#382a40] py-[0.35rem]"
                    }
                  >
                    <div className="min-w-0 wrap-anywhere">
                      <button
                        type="button"
                        className={
                          "cursor-pointer rounded-[0.4rem] border border-[#a47bb6] bg-[#211529] px-[0.6rem] py-1 " +
                          "text-left text-[#faf7fb] hover:border-[#f4a6f0] focus-visible:border-[#f4a6f0]"
                        }
                        onClick={() => setTrackedId(id)}
                      >
                        {song.name || "Utwór bez tytułu"}
                      </button>
                      {credit && <p className="mt-[0.2rem] text-[#cdbed0]">{credit}</p>}
                    </div>
                    <div>
                      {dominant && (
                        <>
                          <span>{dominant.label}</span>
                          <EmotionScoreBar score={dominant.score} color={dominant.color} />
                        </>
                      )}
                    </div>
                    <span className="text-right tabular-nums text-[#cdbed0]">
                      odl. {distanceFormat.format(distance)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}

      <p className="mt-[0.8rem] text-[#cdbed0]">
        Każdy punkt to utwór. {methodLabel} rzutuje wektor natężeń emocji ({spaceLabel}) na płaszczyznę tak, aby utwory
        o podobnym profilu emocjonalnym leżały blisko siebie. Osie nie mają interpretacji, a filtry jedynie ukrywają
        punkty, nie zmieniając ich położenia. Podobne utwory to najbliżsi sąsiedzi w oryginalnej przestrzeni emocji
        (odległość euklidesowa).
      </p>
    </section>
  );
}

function indexById<Item extends { id: number }>(items: readonly Item[]) {
  const index = new Map<number, Item>();

  for (const item of items) {
    index.set(item.id, item);
  }

  return index;
}

function getGenres(songs: readonly SongEmotion[]) {
  const uniqueGenres = new Set<string>();

  for (const song of songs) {
    for (const genre of getSongGenres(song)) {
      uniqueGenres.add(genre);
    }
  }

  const genres = [...uniqueGenres];
  genres.sort((a, b) => a.localeCompare(b, "pl"));

  return genres;
}

function getReleaseYears(songs: readonly SongEmotion[]) {
  const uniqueYears = new Set<number>();

  for (const song of songs) {
    const year = new Date(getSongDate(song)).getUTCFullYear();
    if (Number.isFinite(year)) {
      uniqueYears.add(year);
    }
  }

  const years = [...uniqueYears];
  years.sort((a, b) => a - b);

  return years;
}

function findSimilarSongs(target: SongEmotion, songs: readonly SongEmotion[], features: readonly EmotionKey[]) {
  const vector = getFeatureVector(target, features);
  if (!vector) return [];

  const similar: { id: number; distance: number }[] = [];
  for (const song of songs) {
    const other = song.id === target.id ? undefined : getFeatureVector(song, features);
    if (other) {
      similar.push({ id: song.id, distance: euclideanDistance(vector, other) });
    }
  }
  similar.sort((a, b) => a.distance - b.distance);

  return similar.slice(0, similarSongCount);
}

function parseYear(value: string) {
  return value === "" ? undefined : Number(value);
}

function getAxisTicks(points: readonly ProjectedPoint[]) {
  return {
    x: getEvenTicks(points.map(({ x }) => x)),
    y: getEvenTicks(points.map(({ y }) => y)),
  };
}

function getEvenTicks(values: readonly number[]) {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (min > max) return undefined;

  return Array.from({ length: 5 }, (_, index) => min + ((max - min) * index) / 4);
}

function formatSongCredit(song: SongEmotion, artist?: Artist) {
  const credit: (string | number)[] = [];
  const artistName = artist?.artist?.trim();
  if (artistName) {
    credit.push(artistName);
  }

  const releaseYear = new Date(getSongDate(song)).getUTCFullYear();
  if (Number.isFinite(releaseYear)) {
    credit.push(releaseYear);
  }

  return credit.join(" · ");
}
