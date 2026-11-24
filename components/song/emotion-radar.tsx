import {
  dominantEmotions,
  scoreFormat,
  type EmotionScores,
} from "./song-emotions";

export type RadarSeries = {
  label: string;
  color: string;
  scores: EmotionScores;
  dashed?: boolean;
};

// Plutchik's wheel order puts opposite emotions on opposite axes.
const wheelOrder: readonly string[] = [
  "joy",
  "trust",
  "fear",
  "surprise",
  "sadness",
  "disgust",
  "anger",
  "anticipation",
];
const axes = [...dominantEmotions].sort(
  (a, b) => wheelOrder.indexOf(a[0]) - wheelOrder.indexOf(b[0]),
);
const radius = 100;
const rings = [0.25, 0.5, 0.75, 1];

function getPoint(index: number, value: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / axes.length;
  return [
    Math.cos(angle) * radius * value,
    Math.sin(angle) * radius * value,
  ] as const;
}

function getPolygon(values: readonly number[]) {
  return values
    .map((value, index) => getPoint(index, value).join(","))
    .join(" ");
}

function getScore(scores: EmotionScores, key: (typeof axes)[number][0]) {
  const value = scores[key];
  return value != null && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : 0;
}

export function EmotionRadar({
  series,
  label = "Wykres radarowy emocji",
}: {
  series: readonly RadarSeries[];
  label?: string;
}) {
  return (
    <figure className="my-2">
      <svg
        viewBox="-190 -135 380 270"
        className="mx-auto block w-full max-w-[34rem]"
        role="img"
        aria-label={label}
      >
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={getPolygon(axes.map(() => ring))}
            className="fill-none stroke-[#392c40]"
          />
        ))}
        {axes.map(([key], index) => {
          const [x, y] = getPoint(index, 1);
          return (
            <line
              key={key}
              x1={0}
              y1={0}
              x2={x}
              y2={y}
              className="stroke-[#392c40]"
            />
          );
        })}
        {rings.map((ring) => (
          <text
            key={ring}
            x={4}
            y={-radius * ring}
            fontSize={10}
            dominantBaseline="middle"
            className="fill-[#8f7f95]"
          >
            {scoreFormat.format(ring)}
          </text>
        ))}
        {series.map(({ label: seriesLabel, color, scores, dashed }) => (
          <g key={seriesLabel}>
            <polygon
              points={getPolygon(axes.map(([key]) => getScore(scores, key)))}
              fill={color}
              fillOpacity={dashed ? 0.06 : 0.2}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={dashed ? "5 4" : undefined}
              strokeLinejoin="round"
            />
            {axes.map(([key, emotionLabel], index) => {
              const [x, y] = getPoint(index, getScore(scores, key));
              const value = scores[key];
              return (
                <circle key={key} cx={x} cy={y} r={3} fill={color}>
                  <title>
                    {`${seriesLabel} · ${emotionLabel}: ${
                      value != null && Number.isFinite(value)
                        ? scoreFormat.format(value)
                        : "brak danych"
                    }`}
                  </title>
                </circle>
              );
            })}
          </g>
        ))}
        {axes.map(([key, emotionLabel, color], index) => {
          const [x, y] = getPoint(index, 1.16);
          return (
            <text
              key={key}
              x={x}
              y={y}
              fontSize={12}
              fill={color}
              textAnchor={Math.abs(x) < 1 ? "middle" : x > 0 ? "start" : "end"}
              dominantBaseline="middle"
            >
              {emotionLabel}
            </text>
          );
        })}
      </svg>
      {series.length > 1 && (
        <figcaption className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[#dfcedf]">
          {series.map(({ label: seriesLabel, color, dashed }) => (
            <span key={seriesLabel} className="flex items-center gap-2">
              <span
                className="w-5 border-t-2"
                style={{
                  borderColor: color,
                  borderTopStyle: dashed ? "dashed" : "solid",
                }}
                aria-hidden="true"
              />
              {seriesLabel}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
