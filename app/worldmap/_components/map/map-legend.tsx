"use client";

import { SIMILARITY_COLORS } from "@/app/worldmap/_lib/similarity";
import { Legend, LEGEND_CLASS } from "@/components/legend/legend";
import type { PlutchikEmotion } from "@/utils/plutchik";

interface MapLegendProps {
  isSimilarity: boolean;
  active: PlutchikEmotion[];
  onToggle: (emotion: PlutchikEmotion) => void;
}

export function MapLegend({ isSimilarity, active, onToggle }: MapLegendProps) {
  return (
    <div className="grid *:[grid-area:1/1]">
      <div className={isSimilarity ? "invisible" : undefined}>
        <Legend active={active} onToggle={onToggle} />
      </div>
      {isSimilarity && <SimilarityScale />}
    </div>
  );
}

function SimilarityScale() {
  return (
    <div className={LEGEND_CLASS}>
      <div className="flex w-full max-w-xl items-center gap-3 text-neutral-300">
        odmienne
        <span className="flex h-2 flex-1 overflow-hidden rounded-full">
          {SIMILARITY_COLORS.map((color) => (
            <span
              key={color}
              className="flex-1"
              style={{ background: color }}
            />
          ))}
        </span>
        podobne do reszty świata
      </div>
    </div>
  );
}
