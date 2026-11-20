import { emotions } from "@/app/components/song-emotions";
import { getSongDate } from "@/lib/songs";
import type { Artist, SongEmotion } from "@/services/supabase/supabaseTables";
import world from "./world-countries.json";

export type EmotionKey = (typeof emotions)[number][0];

export type CountryEmotions = {
  code: string;
  songIds: number[];
  averages: Partial<Record<EmotionKey, number>>;
};

export type YearEmotions = {
  year: number | null;
  countries: CountryEmotions[];
};

type EmotionTotal = { sum: number; count: number };

type CountryTotals = {
  songIds: number[];
  scores: Map<EmotionKey, EmotionTotal>;
};

type CountriesByCode = Map<string, CountryTotals>;
type CountryGroups = Map<number | null, CountriesByCode>;

const countryCodes = getMappedCountryCodes();

function getMappedCountryCodes() {
  const codes = new Set<string>();

  for (const { code, shape } of world.countries) {
    if (/^[A-Z]{2}$/.test(code) && shape) {
      codes.add(code);
    }
  }

  return codes;
}

export function aggregateCountryEmotions(songs: readonly SongEmotion[], artists: readonly Artist[]): YearEmotions[] {
  const artistsById = new Map<number, string | undefined>();
  for (const { id, country } of artists) {
    artistsById.set(id, country?.trim().toUpperCase());
  }

  const groups: CountryGroups = new Map();

  for (const song of songs) {
    const code = song.artistId == null ? undefined : artistsById.get(song.artistId);
    if (!code || !countryCodes.has(code)) continue;

    const releaseYear = new Date(getSongDate(song)).getUTCFullYear();
    const periods = Number.isFinite(releaseYear) ? [null, releaseYear] : [null];
    const scores = getRecordedEmotionScores(song);

    for (const year of periods) {
      let countries = groups.get(year);
      if (!countries) {
        countries = new Map();
        groups.set(year, countries);
      }

      let country = countries.get(code);
      if (!country) {
        country = { songIds: [], scores: new Map() };
        countries.set(code, country);
      }

      country.songIds.push(song.id);
      for (const { key, value } of scores) {
        const total = country.scores.get(key) ?? { sum: 0, count: 0 };
        total.sum += value;
        total.count++;
        country.scores.set(key, total);
      }
    }
  }

  return getYearlyCountryAverages(groups);
}

function getRecordedEmotionScores(song: SongEmotion) {
  const scores: { key: EmotionKey; value: number }[] = [];

  for (const [key] of emotions) {
    const value = song.SongsEmotions?.[key];
    if (value != null && Number.isFinite(value)) {
      scores.push({ key, value });
    }
  }

  return scores;
}

function getYearlyCountryAverages(groups: CountryGroups): YearEmotions[] {
  const years: YearEmotions[] = [];

  for (const [year, countries] of groups) {
    const countryAverages: CountryEmotions[] = [];

    for (const [code, totals] of countries) {
      const averages: CountryEmotions["averages"] = {};
      for (const [key, { sum, count }] of totals.scores) {
        averages[key] = sum / count;
      }

      countryAverages.push({ code, songIds: totals.songIds, averages });
    }

    years.push({ year, countries: countryAverages });
  }

  years.sort((a, b) => (b.year ?? Infinity) - (a.year ?? Infinity));

  return years;
}
