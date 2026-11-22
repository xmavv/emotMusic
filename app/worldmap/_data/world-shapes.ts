import countries from "i18n-iso-countries";
import polishNames from "i18n-iso-countries/langs/pl.json";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { countryBounds, type Bounds } from "@/app/worldmap/_lib/country-bounds";

const LANGUAGE = "pl";
const MAP_WIDTH = 960;
const ANTARCTICA_ID = "010";

export interface CountryShape {
  code: string | null;
  name: string;
  d: string;
  bounds: Bounds | null;
}

export interface MapGeometry {
  shapes: CountryShape[];
  width: number;
  height: number;
}

countries.registerLocale(polishNames);

const worldTopology = world as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
}>;
const allCountries = feature(worldTopology, worldTopology.objects.countries);
const mappedCountries = {
  ...allCountries,
  features: allCountries.features.filter(
    (country) => country.id !== ANTARCTICA_ID,
  ),
};

const projection = geoNaturalEarth1().fitWidth(MAP_WIDTH, mappedCountries);
const toSvgPath = geoPath(projection);

const [[, landTop], [, landBottom]] = toSvgPath.bounds(mappedCountries);
const [offsetX, offsetY] = projection.translate();
projection.translate([offsetX, offsetY - landTop]);

const countryShapes: CountryShape[] = mappedCountries.features.map(
  (country) => {
    const svgPath = toSvgPath(country) ?? "";
    const code = country.id
      ? (countries.numericToAlpha2(String(country.id)) ?? null)
      : null;
    return {
      code,
      name:
        (code && countries.getName(code, LANGUAGE)) ??
        country.properties?.name ??
        "Nieznany kraj",
      d: svgPath,
      bounds: countryBounds(svgPath),
    };
  },
);

export const WORLD_MAP: MapGeometry = {
  shapes: countryShapes,
  width: MAP_WIDTH,
  height: Math.ceil(landBottom - landTop),
};
