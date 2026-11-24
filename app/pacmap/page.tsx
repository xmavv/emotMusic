import { LoadingScreen } from "@/components/loading-screen/loading-screen";
import type { Metadata } from "next";
import { Suspense } from "react";
import { VisualizationPage } from "@/components/visualization-page/visualization-page";
import { getArtistsLocations, getSongsAndEmotions } from "@/services/supabase/actions";
import { ProjectionMap } from "./projection-map";
import { projectSongs } from "./song-projections";

export const metadata: Metadata = { title: "Mapa podobieństwa utworów | emotMusic" };

async function ProjectionMapData() {
  const [songs, artists] = await Promise.all([getSongsAndEmotions(), getArtistsLocations()]);

  return <ProjectionMap songs={songs} artists={artists} projections={await projectSongs(songs)} />;
}

// prettier-ignore
export default function Page() {

  return (
    <VisualizationPage
      title="PACMAP"
      description="Mapa podobieństwa emocjonalnego utworów: podobne utwory leżą blisko siebie."
    >
      <Suspense fallback={<LoadingScreen />}>
        <ProjectionMapData />
      </Suspense>
    </VisualizationPage>
  );
}
