"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export type ScatterPoint = {
  id: string | number;
  x: number;
  y: number;
};

type ScatterAxis = {
  label?: string;
  ticks?: readonly number[];
  formatTick?: (value: number) => ReactNode;
};

type ScatterplotProps<Point extends ScatterPoint> = {
  points: readonly Point[];
  xAxis?: ScatterAxis;
  yAxis?: ScatterAxis;
  label?: string;
  color?: string;
  emptyMessage?: ReactNode;
  selectedId?: Point["id"];
  onPointSelect?: (point: Point) => void;
  renderPointDetails?: (point: Point | undefined) => ReactNode;
};

const tickFormat = new Intl.NumberFormat("pl-PL", {
  maximumSignificantDigits: 5,
});

function makeScale(values: number[], axis?: ScatterAxis) {
  const ticks = axis?.ticks?.filter(Number.isFinite);
  let min = Infinity;
  let max = -Infinity;

  for (const value of values.concat(ticks ?? [])) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  const span = max - min;
  return {
    ticks: ticks?.length
      ? ticks
      : span === 0
        ? [min]
        : Array.from({ length: 5 }, (_, index) => min + (span * index) / 4),
    position: (value: number) =>
      span === 0 ? 50 : ((value - min) / span) * 100,
    formatTick:
      axis?.formatTick ?? ((value: number) => tickFormat.format(value)),
  };
}

export function Scatterplot<Point extends ScatterPoint>({
  points,
  xAxis,
  yAxis,
  label = "Wykres punktowy",
  color,
  emptyMessage = "Brak punktów.",
  selectedId,
  onPointSelect,
  renderPointDetails,
}: ScatterplotProps<Point>) {
  const [hoveredId, setHoveredId] = useState<Point["id"]>();
  const visiblePoints = points.filter(
    ({ x, y }) => Number.isFinite(x) && Number.isFinite(y),
  );
  const style = color
    ? ({ "--scatter-color": color } as CSSProperties)
    : undefined;

  if (visiblePoints.length === 0) {
    return (
      <p
        className={
          "mt-[0.55rem] flex min-h-[2.8rem] flex-wrap gap-x-4 gap-y-[0.2rem] border-l-2 " +
          "border-[color:var(--scatter-color,#f9e56f)] bg-[#191420] px-3 py-[0.55rem] text-[#dfcedf]"
        }
        style={style}
      >
        {emptyMessage}
      </p>
    );
  }

  const x = makeScale(
    visiblePoints.map((point) => point.x),
    xAxis,
  );
  const y = makeScale(
    visiblePoints.map((point) => point.y),
    yAxis,
  );
  const hoveredPoint = visiblePoints.find(({ id }) => id === hoveredId);

  return (
    <div style={style}>
      {yAxis?.label && (
        <p className="mb-[0.65rem] text-[#d8cbd9]">{yAxis.label}</p>
      )}
      <div
        className={
          "relative ms-[2.35rem] me-4 mb-[1.95rem] h-[clamp(15rem,42vh,25rem)] bg-[#0d0a10]"
        }
        role="group"
        aria-label={label}
        onPointerLeave={() => setHoveredId(undefined)}
      >
        {y.ticks.map((value) => (
          <div
            key={value}
            className={
              "pointer-events-none absolute border-[#392c40] text-[#dbcddd] tabular-nums w-full border-t"
            }
            style={{ top: `${100 - y.position(value)}%` }}
            aria-hidden="true"
          >
            <span className="absolute right-[calc(100%+0.45rem)] -translate-y-1/2">
              {y.formatTick(value)}
            </span>
          </div>
        ))}
        {x.ticks.map((value) => (
          <div
            key={value}
            className={
              "pointer-events-none absolute border-[#392c40] text-[#dbcddd] tabular-nums h-full border-l"
            }
            style={{ left: `${x.position(value)}%` }}
            aria-hidden="true"
          >
            <span className="absolute top-[calc(100%+0.3rem)] -translate-x-1/2">
              {x.formatTick(value)}
            </span>
          </div>
        ))}
        {visiblePoints.map((point) => (
          <span
            key={point.id}
            aria-hidden="true"
            className={
              "group absolute grid size-[0.8rem] -translate-x-1/2 -translate-y-1/2 place-items-center " +
              "data-[selectable=true]:cursor-pointer data-[active=true]:z-[1] data-[selected=true]:z-[2]"
            }
            data-active={hoveredId === point.id}
            data-selected={selectedId === point.id}
            data-selectable={Boolean(onPointSelect)}
            style={{
              left: `${x.position(point.x)}%`,
              top: `${100 - y.position(point.y)}%`,
            }}
            onPointerEnter={() => setHoveredId(point.id)}
            onPointerLeave={() => setHoveredId(undefined)}
            onClick={onPointSelect && (() => onPointSelect(point))}
          >
            <span
              className={
                "size-[0.36rem] rounded-full bg-[color:var(--scatter-color,#f9e56f)] opacity-70 " +
                "group-data-[active=true]:size-[0.58rem] group-data-[active=true]:opacity-100 " +
                "group-data-[active=true]:shadow-[0_0_0_2px_white,0_0_0.8rem_var(--scatter-color,#f9e56f)] " +
                "group-data-[selected=true]:size-[0.58rem] group-data-[selected=true]:opacity-100 " +
                "group-data-[selected=true]:shadow-[0_0_0_2px_#100d14,0_0_0_4px_var(--scatter-color,#f9e56f),0_0_1rem_var(--scatter-color,#f9e56f)]"
              }
            />
          </span>
        ))}
      </div>
      {xAxis?.label && (
        <p className="mt-[1.95rem] text-center text-[#d8cbd9]">{xAxis.label}</p>
      )}
      {renderPointDetails && (
        <div
          className={
            "mt-[0.55rem] flex min-h-[2.8rem] flex-wrap gap-x-4 gap-y-[0.2rem] border-l-2 " +
            "border-[color:var(--scatter-color,#f9e56f)] bg-[#191420] px-3 py-[0.55rem] text-[#dfcedf] " +
            "[&_strong]:text-white"
          }
          aria-live="polite"
        >
          {renderPointDetails(hoveredPoint)}
        </div>
      )}
    </div>
  );
}
