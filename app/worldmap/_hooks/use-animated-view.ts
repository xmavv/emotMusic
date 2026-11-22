import { useCallback, useEffect, useRef, useState } from "react";
import { viewBetween, type MapView } from "@/app/worldmap/_lib/map-view";

const ZOOM_DURATION_MS = 700;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const easeInOut = (progress: number) =>
  progress < 0.5 ? 4 * progress ** 3 : 1 - (2 - 2 * progress) ** 3 / 2;

export function useAnimatedView(target: MapView) {
  const [view, setView] = useState(target);
  const currentView = useRef(target);
  const animationFrame = useRef(0);

  const stopAnimation = useCallback(
    () => cancelAnimationFrame(animationFrame.current),
    [],
  );

  const trackUserMove = useCallback((movedView: MapView) => {
    currentView.current = movedView;
  }, []);

  useEffect(() => {
    if (currentView.current === target) return;

    const from = currentView.current;
    const startTime = performance.now();
    const duration = window.matchMedia(REDUCED_MOTION_QUERY).matches
      ? 0
      : ZOOM_DURATION_MS;

    const animate = (now: number) => {
      const progress = duration
        ? Math.min(1, Math.max(0, (now - startTime) / duration))
        : 1;
      currentView.current =
        progress < 1 ? viewBetween(from, target, easeInOut(progress)) : target;
      setView(currentView.current);
      if (progress < 1) animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);
    return stopAnimation;
  }, [target, stopAnimation]);

  return { view, stopAnimation, trackUserMove };
}
