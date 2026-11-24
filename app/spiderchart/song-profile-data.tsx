import {
  getArtistsLocations,
  getSongsAndEmotions,
} from "@/services/supabase/actions";
import { SongProfile } from "./song-profile";

export async function SongProfileData({ songId }: { songId?: number }) {
  const [songs, artists] = await Promise.all([
    getSongsAndEmotions(),
    getArtistsLocations(),
  ]);

  return (
    <SongProfile
      key={songId}
      songs={songs}
      artists={artists}
      initialSongId={songId}
    />
  );
}
