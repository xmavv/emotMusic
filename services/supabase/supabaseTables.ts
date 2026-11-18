import type { Tables } from "./database.types";

export const TABLES = {
  SONGS: "Songs",
  EMOTIONS: "SongsEmotions",
  LOCATIONS: "ArtistsLocations",
} as const;

export type Song = Tables<"Songs">;
export type Emotion = Tables<"SongsEmotions">;
export type Artist = Tables<"ArtistsLocations">;

export type SongEmotion = Song & {
  SongsEmotions: Emotion | null;
};

// Previous hand-written types, kept for reference:
// export interface Song {
//   id: number;
//   artistId: string;
//   name: string;
//   length: string;
//   genre: string;
//   album: string;
//   date: Date;
// }
//
// export interface Emotion {
//   id: number;
//   joy: number;
//   trust: number;
//   anticipation: number;
//   surprise: number;
//   fear: number;
//   sadness: number;
//   disgust: number;
//   anger: number;
//   positive: number;
//   negative: number;
//   neutral: number;
// }
//
// export interface Artist {
//   id: number;
//   artist: string; //a name
//   birthplace: string;
//   area: string;
//   country: string;
// }
//
// export interface SongEmotion extends Song {
//   SongsEmotions: Emotion;
// }
