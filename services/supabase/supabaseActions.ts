import supabaseClient from "./supabaseClient";
import { Artist, Song, SongEmotion, TABLES } from "./supabaseTables";

export const getSongs = async (): Promise<Song[]> => {
  const { data, error } = await supabaseClient.from(TABLES.SONGS).select("*");

  if (error) throw new Error(error.message);
  return data as Song[];
};

export const getSongAndEmotion = async (id: number): Promise<SongEmotion> => {
  const { data, error } = await supabaseClient
    .from(TABLES.SONGS)
    .select(`*, ${TABLES.EMOTIONS} (*)`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const getSongsAndEmotions = async (): Promise<SongEmotion[]> => {
  const { data, error } = await supabaseClient
    .from(TABLES.SONGS)
    .select(`*, ${TABLES.EMOTIONS} (*)`);

  if (error) throw new Error(error.message);
  return data;
};

export const getArtistsLocations = async (): Promise<Artist[]> => {
  const { data, error } = await supabaseClient
    .from(TABLES.LOCATIONS)
    .select("*");

  if (error) throw new Error(error.message);
  return data;
};
