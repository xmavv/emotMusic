import { FewSongsKey } from "@/app/worldmap/_components/few-songs-key";
import { SIMILARITY_COLORS } from "@/app/worldmap/_lib/similarity";
import { LEGEND_CLASS } from "@/components/legend/constants";

export function SimilarityScale() {
  return (
    <div className={LEGEND_CLASS}>
      <div className="flex w-full max-w-xl items-center gap-3 text-neutral-300">
        different
        <span className="flex h-2 flex-1 overflow-hidden rounded-full">
          {SIMILARITY_COLORS.map((color) => (
            <span
              key={color}
              className="flex-1"
              style={{ background: color }}
            />
          ))}
        </span>
        like the rest of the world
      </div>
      <FewSongsKey />
    </div>
  );
}
