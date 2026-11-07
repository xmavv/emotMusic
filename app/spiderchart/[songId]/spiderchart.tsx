import { getSongAndEmotion } from "@/services/supabase/supabaseActions";

export async function Spiderchart({ id }: { id: number }) {
  const songAndEmotion = await getSongAndEmotion(id);

  return (
    <div>
      {songAndEmotion.name} {songAndEmotion.SongsEmotions.surprise}
    </div>
  );
}
