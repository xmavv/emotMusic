import type { Song } from "@/services/supabase/tables";

export function getSongDate(song: Pick<Song, "date">) {
  return song.date ? Date.parse(song.date) : NaN;
}

export function getSongGenres(
  song: Pick<Song, "genre">,
  { preserveCase = false } = {},
) {
  const genres = song.genre ?? "";
  return (preserveCase ? genres : genres.toLowerCase())
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);
}
