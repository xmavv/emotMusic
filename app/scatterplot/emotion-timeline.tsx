"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { Artist, SongEmotion } from "@/services/supabase/tables";
import { dateFormat, emotions, scoreFormat } from "@/components/song/song-emotions";
import { SongDetailsModal } from "@/components/song/song-details-modal";
import { getSongGenres, getSongDate } from "@/utils/songs";
import { SongScatterPlot } from "./song-scatter-plot";

function getPlottableSongGenres(songs: readonly SongEmotion[]) {
  const uniqueGenres = new Set<string>();

  for (const song of songs) {
    if (!song.SongsEmotions || !Number.isFinite(getSongDate(song))) continue;

    for (const genre of getSongGenres(song)) {
      uniqueGenres.add(genre);
    }
  }

  const genres = [...uniqueGenres];
  genres.sort((a, b) => a.localeCompare(b, "pl"));

  return genres;
}

export function EmotionTimeline({ songs, artists }: { songs: SongEmotion[]; artists: Artist[] }) {
  const [emotion, setEmotion] = useState<(typeof emotions)[number]>(emotions[0]);
  const [genre, setGenre] = useState("");
  const [title, setTitle] = useState("");
  const [trackedId, setTrackedId] = useState<number>();
  const genres = useMemo(() => getPlottableSongGenres(songs), [songs]);

  const [key, label, color] = emotion;
  const titleQuery = title.trim().toLocaleLowerCase("pl");
  const matchesTitle = (song: SongEmotion) => (song.name ?? "").toLocaleLowerCase("pl").includes(titleQuery);
  const matchesGenre = (song: SongEmotion) => !genre || getSongGenres(song).includes(genre);
  const isSongVisible = (song: SongEmotion) => matchesTitle(song) && matchesGenre(song);
  const trackedSong = songs.find(({ id }) => id === trackedId);
  const trackedArtist = artists.find(({ id }) => id === trackedSong?.artistId);
  const trackedScore = trackedSong?.SongsEmotions?.[key];

  return (
    <section
      className={"mx-auto max-w-6xl rounded-2xl border border-[#49364f] bg-[#100d14] p-[clamp(0.9rem,3vw,2rem)]"}
      style={{ "--accent": color } as CSSProperties}
    >
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <fieldset className="min-w-0 flex-[1_1_31rem]">
          <legend className="text-[1.05rem] text-[#dfcedf]">Emocja / nastrój</legend>
          <div className="mt-[0.35rem] flex flex-wrap gap-[0.4rem]">
            {emotions.map((option) => (
              <button
                type="button"
                key={option[0]}
                className={
                  "rounded-[0.4rem] border border-[#49364f] bg-[#191420] px-[0.65rem] py-[0.3rem] text-[#faf7fb] " +
                  "inline-flex cursor-pointer items-center gap-[0.4rem] before:size-[0.45rem] before:rounded-full " +
                  "before:bg-[color:var(--swatch)] hover:border-[color:var(--swatch)] " +
                  "aria-pressed:border-[color:var(--swatch)] " +
                  "aria-pressed:bg-[color-mix(in_srgb,var(--swatch)_18%,#191420)]"
                }
                aria-pressed={key === option[0]}
                style={{ "--swatch": option[2] } as CSSProperties}
                onClick={() => setEmotion(option)}
              >
                {option[1]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid w-[min(100%,13rem)] content-start gap-3">
          <label className="grid content-start gap-[0.35rem] text-[1.05rem] text-[#dfcedf]">
            Gatunek
            <select
              className={
                "rounded-[0.4rem] border border-[#49364f] bg-[#191420] px-[0.65rem] py-[0.3rem] text-[#faf7fb] " +
                "w-full"
              }
              value={genre}
              onChange={(event) => setGenre(event.currentTarget.value)}
            >
              <option value="">Wszystkie gatunki</option>
              {genres.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="grid content-start gap-[0.35rem] text-[1.05rem] text-[#dfcedf]">
            Tytuł utworu
            <input
              className={
                "rounded-[0.4rem] border border-[#49364f] bg-[#191420] px-[0.65rem] py-[0.3rem] text-[#faf7fb] " +
                "w-full"
              }
              type="search"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
            />
          </label>
        </div>
      </div>

      <SongScatterPlot
        songs={songs}
        emotion={emotion}
        isSongVisible={isSongVisible}
        trackedId={trackedId}
        onSongSelect={setTrackedId}
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
            <span>{dateFormat.format(getSongDate(trackedSong))}</span>
            {isSongVisible(trackedSong) && trackedScore != null && Number.isFinite(trackedScore) ? (
              <span>
                {label}: {scoreFormat.format(trackedScore)}
              </span>
            ) : (
              <span>
                {!matchesGenre(trackedSong)
                  ? "Poza wybranym gatunkiem"
                  : !matchesTitle(trackedSong)
                    ? "Tytuł nie pasuje do wyszukiwania"
                    : "Brak wyniku dla tej emocji"}
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-x-[0.85rem] gap-y-1">
            <SongDetailsModal song={trackedSong} artist={trackedArtist} />
            <button
              type="button"
              className={
                "cursor-pointer rounded-[0.4rem] border border-[#716078] px-[0.6rem] py-1 " +
                "hover:border-[color:var(--accent)]"
              }
              onClick={() => setTrackedId(undefined)}
            >
              Zakończ śledzenie
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
