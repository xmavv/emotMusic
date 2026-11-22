import type { Artist, SongEmotion } from "@/services/supabase/tables";
import { getSongGenres, getSongDate } from "@/utils/songs";
import { DetailsModal } from "@/components/details-modal/details-modal";
import { SongEmotionScores } from "@/components/song/song-emotion-scores";
import { dateFormat } from "@/components/song/song-emotions";

const countryNames = new Intl.DisplayNames("pl", {
  type: "region",
  fallback: "none",
});

export function SongDetailsModal({
  song,
  artist,
}: {
  song: SongEmotion;
  artist?: Artist | null;
}) {
  const date = getSongDate(song);
  const country = artist?.country?.trim();
  const countryName =
    country && /^[a-z]{2}$/i.test(country)
      ? (countryNames.of(country.toUpperCase()) ?? country)
      : country;

  return (
    <DetailsModal
      title={song.name || "Utwór bez tytułu"}
      triggerLabel="Szczegóły utworu"
      sections={{
        Wykonawca: {
          Nazwa: artist?.artist?.trim(),
          Kraj: countryName,
          "Miejsce urodzenia": artist?.birthplace?.trim(),
          Region: artist?.area?.trim(),
        },
        Utwór: {
          Album: song.album,
          "Data wydania": Number.isFinite(date)
            ? dateFormat.format(date)
            : null,
          "Czas trwania": song.length,
          Gatunki: getSongGenres(song, { preserveCase: true }).join(", "),
        },
      }}
    >
      {song.SongsEmotions && <SongEmotionScores scores={song.SongsEmotions} />}
    </DetailsModal>
  );
}
