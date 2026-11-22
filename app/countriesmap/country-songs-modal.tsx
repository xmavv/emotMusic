"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EmotionScoreBar } from "@/app/components/song-emotion-scores";
import { getDominantEmotion } from "@/app/components/song-emotions";
import { getSongDate } from "@/lib/songs";
import { SongDetailsModal } from "@/app/components/song-details-modal";
import type { Artist, SongEmotion } from "@/services/supabase/supabaseTables";

export function CountrySongsModal({
  country,
  year,
  songs,
  artistsById,
}: {
  country: string;
  year: number | null;
  songs: SongEmotion[];
  artistsById: ReadonlyMap<number, Artist>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [open, setOpen] = useState(false);
  const sortedSongs = open ? sortSongsByTitle(songs) : [];

  useEffect(() => {
    const element = dialog.current;
    return () => element?.close();
  }, []);

  return (
    <>
      <button
        type="button"
        className={
          "cursor-pointer rounded-[0.4rem] border border-[#a47bb6] bg-[#211529] px-[0.6rem] py-1 " +
          "text-[#faf7fb] hover:border-[#f4a6f0] focus-visible:border-[#f4a6f0]"
        }
        aria-haspopup="dialog"
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        Pokaż utwory
      </button>
      <dialog
        ref={dialog}
        className={
          "fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] overflow-auto rounded-2xl border border-[#a47bb6] " +
          "bg-[#100d14] p-[clamp(1rem,4vw,1.75rem)] text-[#faf7fb] backdrop:bg-[#080709cc] " +
          "w-[min(40rem,calc(100%-2rem))]"
        }
        aria-labelledby={headingId}
        onClose={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <header className={"flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-[0.6rem]"}>
          <h2 id={headingId}>
            Utwory · {country} · {year ?? "Wszystkie lata"}
          </h2>
          <form method="dialog">
            <button
              type="submit"
              className={
                "cursor-pointer rounded-[0.4rem] border border-[#a47bb6] bg-[#211529] px-[0.6rem] py-1 " +
                "text-[#faf7fb] hover:border-[#f4a6f0] focus-visible:border-[#f4a6f0]"
              }
              autoFocus
            >
              Zamknij
            </button>
          </form>
        </header>
        <ul>
          {sortedSongs.map((song) => {
            const artist = song.artistId == null ? undefined : artistsById.get(song.artistId);
            const metadata = formatSongCredit(song, artist);
            const dominant = getDominantEmotion(song.SongsEmotions);

            return (
              <li
                key={song.id}
                className={
                  "grid grid-cols-[minmax(0,1fr)_minmax(7rem,37%)] items-center gap-x-4 gap-y-2 border-t " +
                  "border-[#382a40] py-[0.35rem]"
                }
              >
                <div className="min-w-0 wrap-anywhere">
                  <SongDetailsModal song={song} artist={artist} triggerLabel={song.name || "Utwór bez tytułu"} />
                  {metadata && <p className="mt-[0.2rem] text-[#cdbed0]">{metadata}</p>}
                </div>
                {dominant && (
                  <div className="col-start-2">
                    <span>{dominant.label}</span>
                    <EmotionScoreBar score={dominant.score} color={dominant.color} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </dialog>
    </>
  );
}

function sortSongsByTitle(songs: readonly SongEmotion[]) {
  const sortedSongs = [...songs];
  sortedSongs.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pl"));

  return sortedSongs;
}

function formatSongCredit(song: SongEmotion, artist?: Artist) {
  const credit: (string | number)[] = [];
  const artistName = artist?.artist?.trim();
  if (artistName) {
    credit.push(artistName);
  }

  const releaseYear = new Date(getSongDate(song)).getUTCFullYear();
  if (Number.isFinite(releaseYear) && releaseYear !== 0) {
    credit.push(releaseYear);
  }

  return credit.join(" · ");
}
