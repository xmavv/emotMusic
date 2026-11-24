import type { NextRequest } from "next/server";
import { loadSongsPage, type SongsQuery } from "@/app/worldmap/_data/songs";
import { findGenreGroup } from "@/utils/genres";
import { PLUTCHIK_EMOTIONS } from "@/utils/plutchik";

const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const YEAR_PATTERN = /^[1-9]\d{3}$/;
const CURSOR_PATTERN = /^\d{1,15}$/;

function parseQuery(params: URLSearchParams): SongsQuery | null {
  const country = params.get("country") ?? "";
  const year = params.get("year");
  const genre = params.get("genre");
  const sort = params.get("sort");
  const cursor = params.get("cursor");

  const genreGroup = findGenreGroup(genre)?.id ?? null;
  const sortEmotion =
    PLUTCHIK_EMOTIONS.find((emotion) => emotion === sort) ?? null;

  const isValid =
    COUNTRY_PATTERN.test(country) &&
    (year === null || YEAR_PATTERN.test(year)) &&
    (genre === null || genreGroup !== null) &&
    (sort === null || sortEmotion !== null) &&
    (cursor === null || CURSOR_PATTERN.test(cursor));
  if (!isValid) return null;

  return {
    country,
    year: year === null ? null : Number(year),
    genre: genreGroup,
    sortEmotion,
    cursor: cursor === null ? null : Number(cursor),
  };
}

export async function GET(request: NextRequest) {
  const query = parseQuery(request.nextUrl.searchParams);
  if (!query) return Response.json({ error: "Invalid query" }, { status: 400 });

  return Response.json(await loadSongsPage(query));
}
