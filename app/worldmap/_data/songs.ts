import { cacheLife } from "next/cache";
import { SONGS_PER_PAGE } from "@/app/worldmap/_constants";
import supabaseClient from "@/services/supabase/client";
import type { GenreGroup } from "@/utils/genres";
import {
  mapEmotions,
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
  nextCursor: number | null;
}

export interface SongsQuery {
  country: string;
  year: number | null;
  genre: GenreGroup | null;
  sortEmotion: PlutchikEmotion | null;
  cursor: number | null;
}

export async function loadSongsPage({
  country,
  year,
  genre,
  sortEmotion,
  cursor,
}: SongsQuery): Promise<SongsPage> {
  "use cache";
  cacheLife("hours");

  const { data, error } = await supabaseClient.rpc("country_songs", {
    country_code: country,
    page_size: SONGS_PER_PAGE + 1,
    song_year: year ?? undefined,
    song_genre: genre ?? undefined,
    sort_emotion: sortEmotion ?? undefined,
    cursor_id: cursor ?? undefined,
  });
  if (error) throw new Error(error.message);

  const rows = data.slice(0, SONGS_PER_PAGE);
  const hasNextPage = data.length > SONGS_PER_PAGE;

  return {
    songs: rows.map((row) => ({
      id: row.id,
      name: row.name ?? "Utwór bez tytułu",
      artist: row.artist ?? "Nieznany wykonawca",
      genre: row.genre ?? "",
      year: Number(row.date.slice(0, 4)),
      emotions: mapEmotions((emotion) => row[emotion] ?? 0),
    })),
    nextCursor: hasNextPage ? rows[SONGS_PER_PAGE - 1].id : null,
  };
}
