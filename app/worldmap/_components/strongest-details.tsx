import { useState } from "react";
import { SongList } from "@/app/worldmap/_components/song-list";
import type { CountryYearStats } from "@/app/worldmap/_data/stats";
import type { GenreGroup } from "@/utils/genres";
import { emotionColor, type PlutchikEmotion } from "@/utils/plutchik";

interface StrongestDetailsProps {
  code: string;
  year: number | null;
  genre: GenreGroup | null;
  stats: CountryYearStats;
  world: CountryYearStats;
  active: PlutchikEmotion[];
}

export function StrongestDetails({
  code,
  year,
  genre,
  stats,
  world,
  active,
}: StrongestDetailsProps) {
  const [chosenEmotion, setChosenEmotion] = useState<PlutchikEmotion | null>(
    null,
  );
  const sortEmotion =
    chosenEmotion && active.includes(chosenEmotion) ? chosenEmotion : null;
  const emotions = strongestFirst(stats, active);

  return (
    <>
      <EmotionProfile
        stats={stats}
        world={world}
        emotions={emotions}
        sortEmotion={sortEmotion}
        onSortChange={setChosenEmotion}
      />
      <section
        aria-label="Songs"
        className="mt-5 lg:flex lg:min-h-48 lg:flex-1 lg:flex-col"
      >
        <SortHeader
          sortEmotion={sortEmotion}
          defaultEmotion={emotions[0]}
          onSortChange={setChosenEmotion}
        />
        <SongList
          key={`${year}-${genre}-${sortEmotion}`}
          country={code}
          year={year}
          genre={genre}
          songCount={stats.songCount}
          sortEmotion={sortEmotion}
          active={active}
        />
      </section>
    </>
  );
}

interface SortProps {
  sortEmotion: PlutchikEmotion | null;
  onSortChange: (emotion: PlutchikEmotion | null) => void;
}

function SortHeader({
  sortEmotion,
  defaultEmotion,
  onSortChange,
}: SortProps & { defaultEmotion: PlutchikEmotion | undefined }) {
  const strongestEmotion = sortEmotion ?? defaultEmotion;
  const buttonClass = (isPressed: boolean) =>
    `cursor-pointer hover:text-neutral-100 ${isPressed ? "text-neutral-100" : "text-neutral-500"}`;

  return (
    <div className="flex items-baseline justify-between text-sm text-neutral-500">
      <h3>Songs</h3>
      <div className="flex gap-3 text-xs">
        <button
          type="button"
          aria-pressed={sortEmotion === null}
          onClick={() => onSortChange(null)}
          className={buttonClass(sortEmotion === null)}
        >
          Newest
        </button>
        {strongestEmotion && (
          <button
            type="button"
            aria-pressed={sortEmotion !== null}
            onClick={() => onSortChange(strongestEmotion)}
            className={buttonClass(sortEmotion !== null)}
          >
            Most {strongestEmotion}
          </button>
        )}
      </div>
    </div>
  );
}

function EmotionProfile({
  stats,
  world,
  emotions,
  sortEmotion,
  onSortChange,
}: SortProps & {
  stats: CountryYearStats;
  world: CountryYearStats;
  emotions: PlutchikEmotion[];
}) {
  return (
    <>
      <ul className="mt-5 space-y-2">
        {emotions.map((emotion) => (
          <EmotionBar
            key={emotion}
            emotion={emotion}
            value={stats.averageEmotions[emotion]}
            worldValue={world.averageEmotions[emotion]}
            isSorting={emotion === sortEmotion}
            onClick={() =>
              onSortChange(emotion === sortEmotion ? null : emotion)
            }
          />
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
        <span className="h-3 w-0.5 bg-neutral-100" />
        world average
      </p>
    </>
  );
}

function EmotionBar({
  emotion,
  value,
  worldValue,
  isSorting,
  onClick,
}: {
  emotion: PlutchikEmotion;
  value: number;
  worldValue: number;
  isSorting: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSorting}
        title={`Sort songs by ${emotion}`}
        className={`grid w-full cursor-pointer grid-cols-[6rem_1fr_2rem] items-center gap-2 text-left text-sm leading-5 hover:text-neutral-100 ${isSorting ? "font-semibold text-neutral-100" : "text-neutral-300"}`}
      >
        <span>{emotion}</span>
        <span className="relative h-2 rounded-full bg-neutral-800">
          <span
            className="block h-full rounded-full transition-[width] duration-300"
            style={{
              width: toPercent(value),
              background: emotionColor(emotion),
            }}
          />
          <span
            className="absolute -inset-y-0.5 w-0.5 -translate-x-1/2 bg-neutral-100 transition-[left] duration-300"
            style={{ left: toPercent(worldValue) }}
          />
        </span>
        <span className="text-right tabular-nums text-neutral-400">
          {value.toFixed(2)}
        </span>
      </button>
    </li>
  );
}

const strongestFirst = (
  { averageEmotions }: CountryYearStats,
  active: PlutchikEmotion[],
) => [...active].sort((a, b) => averageEmotions[b] - averageEmotions[a]);

const toPercent = (value: number) =>
  `${Math.min(1, Math.max(0, value)) * 100}%`;
