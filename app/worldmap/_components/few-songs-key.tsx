import { FEW_SONGS_LIMIT } from "@/app/worldmap/_constants/map";
import { SWATCH_CLASS } from "@/components/legend/constants";

export function FewSongsKey() {
  return (
    <span className="flex items-center gap-1.5 text-neutral-300">
      <span
        className={`${SWATCH_CLASS} bg-[repeating-linear-gradient(135deg,var(--color-neutral-400)_0_2px,var(--color-neutral-800)_2px_4px)]`}
      />
      under {FEW_SONGS_LIMIT} songs
    </span>
  );
}
