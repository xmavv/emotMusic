import Link from "next/link";
import { useEffect, useRef } from "react";
import { SONGS_PER_PAGE } from "@/app/worldmap/_constants/songs";
import type { CountrySong } from "@/app/worldmap/_data/songs";
import { useCountrySongs } from "@/app/worldmap/_hooks/use-country-songs";
import type { GenreGroup } from "@/utils/genres";
import { emotionColor, type PlutchikEmotion } from "@/utils/plutchik";
import { shares } from "@/utils/shares";

const SCROLL_AREA_CLASS =
  "max-h-72 overflow-y-auto pr-2 [scrollbar-color:var(--color-neutral-700)_transparent] [scrollbar-width:thin] lg:absolute lg:inset-0 lg:max-h-[round(down,100%,3rem)] lg:overscroll-contain";

interface SongListProps {
  country: string;
  year: number | null;
  genre: GenreGroup | null;
  songCount: number;
  sortEmotion: PlutchikEmotion | null;
  active: PlutchikEmotion[];
}

export function SongList({
  country,
  year,
  genre,
  songCount,
  sortEmotion,
  active,
}: SongListProps) {
  const { songs, status, loadMore } = useCountrySongs(
    country,
    year,
    genre,
    sortEmotion,
  );
  const placeholderCount = Math.min(
    SONGS_PER_PAGE,
    Math.max(1, songCount - songs.length),
  );

  return (
    <div className="relative mt-2 lg:flex-1">
      <ul aria-busy={status === "loading"} className={SCROLL_AREA_CLASS}>
        {songs.map((song) => (
          <SongRow
            key={song.id}
            song={song}
            showYear={year === null}
            sortEmotion={sortEmotion}
            active={active}
          />
        ))}
        {status === "loading" &&
          Array.from({ length: placeholderCount }, (_, i) => (
            <li key={i} className="flex h-12 items-center">
              <span className="h-3 w-2/3 animate-pulse rounded bg-neutral-800" />
            </li>
          ))}
        {status === "hasMore" && <LoadMoreTrigger onReached={loadMore} />}
        {status === "failed" && (
          <li className="flex h-12 items-center justify-between text-sm text-neutral-400">
            Could not load songs.
            <button
              type="button"
              onClick={loadMore}
              className="cursor-pointer hover:text-neutral-100"
            >
              Retry
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

function LoadMoreTrigger({ onReached }: { onReached: () => void }) {
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onReached();
    });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [onReached]);

  return (
    <li aria-hidden className="relative">
      <span
        ref={triggerRef}
        className="pointer-events-none absolute bottom-0 h-72 w-px"
      />
    </li>
  );
}

function SongRow({
  song,
  showYear,
  sortEmotion,
  active,
}: {
  song: CountrySong;
  showYear: boolean;
  sortEmotion: PlutchikEmotion | null;
  active: PlutchikEmotion[];
}) {
  const shownEmotion = sortEmotion ?? shares(song.emotions, active)[0]?.emotion;

  return (
    <li className="h-12 [contain-intrinsic-height:3rem] [content-visibility:auto]">
      <Link
        href={`/spiderchart/${song.id}`}
        prefetch={false}
        className="flex h-full items-center justify-between gap-3 hover:text-neutral-100"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm">{song.name}</span>
          <span className="block truncate text-xs text-neutral-500">
            {song.artist}
            {showYear && ` · ${song.year}`}
            {song.genre && ` · ${song.genre}`}
          </span>
        </span>
        {shownEmotion && (
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: emotionColor(shownEmotion) }}
            />
            {shownEmotion}
            {sortEmotion && (
              <span className="tabular-nums">
                {song.emotions[sortEmotion].toFixed(2)}
              </span>
            )}
          </span>
        )}
      </Link>
    </li>
  );
}
