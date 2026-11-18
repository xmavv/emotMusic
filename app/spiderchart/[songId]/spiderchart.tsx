import { notFound } from "next/navigation";
import { getSongAndEmotion } from "@/services/supabase/supabaseActions";

export async function Spiderchart({ id }: { id: number }) {
  const songAndEmotion = await getSongAndEmotion(id);
  if (!songAndEmotion) notFound();

  return (
    <div>
      {songAndEmotion.name} {songAndEmotion.SongsEmotions?.surprise}
    </div>
  );
}
