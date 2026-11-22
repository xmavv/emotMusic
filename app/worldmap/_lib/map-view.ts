import {
  MAX_ZOOM,
  PANEL_GAP,
  PANEL_WIDTH,
} from "@/app/worldmap/_constants/map";
import type { Bounds } from "@/app/worldmap/_lib/country-bounds";

const COUNTRY_PADDING_RATIO = 0.07;

export interface MapView {
  center: [number, number];
  zoom: number;
}

export interface MapViewport {
  width: number;
  height: number;
  panelBesideMap: boolean;
}

interface MapSize {
  width: number;
  height: number;
}

export function worldView({ width, height }: MapSize): MapView {
  return { center: [width / 2, height / 2], zoom: 1 };
}

export function countryView(
  bounds: Bounds,
  map: MapSize,
  viewport: MapViewport,
): MapView {
  const pixelsPerUnit = Math.min(
    viewport.width / map.width,
    viewport.height / map.height,
  );
  const freeWidth =
    viewport.width - (viewport.panelBesideMap ? PANEL_WIDTH + PANEL_GAP : 0);

  const padding =
    COUNTRY_PADDING_RATIO * Math.min(viewport.width, viewport.height);
  const countryWidth = (bounds.right - bounds.left) * pixelsPerUnit;
  const countryHeight = (bounds.bottom - bounds.top) * pixelsPerUnit;
  const zoom = Math.min(
    MAX_ZOOM,
    (freeWidth - 2 * padding) / countryWidth,
    (viewport.height - 2 * padding) / countryHeight,
  );

  const shiftToFreeArea = (viewport.width - freeWidth) / 2 / pixelsPerUnit;
  return {
    center: [
      (bounds.left + bounds.right) / 2 + shiftToFreeArea / zoom,
      (bounds.top + bounds.bottom) / 2,
    ],
    zoom,
  };
}

export function viewBetween(
  from: MapView,
  to: MapView,
  progress: number,
): MapView {
  const mix = (start: number, end: number) => start + (end - start) * progress;
  const zoom = mix(from.zoom, to.zoom);
  const centerOnAxis = (axis: 0 | 1) =>
    mix(from.center[axis] * from.zoom, to.center[axis] * to.zoom) / zoom;

  return { center: [centerOnAxis(0), centerOnAxis(1)], zoom };
}
