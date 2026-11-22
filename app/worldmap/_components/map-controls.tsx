import type { ColorMode } from "@/app/worldmap/_lib/similarity";

const COLOR_MODES: { mode: ColorMode; label: string }[] = [
  { mode: "strongest", label: "Strongest" },
  { mode: "similarity", label: "Similarity" },
];

interface MapControlsProps {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

export function MapControls({
  colorMode,
  onColorModeChange,
}: MapControlsProps) {
  return (
    <div
      role="group"
      aria-label="Color countries by"
      className="flex rounded-full border border-neutral-700 bg-neutral-950 p-0.5 text-xs text-neutral-400"
    >
      {COLOR_MODES.map(({ mode, label }) => (
        <button
          key={mode}
          type="button"
          aria-pressed={mode === colorMode}
          onClick={() => onColorModeChange(mode)}
          className={`cursor-pointer rounded-full px-2.5 py-0.5 ${mode === colorMode ? "bg-neutral-800 text-neutral-100" : "hover:text-neutral-100"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
