"use client";

import { useZoomPanContext } from "react-simple-maps";
import { FEW_SONGS_PATTERN_ID } from "@/app/worldmap/_constants/map";

const STRIPE_GAP = 4;
const STRIPE_WIDTH = 1.6;

export function FewSongsPattern() {
  const { k: zoom } = useZoomPanContext();

  return (
    <defs>
      <pattern
        id={FEW_SONGS_PATTERN_ID}
        width={STRIPE_GAP}
        height={STRIPE_GAP}
        patternUnits="userSpaceOnUse"
        patternTransform={`rotate(45) scale(${1 / zoom})`}
      >
        <rect
          width={STRIPE_WIDTH}
          height={STRIPE_GAP}
          fill="#0a0a0a"
          fillOpacity={0.6}
        />
      </pattern>
    </defs>
  );
}
