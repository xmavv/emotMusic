import { useEffect, useState, type RefObject } from "react";
import type { MapViewport } from "@/app/worldmap/_lib/map-view";

const PANEL_BESIDE_MAP_QUERY = "(min-width: 64rem)";

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
