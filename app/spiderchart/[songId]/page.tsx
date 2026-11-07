import { Suspense } from "react";
import { Spiderchart } from "@/app/spiderchart/[songId]/spiderchart";

interface SpiderchartParams {
  params: Promise<{
    songId: string;
  }>;
}

async function View({ params }: SpiderchartParams) {
  const { songId } = await params;

  return <Spiderchart id={Number(songId)} />;
}

export default function Page({ params }: SpiderchartParams) {
  return (
    <Suspense fallback={"loading data"}>
      <View params={params} />
    </Suspense>
  );
}
