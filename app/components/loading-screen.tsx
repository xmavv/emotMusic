"use client";

import { useEffect, useId, useRef } from "react";

const delays = [-150, -400, -680, -920, -560, -260, -750, -500, -120];

export function LoadingScreen() {
  const labelId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const equalizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const equalizer = equalizerRef.current;
    dialog?.showModal();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];

    function updateAnimations() {
      for (const animation of animations) animation.cancel();
      animations = [];
      if (reducedMotion.matches || !equalizer) return;

      for (const [index, bar] of Array.from(equalizer.children).entries()) {
        animations.push(
          bar.animate([{ scale: "1 0.22" }, { scale: "1 1" }], {
            duration: 1150,
            delay: delays[index],
            easing: "ease-in-out",
            iterations: Infinity,
            direction: "alternate",
          }),
        );
      }
    }

    updateAnimations();
    reducedMotion.addEventListener("change", updateAnimations);

    return () => {
      reducedMotion.removeEventListener("change", updateAnimations);
      for (const animation of animations) animation.cancel();
      dialog?.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={
        "fixed inset-0 z-[100] m-0 grid size-full max-h-none max-w-none place-items-center " +
        "overflow-hidden overscroll-contain bg-[radial-gradient(ellipse_at_center,#24142d,#080709_65%)] " +
        "p-6 text-[#faf7fb] [html:has(&[open])]:overflow-hidden"
      }
      aria-labelledby={labelId}
      onCancel={(event) => event.preventDefault()}
    >
      <div className="grid justify-items-center gap-6" role="status">
        <div
          ref={equalizerRef}
          className="flex h-[4.5rem] items-end gap-[clamp(0.3rem,1.6vw,0.55rem)]"
          aria-hidden="true"
        >
          {delays.map((delay) => (
            <span
              className={
                "h-full w-[clamp(0.3rem,1.8vw,0.52rem)] origin-bottom rounded-2xl " +
                "bg-[linear-gradient(#71f0f4,#9875ff_55%,#ff79c5)] shadow-[0_0_0.8rem_#bf77ff65] " +
                "scale-y-40 motion-reduce:[&:nth-child(3n+2)]:scale-y-65 " +
                "motion-reduce:[&:nth-child(3n)]:scale-y-90"
              }
              key={delay}
            />
          ))}
        </div>
        <p
          id={labelId}
          className={
            "pl-[0.3em] text-[clamp(1.4rem,4vw,2rem)] font-light tracking-[0.3em] uppercase"
          }
          lang="pl"
        >
          Ładowanie
        </p>
      </div>
    </dialog>
  );
}
