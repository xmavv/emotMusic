import type { NextRequest } from "next/server";
import { loadStats } from "@/app/worldmap/_data/stats";
import { findGenreGroup } from "@/utils/genres";

const BROWSER_CACHE = { "Cache-Control": "private, max-age=300" };

export async function GET(request: NextRequest) {
  const genre = findGenreGroup(request.nextUrl.searchParams.get("genre"));
  if (!genre) return Response.json({ error: "Invalid genre" }, { status: 400 });

  return Response.json(await loadStats(genre.id), { headers: BROWSER_CACHE });
}
