import type { CountryYearStats } from "@/app/worldmap/_data/stats";
import { similarityLabel } from "@/app/worldmap/_lib/similarity";
import {
  emotionColor,
  type EmotionValues,
  type PlutchikEmotion,
} from "@/utils/plutchik";
import { shares } from "@/utils/shares";

const TOOLTIP_WIDTH = 176;
const CURSOR_GAP = 14;

export interface MapHover {
  code: string;
  name: string;
  x: number;
  y: number;
  mapWidth: number;
}

interface CountryTooltipProps {
  hover: MapHover;
  stats: CountryYearStats;
  similarity?: number;
  active: PlutchikEmotion[];
}

function tooltipLeft({ x, mapWidth }: MapHover): number {
  const rightOfCursor = x + CURSOR_GAP;
  const leftOfCursor = x - CURSOR_GAP - TOOLTIP_WIDTH;
  const fitsOnRight = rightOfCursor + TOOLTIP_WIDTH <= mapWidth;
  return fitsOnRight ? rightOfCursor : Math.max(0, leftOfCursor);
}

export function CountryTooltip({
  hover,
  stats,
  similarity,
  active,
}: CountryTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg bg-neutral-900/90 px-3 py-2 text-sm backdrop-blur"
      style={{
        width: TOOLTIP_WIDTH,
        left: tooltipLeft(hover),
        top: hover.y + CURSOR_GAP,
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate">{hover.name}</span>
        <span className="text-xs text-neutral-500">{stats.songCount}</span>
      </div>
      {similarity !== undefined && (
        <p className="text-xs text-neutral-400">
          {similarityLabel(similarity)} podobieństwa do reszty
        </p>
      )}
      <ShareBar emotions={stats.averageEmotions} active={active} />
    </div>
  );
}

function ShareBar({
  emotions,
  active,
}: {
  emotions: EmotionValues;
  active: PlutchikEmotion[];
}) {
  return (
    <div className="mt-1.5 flex h-1 w-full overflow-hidden rounded-full bg-neutral-800">
      {shares(emotions, active).map(({ emotion, share }) => (
        <span
          key={emotion}
          style={{
            width: `${share * 100}%`,
            background: emotionColor(emotion),
          }}
        />
      ))}
    </div>
  );
}
