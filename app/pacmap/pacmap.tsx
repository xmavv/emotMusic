import { getSongsAndEmotions } from "@/services/supabase/actions";

export async function Pacmap() {
  const songsAndEmotions = await getSongsAndEmotions();

  return (
    <ul>
      {songsAndEmotions.map((songAndEmotion) => (
        <div key={songAndEmotion.id}>
          {songAndEmotion.name} {songAndEmotion.SongsEmotions?.surprise}
        </div>
      ))}
    </ul>
  );
}
