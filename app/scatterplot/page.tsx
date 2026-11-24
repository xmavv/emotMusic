import { LoadingScreen } from "@/components/loading-screen/loading-screen";
import type { Metadata } from "next";
import { VisualizationPage } from "@/components/visualization-page/visualization-page";
import { Suspense } from "react";
import { getArtistsLocations, getSongsAndEmotions } from "@/services/supabase/actions";
import { EmotionTimeline } from "./emotion-timeline";

export const metadata: Metadata = {
  title: "Emocje w czasie | emotMusic",
};

async function EmotionTimelineData() {
  const [songs, artists] = await Promise.all([getSongsAndEmotions(), getArtistsLocations()]);

  return <EmotionTimeline songs={songs} artists={artists} />;
}

// prettier-ignore
export default function Page() {

  return (
    <VisualizationPage title="WYKRES PUNKTOWY" description="Natężenie emocji w utworach według daty wydania.">
      <Suspense fallback={<LoadingScreen />}>
        <EmotionTimelineData />
      </Suspense>
    </VisualizationPage>
  );
}
