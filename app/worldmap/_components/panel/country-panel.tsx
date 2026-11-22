import type { CSSProperties, ReactNode } from "react";
import { PANEL_WIDTH } from "@/app/worldmap/_constants";
import { ALL_TIME_LABEL } from "@/components/timeline/timeline";

const PANEL_WIDTH_VARIABLE = {
  "--panel-width": `${PANEL_WIDTH}px`,
} as CSSProperties;

const pluralRules = new Intl.PluralRules("pl");
const SONG_PLURALS: Record<Intl.LDMLPluralRule, string> = {
  zero: "utworów",
  one: "utwór",
  two: "utwory",
  few: "utwory",
  many: "utworów",
  other: "utworu",
};

interface CountryPanelProps {
  name: string;
  year: number | null;
  genreLabel: string | undefined;
  songCount: number;
  onClose: () => void;
  children: ReactNode;
}

export function CountryPanel({
  name,
  year,
  genreLabel,
  songCount,
  onClose,
  children,
}: CountryPanelProps) {
  return (
    <aside
      aria-label={name}
      style={PANEL_WIDTH_VARIABLE}
      className="z-20 mt-6 w-full rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 backdrop-blur transition duration-500 lg:absolute lg:inset-y-4 lg:right-6 lg:mt-0 lg:w-(--panel-width) lg:flex lg:flex-col lg:overflow-y-auto starting:translate-x-4 starting:opacity-0"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl">{name}</h2>
          <p className="text-sm text-neutral-500">
            {year ?? ALL_TIME_LABEL}
            {genreLabel && ` · ${genreLabel}`}
            {songCount > 0 && ` · ${songCountLabel(songCount)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Wróć do mapy świata"
          className="cursor-pointer text-xl text-neutral-500 hover:text-neutral-100"
        >
          ✕
        </button>
      </header>

      {songCount > 0 ? (
        children
      ) : (
        <p className="mt-5 text-sm text-neutral-400">
          Brak utworów
          {genreLabel && ` z gatunku „${genreLabel}”`}
          {year && ` w roku ${year}`}.
        </p>
      )}
    </aside>
  );
}

const songCountLabel = (count: number) =>
  `${count} ${SONG_PLURALS[pluralRules.select(count)]}`;
