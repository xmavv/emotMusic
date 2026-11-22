"use client";

import { useMemo, useState } from "react";
import type { Artist, SongEmotion } from "@/services/supabase/supabaseTables";
import { SongEmotionScores } from "@/app/components/song-emotion-scores";
import { dominantEmotions, emotions, getDominantEmotion, scoreFormat } from "@/app/components/song-emotions";
import type { CountryEmotions, YearEmotions } from "./country-emotions";
import { CountrySongsModal } from "./country-songs-modal";
import world from "./world-countries.json";

const regions = new Intl.DisplayNames(["pl"], { type: "region" });
const noDataColor = "#302837";
const panelClass = "mx-auto max-w-6xl rounded-2xl border border-[#49364f] bg-[#100d14] p-[clamp(0.9rem,3vw,2rem)]";

export function CountriesMap({
  years,
  songs,
  artists,
}: {
  years: YearEmotions[];
  songs: SongEmotion[];
  artists: Artist[];
}) {
  const [year, setYear] = useState<number | null>(null);
  const songsById = useMemo(() => indexById(songs), [songs]);
  const artistsById = useMemo(() => indexById(artists), [artists]);
  const [metric, setMetric] = useState("dominant");
  const [countryCode, setCountryCode] = useState("");
  const yearOptions = getYearOptions(years);
  const yearPosition = Math.max(0, yearOptions.indexOf(year));
  const yearLabel = year?.toString() ?? "Wszystkie lata";
  const countries = years.find((entry) => entry.year === year)?.countries ?? [];
  const byCode = indexCountriesByCode(countries);
  const selected = byCode.get(countryCode);
  const countryName = selected ? (regions.of(selected.code) ?? selected.code) : "";
  const selectedSongs = getCountrySongs(selected, songsById);
  const selectedEmotion = emotions.find(([key]) => key === metric);
  const sortedCountries = sortCountriesByName(countries);

  function selectYear(position: number) {
    setYear(yearOptions[position] ?? null);
    setCountryCode("");
  }
  // prettier-ignore
  if (years.length === 0) {

    return <p className={panelClass}>Brak utworów przypisanych do kraju.</p>;
  }

  return (
    <section className={panelClass} aria-label="Mapa emocji według kraju">
      <div className="flex flex-wrap gap-x-4 gap-y-[0.55rem] mb-4">
        <fieldset className="min-w-0 flex-[2_1_16rem] text-[#dfcedf]">
          <legend className="mb-1">Rok wydania</legend>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,8.5rem)] items-center gap-3">
            <input
              type="range"
              className={"min-h-8 w-full cursor-grab accent-[#d596f1] active:cursor-grabbing disabled:cursor-default"}
              min={0}
              max={yearOptions.length - 1}
              step={1}
              value={yearPosition}
              aria-label="Suwak roku wydania"
              aria-valuetext={yearLabel}
              disabled={yearOptions.length === 1}
              onChange={(event) => selectYear(event.currentTarget.valueAsNumber)}
            />
            <select
              className={
                "w-full rounded-[0.4rem] border border-[#6c5573] bg-[#191420] px-[0.65rem] py-[0.35rem] " +
                "text-[#faf7fb]"
              }
              aria-label="Wybierz rok wydania z listy"
              value={yearPosition}
              disabled={yearOptions.length === 1}
              onChange={(event) => selectYear(Number(event.currentTarget.value))}
            >
              {yearOptions.map((option, position) => (
                <option key={option ?? "all"} value={position}>
                  {option ?? "Wszystkie lata"}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <label className="grid min-w-0 flex-[1_1_9rem] gap-1 text-[#dfcedf]">
          Kolor mapy
          <select
            className={
              "w-full rounded-[0.4rem] border border-[#6c5573] bg-[#191420] px-[0.65rem] py-[0.35rem] " +
              "text-[#faf7fb]"
            }
            value={metric}
            onChange={(event) => setMetric(event.currentTarget.value)}
          >
            <option value="dominant">Dominująca emocja</option>
            {emotions.map(([key, label]) => (
              <option key={key} value={key}>
                Średnia: {label.toLocaleLowerCase("pl")}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 flex-[1_1_9rem] gap-1 text-[#dfcedf]">
          Kraj
          <select
            className={
              "w-full rounded-[0.4rem] border border-[#6c5573] bg-[#191420] px-[0.65rem] py-[0.35rem] " +
              "text-[#faf7fb]"
            }
            value={countryCode}
            onChange={(event) => setCountryCode(event.currentTarget.value)}
          >
            <option value="">Wybierz kraj</option>
            {sortedCountries.map(({ code }) => (
              <option key={code} value={code}>
                {regions.of(code) ?? code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <figure>
        <svg
          viewBox="0 0 1080 540"
          className={
            "block w-full rounded-lg border border-[#49364f] " +
            "bg-[radial-gradient(ellipse_at_center,#21152b,#100d14_80%)]"
          }
          aria-label="Mapa świata"
          role="img"
        >
          {world.countries.map(({ id, code, shape }) => {
            const country = byCode.get(code);
            const { fill, tooltip } = getCountryAppearance(country, selectedEmotion);

            return (
              <path
                key={id}
                d={shape}
                fill={fill}
                fillRule="evenodd"
                className={
                  "stroke-[#150e1b] stroke-[0.55] [vector-effect:non-scaling-stroke] " +
                  "data-[interactive=true]:cursor-pointer data-[interactive=true]:hover:stroke-white " +
                  "data-[interactive=true]:hover:stroke-[1.6] data-[selected=true]:stroke-white " +
                  "data-[selected=true]:stroke-[1.6]"
                }
                data-interactive={Boolean(country)}
                data-selected={countryCode === code}
                onClick={country ? () => setCountryCode(code) : undefined}
              >
                {tooltip && <title>{tooltip}</title>}
              </path>
            );
          })}
        </svg>
        <figcaption className={"flex flex-wrap gap-x-4 gap-y-[0.55rem] mt-[0.6rem] justify-between text-[#dfcedf]"}>
          <div
            className={
              "flex flex-wrap gap-x-4 gap-y-[0.55rem] [&>span]:flex [&>span]:flex-wrap [&>span]:items-center " +
              "[&>span]:gap-[0.35rem] [&_i]:size-[0.65rem] [&_i]:rounded-full"
            }
          >
            {selectedEmotion ? (
              <span className="[&>span]:h-2 [&>span]:w-20 [&>span]:rounded-sm">
                0{" "}
                <span
                  style={{
                    background: `linear-gradient(90deg, ${averageColor(selectedEmotion[2], 0)}, ${selectedEmotion[2]})`,
                  }}
                />{" "}
                1
              </span>
            ) : (
              dominantEmotions.map(([key, label, color]) => (
                <span key={key}>
                  <i style={{ background: color }} />
                  {label}
                </span>
              ))
            )}
            <span>
              <i style={{ background: noDataColor }} />
              Brak danych
            </span>
          </div>
          <a
            className="underline underline-offset-[0.2em]"
            href="https://www.naturalearthdata.com/downloads/50m-cultural-vectors/"
          >
            Granice: Natural Earth
          </a>
        </figcaption>
      </figure>

      {selected ? (
        <section className="mt-[1.15rem] border-t border-[#49364f] pt-[0.85rem]" aria-label="Wyniki wybranego kraju">
          <h2 className="text-[1.65rem] text-[#f5a4ed]">
            {countryName} · {year ?? "Wszystkie lata"}
          </h2>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <p>Liczba utworów: {selected.songIds.length}</p>
            <CountrySongsModal
              key={selected.code}
              country={countryName}
              year={year}
              songs={selectedSongs}
              artistsById={artistsById}
            />
          </div>
          <p>Dominująca emocja: {getDominantEmotion(selected.averages)?.label ?? "brak danych"}</p>
          <div className="mt-[0.65rem]">
            <SongEmotionScores
              scores={selected.averages}
              heading="Średnie natężenie emocji i nastroju (0–1)"
              showMissing
            />
          </div>
        </section>
      ) : (
        <p className="mt-[1.15rem] border-t border-[#49364f] pt-[0.85rem]">
          Kliknij kraj na mapie lub wybierz go z listy, aby zobaczyć średnie wyniki i listę utworów.
        </p>
      )}
      <p className="mt-[0.8rem] text-[#cdbed0]">
        Dominująca emocja to najwyższa średnia spośród ośmiu emocji. Średnie uwzględniają dostępne wyniki utworów z
        danego kraju w wybranym okresie.
      </p>
    </section>
  );
}

function averageColor(color: string, value: number) {
  const percentage = 16 + Math.max(0, Math.min(1, value)) * 84;

  return `color-mix(in srgb, ${color} ${percentage}%, #151019)`;
}

function indexById<Item extends { id: number }>(items: readonly Item[]) {
  const index = new Map<number, Item>();

  for (const item of items) {
    index.set(item.id, item);
  }

  return index;
}

function indexCountriesByCode(countries: readonly CountryEmotions[]) {
  const index = new Map<string, CountryEmotions>();

  for (const country of countries) {
    index.set(country.code, country);
  }

  return index;
}

function getYearOptions(years: readonly YearEmotions[]) {
  const options: (number | null)[] = [null];

  for (let index = years.length - 1; index >= 0; index--) {
    const { year } = years[index];
    if (year !== null) {
      options.push(year);
    }
  }

  return options;
}

function getCountrySongs(country: CountryEmotions | undefined, songsById: ReadonlyMap<number, SongEmotion>) {
  const songs: SongEmotion[] = [];

  for (const id of country?.songIds ?? []) {
    const song = songsById.get(id);
    if (song) {
      songs.push(song);
    }
  }

  return songs;
}

function sortCountriesByName(countries: readonly CountryEmotions[]) {
  const sortedCountries = [...countries];
  sortedCountries.sort((a, b) => (regions.of(a.code) ?? a.code).localeCompare(regions.of(b.code) ?? b.code, "pl"));

  return sortedCountries;
}

function getCountryAppearance(country?: CountryEmotions, emotion?: (typeof emotions)[number]) {
  // prettier-ignore
  if (!country) {

    return { fill: noDataColor };
  }

  const dominant = getDominantEmotion(country.averages);
  const score = emotion ? country.averages[emotion[0]] : dominant?.score;
  const label = emotion ? emotion[1] : dominant?.label;
  const fill = emotion && score !== undefined ? averageColor(emotion[2], score) : noDataColor;

  return {
    fill: emotion ? fill : (dominant?.color ?? noDataColor),
    tooltip: [
      regions.of(country.code) ?? country.code,
      label && score !== undefined ? `${label}: ${scoreFormat.format(score)}` : "Brak danych dla tej kategorii",
      `Utwory: ${country.songIds.length}`,
    ].join("\n"),
  };
}
