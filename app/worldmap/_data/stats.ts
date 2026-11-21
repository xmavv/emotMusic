import { cacheLife } from "next/cache";
import supabaseClient from "@/services/supabase/client";
import { TABLES, type CountryYearEmotions } from "@/services/supabase/tables";
import { PLUTCHIK_EMOTIONS, type EmotionValues } from "@/utils/plutchik";

const ROWS_PER_REQUEST = 1000;

export interface CountryYearStats {
  songCount: number;
  averageEmotions: EmotionValues;
}

export type StatsByYear = Record<number, Record<string, CountryYearStats>>;

async function fetchCountryYearRows(): Promise<CountryYearEmotions[]> {
  const { count, error } = await supabaseClient
    .from(TABLES.COUNTRY_YEAR_EMOTIONS)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);

  const pageCount = Math.ceil((count ?? 0) / ROWS_PER_REQUEST);
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, page) =>
      supabaseClient
        .from(TABLES.COUNTRY_YEAR_EMOTIONS)
        .select("*")
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

export async function loadStats(): Promise<StatsByYear> {
  "use cache";
  cacheLife("hours");

  const statsByYear: StatsByYear = {};

  for (const row of await fetchCountryYearRows()) {
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
