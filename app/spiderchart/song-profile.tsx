"use client";

import { useMemo, useState } from "react";
import type { Artist, SongEmotion } from "@/services/supabase/tables";
import { DetailSections } from "@/components/details-modal/details-modal";
import {
  EmotionRadar,
  type RadarSeries,
} from "@/components/song/emotion-radar";
import {
  getSongDetailSections,
  songRadarColor,
} from "@/components/song/song-details-modal";
import { SongEmotionScores } from "@/components/song/song-emotion-scores";
import {
  emotions,
  getDominantEmotion,
  type EmotionScores,
} from "@/components/song/song-emotions";
import { getSongDate, getSongGenres } from "@/utils/songs";

const panelClass =
  "mx-auto max-w-6xl rounded-2xl border border-[#49364f] bg-[#100d14] p-[clamp(0.9rem,3vw,2rem)]";
const fieldClass =
  "w-full rounded-[0.4rem] border border-[#6c5573] bg-[#191420] px-[0.65rem] py-[0.35rem] text-[#faf7fb]";
const buttonClass =
  "cursor-pointer rounded-[0.4rem] border border-[#a47bb6] bg-[#211529] px-[0.6rem] py-1 text-left " +
  "text-[#faf7fb] hover:border-[#f4a6f0] focus-visible:border-[#f4a6f0]";
const comparisonColor = "#d5ccd9";
const maxResults = 8;

