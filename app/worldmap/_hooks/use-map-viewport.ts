import { useEffect, useState, type RefObject } from "react";
import { PANEL_BESIDE_MAP_QUERY } from "@/app/worldmap/_constants/map";
import type { MapViewport } from "@/app/worldmap/_lib/map-view";

export function useMapViewport(
  mapRef: RefObject<SVGSVGElement | null>,
): MapViewport | null {
  const [viewport, setViewport] = useState<MapViewport | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const observer = new ResizeObserver(() => {
      const { width, height } = map.getBoundingClientRect();
      const panelBesideMap = window.matchMedia(PANEL_BESIDE_MAP_QUERY).matches;
      setViewport({ width, height, panelBesideMap });
    });
    observer.observe(map);
    return () => observer.disconnect();
  }, [mapRef]);

  return viewport;
}
