import type { NextRequest } from "next/server";
import {
  loadSongsPage,
  type SongsCursor,
  type SongsQuery,
} from "@/app/worldmap/_data/songs";
import { findGenreGroup } from "@/utils/genres";
import { PLUTCHIK_EMOTIONS } from "@/utils/plutchik";

const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const YEAR_PATTERN = /^\d{4}$/;
const CURSOR_PATTERN = /^(\d{4}-\d{2}-\d{2})_(\d{1,15})$/;

function isRealDate(date: string): boolean {
  const parsed = new Date(date);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

function parseCursor(cursor: string): SongsCursor | null {
  const [, date, id] = cursor.match(CURSOR_PATTERN) ?? [];
  return date && isRealDate(date) ? { date, id: Number(id) } : null;
}

function parseQuery(params: URLSearchParams): SongsQuery | null {
  const country = params.get("country") ?? "";
  const year = params.get("year");
  const genreText = params.get("genre");
  const genre = findGenreGroup(genreText)?.id ?? null;
  const sort = params.get("sort");
  const sortEmotion =
    PLUTCHIK_EMOTIONS.find((emotion) => emotion === sort) ?? null;
  const cursorText = params.get("cursor");
  const cursor = cursorText === null ? null : parseCursor(cursorText);

  const isValid =
    COUNTRY_PATTERN.test(country) &&
    (year === null || (YEAR_PATTERN.test(year) && Number(year) > 0)) &&
    (genreText === null || genre !== null) &&
    (sort === null || sortEmotion !== null) &&
    (cursorText === null || cursor !== null);

  return isValid
    ? {
        country,
        year: year === null ? null : Number(year),
        genre,
        sortEmotion,
        cursor,
      }
    : null;
}

export async function GET(request: NextRequest) {
  const query = parseQuery(request.nextUrl.searchParams);
  if (!query) return Response.json({ error: "Invalid query" }, { status: 400 });

  return Response.json(await loadSongsPage(query));
}
