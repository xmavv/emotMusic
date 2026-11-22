import {
  emotions,
  scoreFormat,
  type EmotionScores,
} from "@/components/song/song-emotions";

export function SongEmotionScores({ scores }: { scores: EmotionScores }) {
  const entries = emotions.flatMap(([key, label, color]) => {
    const score = scores[key];
    return score != null && Number.isFinite(score)
      ? [{ key, label, color, score }]
      : [];
  });
  if (entries.length === 0) return null;

  return (
    <section>
      <h3 className="text-[1.2rem]">Natężenie emocji i nastroju (0–1)</h3>
      <dl className="mt-[0.4rem]">
        {entries.map(({ key, label, color, score }) => (
          <div
            key={key}
            className={
              "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-2 border-t border-[#3e3045] py-1"
            }
          >
            <dt className="flex items-center gap-2">
              <span
                className="h-[0.45rem] flex-[0_0_0.45rem] rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {label}
            </dt>
            <dd>
              <EmotionScoreBar score={score} color={color} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function EmotionScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <span className="grid grid-cols-[minmax(0,1fr)_5.5em] items-center gap-2 tabular-nums">
      <span className="h-[0.4rem] rounded-sm bg-[#3e3045]" aria-hidden="true">
        <span
          className={
            "block h-full rounded-[inherit] bg-current " +
            "shadow-[0_0_0.4rem_color-mix(in_srgb,currentColor_32%,transparent)]"
          }
          style={{
            width: `${Math.min(1, Math.max(0, score)) * 100}%`,
            color,
            visibility: score > 0 ? undefined : "hidden",
          }}
        />
      </span>
      <span className="col-start-2 text-right">
        {scoreFormat.format(score)}
      </span>
    </span>
  );
}
