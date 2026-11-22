import Link from "next/link";
import type { Artist, SongEmotion } from "@/services/supabase/supabaseTables";
import { getSongGenres, getSongDate } from "@/lib/songs";
import { DetailsModal, type DetailSectionsData } from "./details-modal";
import { EmotionRadar } from "./emotion-radar";
import { SongEmotionScores } from "./song-emotion-scores";
import { dateFormat } from "./song-emotions";

const countryNames = new Intl.DisplayNames("pl", {
  type: "region",
  fallback: "none",
});

export const songRadarColor = "#f4a6f0";

export function getSongDetailSections(
  song: SongEmotion,
  artist?: Artist | null,
): DetailSectionsData {
  const date = getSongDate(song);
  const country = artist?.country?.trim();
  const countryName =
    country && /^[a-z]{2}$/i.test(country)
      ? (countryNames.of(country.toUpperCase()) ?? country)
      : country;

  return {
    Wykonawca: {
      Nazwa: artist?.artist?.trim(),
      Kraj: countryName,
      "Miejsce urodzenia": artist?.birthplace?.trim(),
      Region: artist?.area?.trim(),
    },
    Utwór: {
      Album: song.album,
      "Data wydania": Number.isFinite(date) ? dateFormat.format(date) : null,
      "Czas trwania": song.length,
      Gatunki: getSongGenres(song, { preserveCase: true }).join(", "),
    },
  };
}

export function SongDetailsModal({
  song,
  artist,
  triggerLabel = "Szczegóły utworu",
}: {
  song: SongEmotion;
  artist?: Artist | null;
  triggerLabel?: string;
}) {
  const title = song.name || "Utwór bez tytułu";

  return (
    <DetailsModal
      title={title}
      triggerLabel={triggerLabel}
      sections={getSongDetailSections(song, artist)}
    >
      {song.SongsEmotions && (
        <>
          <EmotionRadar
            series={[
              {
                label: title,
                color: songRadarColor,
                scores: song.SongsEmotions,
              },
            ]}
            label={`Wykres radarowy emocji: ${title}`}
          />
          <SongEmotionScores scores={song.SongsEmotions} />
        </>
      )}
      <Link
        href={`/spiderchart/${song.id}`}
        className="mt-4 inline-block text-[#f4a6f0] underline-offset-[0.25em] hover:underline"
      >
        Otwórz profil utworu →
      </Link>
    </DetailsModal>
  );
}
