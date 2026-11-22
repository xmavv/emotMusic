import { useEffect, useState } from "react";
import type { StatsByYear } from "@/app/worldmap/_data/stats";
import type { GenreGroup } from "@/utils/genres";

async function fetchGenreStats(
  genre: GenreGroup,
  signal: AbortSignal,
): Promise<StatsByYear> {
  const response = await fetch(`/worldmap/stats?genre=${genre}`, { signal });
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

export function useGenreStats(allGenresStats: StatsByYear) {
  const [requestedGenre, setRequestedGenre] = useState<GenreGroup | null>(null);
  const [shown, setShown] = useState({
    genre: null as GenreGroup | null,
    statsByYear: allGenresStats,
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (requestedGenre === shown.genre) return;
    const controller = new AbortController();

    const load = async () => {
      try {
        const statsByYear = requestedGenre
          ? await fetchGenreStats(requestedGenre, controller.signal)
          : allGenresStats;
        if (!controller.signal.aborted)
          setShown({ genre: requestedGenre, statsByYear });
      } catch {
        if (controller.signal.aborted) return;
        setRequestedGenre(shown.genre);
        setFailed(true);
      }
    };

    load();
    return () => controller.abort();
  }, [requestedGenre, shown.genre, allGenresStats]);

  const selectGenre = (genre: GenreGroup | null) => {
    setFailed(false);
    setRequestedGenre(genre);
  };

  return {
    genre: shown.genre,
    statsByYear: shown.statsByYear,
    requestedGenre,
    isLoading: requestedGenre !== shown.genre,
    failed,
    selectGenre,
  };
}
