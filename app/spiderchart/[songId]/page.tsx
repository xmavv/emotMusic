import { LoadingScreen } from "@/app/components/loading-screen";
import type { Metadata } from "next";
import { Suspense } from "react";
import { VisualizationPage } from "@/app/components/visualization-page";
import { SongProfileData } from "../song-profile-data";

export const metadata: Metadata = {
  title: "Profil emocjonalny utworu | emotMusic",
};

async function View({ params }: PageProps<"/spiderchart/[songId]">) {
  const { songId } = await params;

  return <SongProfileData songId={Number(songId)} />;
}

// prettier-ignore
export default function Page(props: PageProps<"/spiderchart/[songId]">) {

  return (
    <VisualizationPage title="SPIDERCHART" description="Profil emocjonalny utworu na wykresie radarowym wraz z metadanymi.">
      <Suspense fallback={<LoadingScreen />}>
        <View {...props} />
      </Suspense>
    </VisualizationPage>
  );
}