export function SongProfile({
  songs,
  artists,
  initialSongId,
}: {
  songs: SongEmotion[];
  artists: Artist[];
  initialSongId?: number;
}) {
  const [selectedId, setSelectedId] = useState(initialSongId);
  const [comparison, setComparison] = useState("none");
  const [compareSongId, setCompareSongId] = useState<number>();
  const [query, setQuery] = useState("");
  const songsById = useMemo(() => indexById(songs), [songs]);
  const artistsById = useMemo(() => indexById(artists), [artists]);
  const overallAverage = useMemo(() => averageScores(songs), [songs]);

  const getArtist = (song: SongEmotion) =>
    song.artistId == null ? undefined : artistsById.get(song.artistId);
  const song = selectedId === undefined ? undefined : songsById.get(selectedId);
  const artist = song && getArtist(song);
  const genres = song ? getSongGenres(song) : [];
  const compareSong =
    compareSongId === undefined ? undefined : songsById.get(compareSongId);
  const results = findSongs(songs, query, getArtist);

  const comparisonSeries = getComparisonSeries();
  const title = song?.name || "Utwór bez tytułu";
  const series: RadarSeries[] = song?.SongsEmotions
    ? [
        { label: title, color: songRadarColor, scores: song.SongsEmotions },
        ...(comparisonSeries ? [comparisonSeries] : []),
      ]
    : [];
  const dominant = getDominantEmotion(song?.SongsEmotions);

  function getComparisonSeries(): RadarSeries | undefined {
    if (comparison === "all") {
      return {
        label: "Średnia wszystkich utworów",
        color: comparisonColor,
        scores: overallAverage,
        dashed: true,
      };
    }
    if (comparison.startsWith("genre:")) {
      const genre = comparison.slice("genre:".length);
      if (!genres.includes(genre)) return undefined;

      const scores = averageScores(
        songs.filter((other) => getSongGenres(other).includes(genre)),
      );
      return {
        label: `Średnia gatunku: ${genre}`,
        color: comparisonColor,
        scores,
        dashed: true,
      };
    }
    if (
      comparison === "song" &&
      compareSong?.SongsEmotions &&
      compareSong.id !== song?.id
    ) {
      return {
        label: compareSong.name || "Utwór bez tytułu",
        color: comparisonColor,
        scores: compareSong.SongsEmotions,
        dashed: true,
      };
    }

    return undefined;
  }

  function selectSong(id: number) {
    setSelectedId(id);
    setQuery("");
    window.history.replaceState(null, "", `/spiderchart/${id}`);
  }

  function compareWith(id: number) {
    setCompareSongId(id);
    setComparison("song");
    setQuery("");
  }

  function selectRandomSong() {
    const candidates = songs.filter(
      (other) => other.SongsEmotions && other.id !== selectedId,
    );
    const random = candidates[Math.floor(Math.random() * candidates.length)];
    if (random) selectSong(random.id);
  }

  return (
    <section className={panelClass} aria-label="Profil emocjonalny utworu">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-[0.55rem]">
        <label className="grid min-w-0 flex-[1_1_20rem] gap-1 text-[#dfcedf]">
          Wyszukaj utwór (tytuł lub wykonawca)
          <input
            className={fieldClass}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </label>
        <button
          type="button"
          className={buttonClass}
          onClick={selectRandomSong}
        >
          Losowy utwór
        </button>
      </div>

      {query.trim() && (
        <ul className="mt-[0.6rem]" aria-label="Wyniki wyszukiwania">
          {results.length === 0 && (
            <li className="py-[0.35rem] text-[#cdbed0]">
              Brak pasujących utworów.
            </li>
          )}
          {results.map((result) => {
            const credit = formatSongCredit(result, getArtist(result));

            return (
              <li
                key={result.id}
                className={
                  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#382a40] " +
                  "py-[0.35rem]"
                }
              >
                <div className="min-w-0 wrap-anywhere">
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => selectSong(result.id)}
                  >
                    {result.name || "Utwór bez tytułu"}
                  </button>
                  {credit && (
                    <p className="mt-[0.2rem] text-[#cdbed0]">{credit}</p>
                  )}
                </div>
                {song && result.id !== song.id && (
                  <button
                    type="button"
                    className={
                      "cursor-pointer rounded-[0.4rem] border border-[#716078] px-[0.6rem] py-1 " +
                      "hover:border-[#d5ccd9]"
                    }
                    onClick={() => compareWith(result.id)}
                  >
                    Porównaj
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!song ? (
        <p className="mt-[1.15rem] border-t border-[#49364f] pt-[0.85rem]">
          {selectedId === undefined
            ? "Wyszukaj utwór lub wylosuj go, aby zobaczyć jego profil emocjonalny."
            : "Nie znaleziono utworu o podanym identyfikatorze. Wyszukaj inny utwór."}
        </p>
      ) : (
        <div className="mt-[1.15rem] border-t border-[#49364f] pt-[0.85rem]">
          <h2 className="text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.15] text-[#f5a4ed]">
            {title}
          </h2>
          <p className="mt-1 text-[#cdbed0]">
            {[
              formatSongCredit(song, artist),
              dominant && `Dominująca emocja: ${dominant.label}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <div className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              {series.length > 0 ? (
                <EmotionRadar
                  series={series}
                  label={`Wykres radarowy emocji: ${title}`}
                />
              ) : (
                <p>Brak wyników emocji dla tego utworu.</p>
              )}
              <label className="mt-2 grid gap-1 text-[#dfcedf]">
                Porównaj z
                <select
                  className={fieldClass}
                  value={comparisonSeries ? comparison : "none"}
                  onChange={(event) => setComparison(event.currentTarget.value)}
                >
                  <option value="none">Bez porównania</option>
                  <option value="all">Średnia wszystkich utworów</option>
                  {genres.map((genre) => (
                    <option key={genre} value={`genre:${genre}`}>
                      Średnia gatunku: {genre}
                    </option>
                  ))}
                  {compareSong && compareSong.id !== song.id && (
                    <option value="song">
                      Utwór: {compareSong.name || "Utwór bez tytułu"}
                    </option>
                  )}
                </select>
              </label>
              {comparison !== "song" && (
                <p className="mt-1 text-[#cdbed0]">
                  Aby porównać z innym utworem, wyszukaj go i kliknij
                  „Porównaj”.
                </p>
              )}
            </div>
            <div>
              <DetailSections sections={getSongDetailSections(song, artist)} />
            </div>
          </div>

          <div
            className="mt-4 grid gap-x-8 gap-y-4 data-[compare=true]:md:grid-cols-2"
            data-compare={Boolean(comparisonSeries)}
          >
            {song.SongsEmotions && (
              <SongEmotionScores
                scores={song.SongsEmotions}
                heading={`Natężenie (0–1): ${title}`}
              />
            )}
            {comparisonSeries && (
              <SongEmotionScores
                scores={comparisonSeries.scores}
                heading={`Natężenie (0–1): ${comparisonSeries.label}`}
                showMissing
              />
            )}
          </div>
        </div>
      )}

      <p className="mt-[0.8rem] text-[#cdbed0]">
        Osie wykresu są ułożone jak w kole emocji Plutchika, więc emocje
        przeciwstawne leżą naprzeciw siebie (radość–smutek, zaufanie–wstręt,
        strach–złość, zaskoczenie–oczekiwanie). Średnie uwzględniają dostępne
        wyniki spośród {songs.length} utworów w bazie.
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

function averageScores(songs: readonly SongEmotion[]) {
  const averages: EmotionScores = {};

  for (const [key] of emotions) {
    let sum = 0;
    let count = 0;
    for (const song of songs) {
      const value = song.SongsEmotions?.[key];
      if (value != null && Number.isFinite(value)) {
        sum += value;
        count++;
      }
    }
    if (count > 0) {
      averages[key] = sum / count;
    }
  }

  return averages;
}

function findSongs(
  songs: readonly SongEmotion[],
  query: string,
  getArtist: (song: SongEmotion) => Artist | undefined,
) {
  const text = query.trim().toLocaleLowerCase("pl");
  if (!text) return [];

  const results: SongEmotion[] = [];
  for (const song of songs) {
    const searchable =
      `${song.name ?? ""} ${getArtist(song)?.artist ?? ""}`.toLocaleLowerCase(
        "pl",
      );
    if (searchable.includes(text)) {
      results.push(song);
      if (results.length === maxResults) break;
    }
  }

  return results;
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
