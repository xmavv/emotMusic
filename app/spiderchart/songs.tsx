import { getSongs } from "@/services/supabase/actions";

export async function Songs() {
  const songs = await getSongs();

  return (
    <ul>
      {songs.map((song) => (
        <div key={song.id}>{song.name}</div>
      ))}
    </ul>
  );
}
