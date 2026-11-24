import {
  EMOTION_ROW_CLASS,
  EmotionRow,
} from "@/app/worldmap/_components/panel/emotion-row";
import {
  restOfWorld,
  similarityBetween,
  similarityColor,
  similarityLabel,
  type SimilarCountry,
} from "@/app/worldmap/_lib/similarity";
import type { CountryYearStats } from "@/app/worldmap/_data/stats";
import {
  emotionColor,
  PLUTCHIK_EMOTIONS,
  type EmotionValues,
  type PlutchikEmotion,
} from "@/utils/plutchik";

const LISTED_COUNTRIES = 5;
const FULL_BAR_DIFFERENCE = 0.5;

interface NamedSimilarCountry extends SimilarCountry {
  name: string;
}

interface SimilarityDetailsProps {
  stats: CountryYearStats;
  world: CountryYearStats;
  mostSimilarFirst: NamedSimilarCountry[];
  onCountrySelect: (code: string) => void;
}

export function SimilarityDetails({
  stats,
  world,
  mostSimilarFirst,
  onCountrySelect,
}: SimilarityDetailsProps) {
  const rest = restOfWorld(world, stats);
  if (!rest)
    return (
      <p className="mt-5 text-sm text-neutral-400">
        Brak innych krajów do porównania.
      </p>
    );

  const similarity = similarityBetween(stats.averageEmotions, rest);
  const mostSimilar = mostSimilarFirst.slice(0, LISTED_COUNTRIES);
  const leastSimilar = mostSimilarFirst
    .slice(LISTED_COUNTRIES)
    .slice(-LISTED_COUNTRIES)
    .reverse();

  return (
    <>
      <p className="mt-5 flex items-center gap-2 text-sm text-neutral-400">
        <span
          className="size-3 rounded-full"
          style={{ background: similarityColor(similarity) }}
        />
        <span className="text-2xl text-neutral-100">
          {similarityLabel(similarity)}
        </span>
        podobieństwa do reszty świata
      </p>
      <DifferenceList country={stats.averageEmotions} rest={rest} />
      <div className="mt-5 flex gap-6 *:min-w-0 *:flex-1">
        <CountryList
          title="Najbardziej podobne"
          countries={mostSimilar}
          onCountrySelect={onCountrySelect}
        />
        <CountryList
          title="Najmniej podobne"
          countries={leastSimilar}
          onCountrySelect={onCountrySelect}
        />
      </div>
    </>
  );
}

function CountryList({
  title,
  countries,
  onCountrySelect,
}: {
  title: string;
  countries: NamedSimilarCountry[];
  onCountrySelect: (code: string) => void;
}) {
  if (countries.length === 0) return null;

  return (
    <section aria-label={`${title} kraje`}>
      <h3 className="text-sm text-neutral-500">{title}</h3>
      <ul className="mt-1.5">
        {countries.map(({ code, name, similarity }) => (
          <li key={code}>
            <button
              type="button"
              onClick={() => onCountrySelect(code)}
              title={name}
              className="flex w-full cursor-pointer justify-between gap-3 py-0.5 text-left text-sm text-neutral-300 hover:text-neutral-100"
            >
              <span className="truncate">{name}</span>
              <span className="tabular-nums text-neutral-400">
                {similarityLabel(similarity)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
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
      <div className={`${EMOTION_ROW_CLASS} text-xs text-neutral-500`}>
        <span />
        <span className="flex justify-between">
          <span>mniej</span>
          <span>więcej</span>
        </span>
        <span />
      </div>
      <ul className="mt-2 space-y-1.5">
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
    <li className={`${EMOTION_ROW_CLASS} leading-5 text-neutral-300`}>
      <EmotionRow
        emotion={emotion}
        markerPosition="50%"
        value={signedDifference(difference)}
      >
        <span
          className={`absolute inset-y-0 transition-[width] duration-300 ${isMore ? "left-1/2 rounded-r-full" : "right-1/2 rounded-l-full"}`}
          style={{ width: `${barWidth}%`, background: emotionColor(emotion) }}
        />
      </EmotionRow>
    </li>
  );
}

function signedDifference(difference: number): string {
  const size = Math.abs(difference).toFixed(2);
  if (Number(size) === 0) return size;
  return `${difference > 0 ? "+" : "−"}${size}`;
}
