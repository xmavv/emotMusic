import { cacheLife } from "next/cache";
import supabaseClient from "@/services/supabase/client";
import { TABLES, type CountryYearEmotions } from "@/services/supabase/tables";
import type { GenreGroup } from "@/utils/genres";
import { mapEmotions, type EmotionValues } from "@/utils/plutchik";

const ROWS_PER_REQUEST = 1000;
const ALL_GENRES = "all";

export interface CountryYearStats {
  songCount: number;
  averageEmotions: EmotionValues;
}

export type StatsByCountry = Record<string, CountryYearStats>;
export type StatsByYear = Record<number, StatsByCountry>;

async function fetchPage(genreGroup: string, page: number) {
  const { data, count, error } = await supabaseClient
    .from(TABLES.COUNTRY_YEAR_EMOTIONS)
    .select("*", { count: "exact" })
    .eq("genre_group", genreGroup)
    .order("year")
    .order("country")
    .range(page * ROWS_PER_REQUEST, (page + 1) * ROWS_PER_REQUEST - 1);
  if (error) throw new Error(error.message);

  return { rows: data, totalCount: count ?? data.length };
}

async function fetchCountryYearRows(
  genreGroup: string,
): Promise<CountryYearEmotions[]> {
  const { rows, totalCount } = await fetchPage(genreGroup, 0);
  const pageCount = Math.ceil(totalCount / ROWS_PER_REQUEST);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) =>
      fetchPage(genreGroup, i + 1),
    ),
  );

  return [...rows, ...remainingPages.flatMap(({ rows }) => rows)];
}

export async function loadStats(
  genre: GenreGroup | null,
): Promise<StatsByYear> {
  "use cache";
  cacheLife("hours");

  const statsByYear: StatsByYear = {};

  for (const row of await fetchCountryYearRows(genre ?? ALL_GENRES)) {
    const year = row.year!;
    const country = row.country!;
    statsByYear[year] ??= {};
    statsByYear[year][country] = {
      songCount: row.song_count!,
      averageEmotions: mapEmotions((emotion) => row[emotion] ?? 0),
    };
  }

  return statsByYear;
}
