import { connection } from "next/server";
import { WorldmapView } from "@/app/worldmap/_components/worldmap-view";
import { WORLD_MAP } from "@/app/worldmap/_data/world-shapes";
import { loadStats } from "@/app/worldmap/_data/stats";

export default async function Page() {
  await connection();
  const statsByYear = await loadStats();
  const years = Object.keys(statsByYear).map(Number);

  return (
    <WorldmapView
      geometry={WORLD_MAP}
      statsByYear={statsByYear}
      minYear={Math.min(...years)}
      maxYear={Math.max(...years)}
    />
  );
}
