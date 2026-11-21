import type { MapHover } from "@/app/worldmap/_components/worldmap";
import type { CountryYearStats } from "@/app/worldmap/_data/stats";
import {
  emotionColor,
  type EmotionValues,
  type PlutchikEmotion,
} from "@/utils/plutchik";
import { shares } from "@/utils/shares";

interface CountryTooltipProps {
  hover: MapHover;
  stats: CountryYearStats;
  active: PlutchikEmotion[];
}

export function CountryTooltip({ hover, stats, active }: CountryTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-10 w-44 rounded-lg bg-neutral-900/90 px-3 py-2 text-sm backdrop-blur"
      style={{ left: hover.x + 14, top: hover.y + 14 }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate">{hover.name}</span>
        <span className="text-xs text-neutral-500">{stats.songCount}</span>
      </div>
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
