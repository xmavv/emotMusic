import {
  restOfWorld,
  similarityBetween,
  similarityColor,
  type SimilarCountry,
} from "@/app/worldmap/_lib/similarity";
import type { CountryYearStats } from "@/app/worldmap/_data/stats";
import {
  emotionColor,
  PLUTCHIK_EMOTIONS,
  type EmotionValues,
  type PlutchikEmotion,
} from "@/utils/plutchik";

const FULL_BAR_DIFFERENCE = 0.5;
const DIFFERENCE_ROW_CLASS =
  "grid grid-cols-[6rem_1fr_2.5rem] items-center gap-2";

export interface NamedSimilarCountry extends SimilarCountry {
  name: string;
}

interface SimilarityDetailsProps {
  stats: CountryYearStats;
  world: CountryYearStats;
  mostSimilar: NamedSimilarCountry[];
  onCountrySelect: (code: string) => void;
}

export function SimilarityDetails({
  stats,
  world,
  mostSimilar,
  onCountrySelect,
}: SimilarityDetailsProps) {
  const rest = restOfWorld(world, stats);
  if (!rest)
    return (
      <p className="mt-5 text-sm text-neutral-400">
        No other countries to compare with.
      </p>
    );

  const similarity = similarityBetween(stats.averageEmotions, rest);

  return (
    <>
      <p className="mt-5 flex items-center gap-2 text-sm text-neutral-400">
        <span
          className="size-3 rounded-full"
          style={{ background: similarityColor(similarity) }}
        />
        <span className="text-2xl text-neutral-100">
          {toWholePercent(similarity)}
        </span>
        like the rest of the world
      </p>
      <DifferenceList country={stats.averageEmotions} rest={rest} />
      {mostSimilar.length > 0 && (
        <section aria-label="Most similar countries" className="mt-6">
          <h3 className="text-sm text-neutral-500">Most similar</h3>
          <ul className="mt-2">
            {mostSimilar.map(({ code, name, similarity }) => (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => onCountrySelect(code)}
                  className="flex w-full cursor-pointer justify-between gap-3 py-1.5 text-left text-sm text-neutral-300 hover:text-neutral-100"
                >
                  <span className="truncate">{name}</span>
                  <span className="tabular-nums text-neutral-400">
                    {toWholePercent(similarity)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function DifferenceList({
  country,
  rest,
}: {
  country: EmotionValues;
  rest: EmotionValues;
}) {
  const differences = PLUTCHIK_EMOTIONS.map((emotion) => ({
    emotion,
    difference: country[emotion] - rest[emotion],
  })).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  return (
    <div className="mt-4 text-sm">
      <div className={`${DIFFERENCE_ROW_CLASS} text-xs text-neutral-500`}>
        <span />
        <span className="flex justify-between">
          <span>less</span>
          <span>more</span>
        </span>
        <span />
      </div>
      <ul className="mt-2 space-y-2">
        {differences.map((row) => (
          <DifferenceRow key={row.emotion} {...row} />
        ))}
      </ul>
    </div>
  );
}

function DifferenceRow({
  emotion,
  difference,
}: {
  emotion: PlutchikEmotion;
  difference: number;
}) {
  const barWidth = Math.min(1, Math.abs(difference) / FULL_BAR_DIFFERENCE) * 50;
  const isMore = difference > 0;

  return (
    <li className={`${DIFFERENCE_ROW_CLASS} leading-5 text-neutral-300`}>
      <span>{emotion}</span>
      <span className="relative h-2 bg-neutral-800">
        <span
          className={`absolute inset-y-0 transition-[width] duration-300 ${isMore ? "left-1/2 rounded-r-full" : "right-1/2 rounded-l-full"}`}
          style={{ width: `${barWidth}%`, background: emotionColor(emotion) }}
        />
        <span className="absolute -inset-y-0.5 left-1/2 w-0.5 -translate-x-1/2 bg-neutral-100" />
      </span>
      <span className="text-right tabular-nums text-neutral-400">
        {signedDifference(difference)}
      </span>
    </li>
  );
}

const toWholePercent = (similarity: number) =>
  `${Math.round(similarity * 100)}%`;

function signedDifference(difference: number): string {
  const size = Math.abs(difference).toFixed(2);
  if (Number(size) === 0) return size;
  return `${difference > 0 ? "+" : "−"}${size}`;
}
