const MAX_DISTANCE_FROM_MAINLAND = 120;

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type Point = [number, number];

function subpaths(svgPath: string): Point[][] {
  return svgPath
    .split("M")
    .filter(Boolean)
    .map((subpath) =>
      subpath
        .replace("Z", "")
        .split("L")
        .map((point) => point.split(",").map(Number) as Point),
    );
}

function boundsOf(points: Point[]): Bounds {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  };
}

function areaOf({ left, top, right, bottom }: Bounds): number {
  return (right - left) * (bottom - top);
}

function distanceBetween(a: Bounds, b: Bounds): number {
  return Math.hypot(
    Math.max(0, b.left - a.right, a.left - b.right),
    Math.max(0, b.top - a.bottom, a.top - b.bottom),
  );
}

export function countryBounds(svgPath: string): Bounds | null {
  const parts = subpaths(svgPath).map((points) => ({
    points,
    bounds: boundsOf(points),
  }));
  if (parts.length === 0) return null;

  const mainland = parts.reduce((largest, part) =>
    areaOf(part.bounds) > areaOf(largest.bounds) ? part : largest,
  );
  const nearbyParts = parts.filter(
    (part) =>
      distanceBetween(mainland.bounds, part.bounds) <=
      MAX_DISTANCE_FROM_MAINLAND,
  );

  return boundsOf(nearbyParts.flatMap(({ points }) => points));
}
