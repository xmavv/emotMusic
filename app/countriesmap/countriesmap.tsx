import { getArtistsLocations } from "@/services/supabase/supabaseActions";

export async function Countriesmap() {
  const artists = await getArtistsLocations();

  return (
    <ul>
      {artists.map((artist) => (
        <div key={artist.id}>{artist.artist}</div>
      ))}
    </ul>
  );
}
