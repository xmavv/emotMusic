import { LoadingScreen } from "@/app/components/loading-screen";
import type { Metadata } from "next";
import { Suspense } from "react";
import { VisualizationPage } from "@/app/components/visualization-page";
import { SongProfileData } from "./song-profile-data";

export const metadata: Metadata = {
  title: "Profil emocjonalny utworu | emotMusic",
};

// prettier-ignore
export default function Page() {

  return (
    <VisualizationPage title="SPIDERCHART" description="Profil emocjonalny utworu na wykresie radarowym wraz z metadanymi.">
      <Suspense fallback={<LoadingScreen />}>
        <SongProfileData />
      </Suspense>
    </VisualizationPage>
  );
}
