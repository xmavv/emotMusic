"use client";

import { geoIdentity, type GeoProjection } from "d3-geo";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import {
  COUNTRY_BORDER,
  EMPTY_COUNTRY_COLOR,
  MAP_SIZE_CLASS,
} from "@/app/worldmap/_constants/map";
import type { MapGeometry } from "@/app/worldmap/_data/world-shapes";

const IDENTITY = geoIdentity() as unknown as GeoProjection;

export interface MapHover {
  code: string | null;
  name: string;
  x: number;
  y: number;
}

interface WorldmapProps {
  geometry: MapGeometry;
  colorOf: (code: string | null) => string | null;
  onHover: (hover: MapHover) => void;
}

export function Worldmap({
  geometry: { shapes, width, height },
  colorOf,
  onHover,
}: WorldmapProps) {
  return (
    <ComposableMap
      width={width}
      height={height}
      projection={IDENTITY}
      className={MAP_SIZE_CLASS}
      role="img"
      aria-label="World map coloured by the dominant emotion in each country's songs"
    >
      <ZoomableGroup
        center={[width / 2, height / 2]}
        maxZoom={8}
        translateExtent={[
          [0, 0],
          [width, height],
        ]}
      >
        {shapes.map((shape, i) => {
          const color = colorOf(shape.code);
          return (
            <path
              key={shape.code ?? `x${i}`}
              d={shape.d}
              {...COUNTRY_BORDER}
              fill={color ?? EMPTY_COUNTRY_COLOR}
              className={`transition-[fill] duration-300 ${color ? "hover:brightness-125" : ""}`}
              onMouseMove={(ev) => {
                const box =
                  ev.currentTarget.ownerSVGElement!.parentElement!.getBoundingClientRect();
                onHover({
                  code: shape.code,
                  name: shape.name,
                  x: ev.clientX - box.left,
                  y: ev.clientY - box.top,
                });
              }}
            />
          );
        })}
      </ZoomableGroup>
    </ComposableMap>
  );
}
