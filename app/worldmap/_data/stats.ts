import { cacheLife } from "next/cache";
import supabaseClient from "@/services/supabase/client";
import { TABLES, type CountryYearEmotions } from "@/services/supabase/tables";
import type { GenreGroup } from "@/utils/genres";
import { PLUTCHIK_EMOTIONS, type EmotionValues } from "@/utils/plutchik";

const ROWS_PER_REQUEST = 1000;
const ALL_GENRES = "all";

export interface CountryYearStats {
  songCount: number;
  averageEmotions: EmotionValues;
}

export type StatsByCountry = Record<string, CountryYearStats>;
export type StatsByYear = Record<number, StatsByCountry>;

async function fetchCountryYearRows(
  genreGroup: string,
): Promise<CountryYearEmotions[]> {
  const { count, error } = await supabaseClient
    .from(TABLES.COUNTRY_YEAR_EMOTIONS)
    .select("*", { count: "exact", head: true })
    .eq("genre_group", genreGroup);
  if (error) throw new Error(error.message);

  const pageCount = Math.ceil((count ?? 0) / ROWS_PER_REQUEST);
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, page) =>
      supabaseClient
        .from(TABLES.COUNTRY_YEAR_EMOTIONS)
        .select("*")
        .eq("genre_group", genreGroup)
        .order("year")
        .order("country")
        .range(page * ROWS_PER_REQUEST, (page + 1) * ROWS_PER_REQUEST - 1),
    ),
  );

  return pages.flatMap(({ data, error }) => {
    if (error) throw new Error(error.message);
    return data;
  });
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
      averageEmotions: Object.fromEntries(
        PLUTCHIK_EMOTIONS.map((emotion) => [emotion, row[emotion] ?? 0]),
      ) as EmotionValues,
    };
  }

  return statsByYear;
}
