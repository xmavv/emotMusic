import { memo, useCallback, useState, type MouseEvent } from "react";
import {
  CountryTooltip,
  type MapHover,
} from "@/app/worldmap/_components/map/country-tooltip";
import { ZoomableMap } from "@/app/worldmap/_components/map/zoomable-map";
import { COUNTRY_BORDER, EMPTY_COUNTRY_COLOR } from "@/app/worldmap/_constants";
import type {
  CountryYearStats,
  StatsByCountry,
} from "@/app/worldmap/_data/stats";
import type {
  CountryShape,
  MapGeometry,
} from "@/app/worldmap/_data/world-shapes";
import type { EmotionThresholds } from "@/app/worldmap/_lib/emotion-thresholds";
import { countryColor } from "@/app/worldmap/_lib/country-color";
import {
  similarityColor,
  type Similarities,
} from "@/app/worldmap/_lib/similarity";
import type { PlutchikEmotion } from "@/utils/plutchik";

interface CountryShapesProps {
  geometry: MapGeometry;
  stats: StatsByCountry;
  clickableStats: StatsByCountry;
  thresholds: EmotionThresholds;
  similarities: Similarities | null;
  active: PlutchikEmotion[];
  selectedShape: CountryShape | undefined;
  onHover: (hover: MapHover | null) => void;
  onMapClick: (code: string | null) => void;
}

export function Worldmap({
  onMapClick,
  ...shapesProps
}: Omit<CountryShapesProps, "onHover">) {
  const { stats, similarities, active, selectedShape } = shapesProps;
  const [hover, setHover] = useState<MapHover | null>(null);

  const hideTooltipAndClick = useCallback(
    (code: string | null) => {
      setHover(null);
      onMapClick(code);
    },
    [onMapClick],
  );

  const hoveredStats = hover ? stats[hover.code] : undefined;
  const isSelected = hover?.code === selectedShape?.code;

  return (
    <>
      <CountryShapes
        {...shapesProps}
        onMapClick={hideTooltipAndClick}
        onHover={setHover}
      />
      {hover && hoveredStats && !isSelected && (
        <CountryTooltip
          hover={hover}
          stats={hoveredStats}
          similarity={similarities?.[hover.code]}
          active={active}
        />
      )}
    </>
  );
}

const CountryShapes = memo(function CountryShapes({
  geometry: { shapes, width, height },
  stats,
  clickableStats,
  thresholds,
  similarities,
  active,
  selectedShape,
  onHover,
  onMapClick,
}: CountryShapesProps) {
  const colorOf = (code: string, { averageEmotions }: CountryYearStats) => {
    if (!similarities) return countryColor(averageEmotions, active, thresholds);
    return code in similarities ? similarityColor(similarities[code]) : null;
  };

  const showHover = (
    { currentTarget, clientX, clientY }: MouseEvent<SVGPathElement>,
    { code, name }: CountryShape,
  ) => {
    if (code === null) return;

    const mapBox =
      currentTarget.ownerSVGElement!.parentElement!.getBoundingClientRect();
    onHover({
      code,
      name,
      x: clientX - mapBox.left,
      y: clientY - mapBox.top,
      mapWidth: mapBox.width,
    });
  };

  return (
    <ZoomableMap
      width={width}
      height={height}
      focus={selectedShape?.bounds ?? null}
      onMapClick={onMapClick}
    >
      {shapes.map((shape, i) => {
        const countryStats = shape.code ? stats[shape.code] : undefined;
        const color =
          shape.code && countryStats ? colorOf(shape.code, countryStats) : null;
        const isClickable = shape.code && shape.code in clickableStats;
        const isDimmed = selectedShape !== undefined && shape !== selectedShape;

        return (
          <path
            key={shape.code ?? `x${i}`}
            d={shape.d}
            data-code={shape.code ?? ""}
            {...COUNTRY_BORDER}
            fill={color ?? EMPTY_COUNTRY_COLOR}
            className={`transition-[fill,opacity] duration-300 ${color ? "hover:brightness-125" : ""} ${isClickable ? "cursor-pointer" : ""} ${isDimmed ? "opacity-30" : ""}`}
            onMouseMove={(ev) => showHover(ev, shape)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}
    </ZoomableMap>
  );
});
