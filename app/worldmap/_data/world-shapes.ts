import countries from "i18n-iso-countries";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { ANTARCTICA_ID, MAP_WIDTH } from "@/app/worldmap/_constants/map";

export interface CountryShape {
  code: string | null;
  name: string;
  d: string;
}

export interface MapGeometry {
  shapes: CountryShape[];
  width: number;
  height: number;
}

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
  (country) => ({
    code: country.id
      ? (countries.numericToAlpha2(String(country.id)) ?? null)
      : null,
    name: country.properties?.name ?? "Unknown",
    d: toSvgPath(country) ?? "",
  }),
);

export const WORLD_MAP: MapGeometry = {
  shapes: countryShapes,
  width: MAP_WIDTH,
  height: Math.ceil(landBottom - landTop),
};
