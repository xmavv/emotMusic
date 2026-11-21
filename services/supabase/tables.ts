import type { Database } from "./database.types";

export const TABLES = {
  SONGS: "Songs",
  EMOTIONS: "SongsEmotions",
  LOCATIONS: "ArtistsLocations",
  COUNTRY_YEAR_EMOTIONS: "country_year_emotions",
} as const;

export type Song = Database["public"]["Tables"]["Songs"]["Row"];
export type Emotion = Database["public"]["Tables"]["SongsEmotions"]["Row"];
export type Artist = Database["public"]["Tables"]["ArtistsLocations"]["Row"];
export type CountryYearEmotions =
  Database["public"]["Views"]["country_year_emotions"]["Row"];

export type SongEmotion = Song & {
  SongsEmotions: Emotion | null;
};
