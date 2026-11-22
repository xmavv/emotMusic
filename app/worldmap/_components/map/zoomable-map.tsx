import { geoIdentity, type GeoProjection } from "d3-geo";
import {
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import { MAP_SIZE_CLASS, MAX_ZOOM } from "@/app/worldmap/_constants";
import { useAnimatedView } from "@/app/worldmap/_hooks/use-animated-view";
import { useMapViewport } from "@/app/worldmap/_hooks/use-map-viewport";
import type { Bounds } from "@/app/worldmap/_lib/country-bounds";
import { countryView, worldView } from "@/app/worldmap/_lib/map-view";

const IDENTITY = geoIdentity() as unknown as GeoProjection;
const CLICK_TOLERANCE_PX = 5;

interface ZoomableMapProps {
  width: number;
  height: number;
  focus: Bounds | null;
  onMapClick: (code: string | null) => void;
  children: ReactNode;
}

export function ZoomableMap({
  width,
  height,
  focus,
  onMapClick,
  children,
}: ZoomableMapProps) {
  const mapRef = useRef<SVGSVGElement>(null);
  const pressedAt = useRef<{ x: number; y: number } | null>(null);
  const viewport = useMapViewport(mapRef);

  const wholeWorld = useMemo(
    () => worldView({ width, height }),
    [width, height],
  );
  const targetView = useMemo(
    () =>
      focus && viewport
        ? countryView(focus, { width, height }, viewport)
        : wholeWorld,
    [focus, viewport, width, height, wholeWorld],
  );
  const { view, stopAnimation, trackUserMove } = useAnimatedView(targetView);

  const panMargin = focus ? 1 : 0;

  const onPointerUp = (ev: ReactPointerEvent<SVGSVGElement>) => {
    const start = pressedAt.current;
    pressedAt.current = null;
    if (!start || ev.button !== 0) return;

    const moved = Math.hypot(ev.clientX - start.x, ev.clientY - start.y);
    if (moved > CLICK_TOLERANCE_PX) return;

    const country = (ev.target as Element).closest<SVGElement>("[data-code]");
    onMapClick(country?.dataset.code ?? null);
  };

  return (
    <ComposableMap
      ref={mapRef}
      width={width}
      height={height}
      projection={IDENTITY}
      className={MAP_SIZE_CLASS}
      role="img"
      aria-label="Mapa świata z krajami pokolorowanymi według emocji w utworach"
      onPointerDown={(ev) => {
        pressedAt.current = { x: ev.clientX, y: ev.clientY };
      }}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pressedAt.current = null;
      }}
    >
      <ZoomableGroup
        center={view.center}
        zoom={view.zoom}
        maxZoom={MAX_ZOOM}
        translateExtent={[
          [-width * panMargin, -height * panMargin],
          [width * (1 + panMargin), height * (1 + panMargin)],
        ]}
        filterZoomEvent={(ev) => {
          const { ctrlKey, button, type } = ev as MouseEvent;
          return !ctrlKey && !button && type !== "dblclick";
        }}
        onMoveStart={stopAnimation}
        onMove={({ x = 0, y = 0, zoom = 1 }) =>
          trackUserMove({
            center: [(width / 2 - x) / zoom, (height / 2 - y) / zoom],
            zoom,
          })
        }
      >
        {children}
      </ZoomableGroup>
    </ComposableMap>
  );
}
