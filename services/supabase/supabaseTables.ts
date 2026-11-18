import type { Database } from "./database.types";

export const TABLES = {
  SONGS: "Songs",
  EMOTIONS: "SongsEmotions",
  LOCATIONS: "ArtistsLocations",
} as const;

export type Song = Database["public"]["Tables"]["Songs"]["Row"];
export type Emotion = Database["public"]["Tables"]["SongsEmotions"]["Row"];
export type Artist = Database["public"]["Tables"]["ArtistsLocations"]["Row"];

export type SongEmotion = Song & {
  SongsEmotions: Emotion | null;
};
