import { cacheLife } from "next/cache";
import { SONGS_PER_PAGE } from "@/app/worldmap/_constants/songs";
import supabaseClient from "@/services/supabase/client";
import type { GenreGroup } from "@/utils/genres";
import {
  PLUTCHIK_EMOTIONS,
  type EmotionValues,
  type PlutchikEmotion,
} from "@/utils/plutchik";

export interface CountrySong {
  id: number;
  name: string;
  artist: string;
  genre: string;
  year: number;
  emotions: EmotionValues;
}

export interface SongsPage {
  songs: CountrySong[];
  nextCursor: string | null;
}

export interface SongsCursor {
  date: string;
  id: number;
}

export interface SongsQuery {
  country: string;
  year: number | null;
  genre: GenreGroup | null;
  sortEmotion: PlutchikEmotion | null;
  cursor: SongsCursor | null;
}

function fetchRows({ country, year, genre, sortEmotion, cursor }: SongsQuery) {
  const commonArgs = {
    country_code: country,
    page_size: SONGS_PER_PAGE + 1,
    song_year: year ?? undefined,
    song_genre: genre ?? undefined,
    cursor_id: cursor?.id,
  };

  return sortEmotion
    ? supabaseClient.rpc("country_songs_by_emotion", {
        ...commonArgs,
        emotion: sortEmotion,
      })
    : supabaseClient.rpc("country_songs", {
        ...commonArgs,
        cursor_date: cursor?.date,
      });
}

export async function loadSongsPage(query: SongsQuery): Promise<SongsPage> {
  "use cache";
  cacheLife("hours");

  const { data, error } = await fetchRows(query);
  if (error) throw new Error(error.message);

  const rows = data.slice(0, SONGS_PER_PAGE);
  const lastRow = rows.at(-1);
  const hasNextPage = data.length > SONGS_PER_PAGE;

  return {
    songs: rows.map((row) => ({
      id: row.id,
      name: row.name ?? "Untitled",
      artist: row.artist ?? "Unknown artist",
      genre: row.genre ?? "",
      year: Number(row.date.slice(0, 4)),
      emotions: Object.fromEntries(
        PLUTCHIK_EMOTIONS.map((emotion) => [emotion, row[emotion] ?? 0]),
      ) as EmotionValues,
    })),
    nextCursor: hasNextPage && lastRow ? `${lastRow.date}_${lastRow.id}` : null,
  };
}
