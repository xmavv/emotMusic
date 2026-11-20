import { LoadingScreen } from "@/app/components/loading-screen";
import type { Metadata } from "next";
import { Suspense } from "react";
import { VisualizationPage } from "@/app/components/visualization-page";
import { getArtistsLocations, getSongsAndEmotions } from "@/services/supabase/supabaseActions";
import { aggregateCountryEmotions } from "./country-emotions";
import { CountriesMap } from "./countriesmap";

export const metadata: Metadata = { title: "Emocje na mapie | emotMusic" };

async function CountriesMapData() {
  const [songs, artists] = await Promise.all([getSongsAndEmotions(), getArtistsLocations()]);

  return <CountriesMap years={aggregateCountryEmotions(songs, artists)} songs={songs} artists={artists} />;
}

// prettier-ignore
export default function Page() {

  return (
    <VisualizationPage
      title="COUNTRIESMAP"
      description="Porównaj emocje w utworach według kraju wykonawcy i roku wydania."
    >
      <Suspense fallback={<LoadingScreen />}>
        <CountriesMapData />
      </Suspense>
    </VisualizationPage>
  );
}
