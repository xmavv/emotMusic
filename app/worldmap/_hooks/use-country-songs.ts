import { useCallback, useEffect, useState } from "react";
import type { CountrySong, SongsPage } from "@/app/worldmap/_data/songs";
import type { GenreGroup } from "@/utils/genres";
import type { PlutchikEmotion } from "@/utils/plutchik";

const FIRST_REQUEST_DELAY_MS = 200;

type SongsStatus = "loading" | "hasMore" | "complete" | "failed";

export function useCountrySongs(
  country: string,
  year: number | null,
  genre: GenreGroup | null,
  sortEmotion: PlutchikEmotion | null,
) {
  const [songs, setSongs] = useState<CountrySong[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [status, setStatus] = useState<SongsStatus>("loading");

  useEffect(() => {
    if (status !== "loading") return;
    const controller = new AbortController();

    const load = async () => {
      const params = new URLSearchParams({ country });
      if (year !== null) params.set("year", String(year));
      if (genre !== null) params.set("genre", genre);
      if (sortEmotion !== null) params.set("sort", sortEmotion);
      if (cursor !== null) params.set("cursor", String(cursor));

      try {
        const response = await fetch(`/api/worldmap/songs?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(response.statusText);
        const page: SongsPage = await response.json();
        if (controller.signal.aborted) return;

        setSongs((loaded) => [...loaded, ...page.songs]);
        setCursor(page.nextCursor);
        setStatus(page.nextCursor === null ? "complete" : "hasMore");
      } catch {
        if (!controller.signal.aborted) setStatus("failed");
      }
    };

    const delay = cursor === null ? FIRST_REQUEST_DELAY_MS : 0;
    const timer = setTimeout(load, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [status, country, year, genre, sortEmotion, cursor]);

  const loadMore = useCallback(() => setStatus("loading"), []);

  return { songs, status, loadMore };
}
