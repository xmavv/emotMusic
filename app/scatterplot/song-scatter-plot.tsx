import type { SongEmotion } from "@/services/supabase/tables";
import { dateFormat, emotions, scoreFormat } from "@/app/components/song-emotions";
import { Scatterplot } from "@/app/components/scatterplot";
import { getSongGenres, getSongDate } from "@/lib/songs";

export function SongScatterPlot({
  songs,
  emotion: [key, label, color],
  isSongVisible,
  trackedId,
  onSongSelect,
}: {
  songs: readonly SongEmotion[];
  emotion: (typeof emotions)[number];
  isSongVisible?: (song: SongEmotion) => boolean;
  trackedId?: number;
  onSongSelect?: (id: number) => void;
}) {
  const datedSongs = getDatedSongScores(songs, key);
  const points = getVisibleSongPoints(datedSongs, isSongVisible);
  const years = points.length > 0 ? getReleaseYearTicks(datedSongs) : undefined;

  return (
    <>
      <div
        className={
          "mt-[1.65rem] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t " +
          "border-[#322638] pt-[0.9rem] text-[#cdbed0]"
        }
      >
        <h2 className="text-[1.9rem] font-normal text-[color:var(--accent)]">{label}</h2>
        <span role="status">Liczba utworów: {points.length}</span>
      </div>
      <Scatterplot
        color={color}
        xAxis={{
          label: "Data wydania",
          ticks: years,
          formatTick: (time) => new Date(time).getUTCFullYear(),
        }}
        yAxis={{
          label: "Natężenie (0–1)",
          ticks: [0, 0.25, 0.5, 0.75, 1],
          formatTick: (value) => scoreFormat.format(value),
        }}
        points={points}
        label={`Wykres punktowy: ${label}`}
        selectedId={trackedId}
        onPointSelect={onSongSelect && ((point) => onSongSelect(point.id))}
        emptyMessage="Brak wyników dla tego wyboru."
        renderPointDetails={(point) =>
          point ? (
            <>
              <strong>{point.name || "Utwór bez tytułu"}</strong>
              <span>{dateFormat.format(point.x)}</span>
              {point.genres.length > 0 && <span>{point.genres.join(", ")}</span>}
              <span>
                {label}: {scoreFormat.format(point.y)}
              </span>
            </>
          ) : (
            onSongSelect && "Kliknij punkt, aby przypiąć utwór."
          )
        }
      />
    </>
  );
}

type DatedSongScore = { song: SongEmotion; x: number; y: number | null };

function getDatedSongScores(songs: readonly SongEmotion[], key: (typeof emotions)[number][0]): DatedSongScore[] {
  const datedSongs: DatedSongScore[] = [];

  for (const song of songs) {
    const x = getSongDate(song);
    if (!song.SongsEmotions || !Number.isFinite(x)) continue;

    datedSongs.push({ song, x, y: song.SongsEmotions[key] });
  }

  datedSongs.sort((a, b) => a.x - b.x || a.song.id - b.song.id);

  return datedSongs;
}

function getVisibleSongPoints(datedSongs: readonly DatedSongScore[], isSongVisible?: (song: SongEmotion) => boolean) {
  const points = [];

  for (const { song, x, y } of datedSongs) {
    if (y === null || !Number.isFinite(y) || (isSongVisible && !isSongVisible(song))) continue;

    points.push({ id: song.id, name: song.name, genres: getSongGenres(song), x, y });
  }

  return points;
}

function getReleaseYearTicks(datedSongs: readonly DatedSongScore[]) {
  const firstYear = new Date(datedSongs[0]?.x ?? 0).getUTCFullYear();
  const lastYear = new Date(datedSongs.at(-1)?.x ?? 0).getUTCFullYear();
  const yearStep = Math.max(1, Math.ceil((lastYear - firstYear + 1) / 4));

  const ticks: number[] = [];
  for (let index = 0; index < 5; index++) {
    ticks.push(Date.UTC(firstYear + index * yearStep, 0, 1));
  }

  return ticks;
}
