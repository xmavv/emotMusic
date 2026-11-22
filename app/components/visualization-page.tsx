import type { ReactNode } from "react";
import Link from "next/link";

export function VisualizationPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main
      className={
        "min-h-screen p-[clamp(1rem,5vw,4rem)] text-[#faf7fb] " +
        "[background:radial-gradient(ellipse_at_90%_0%,#281436,transparent_50%),#080709] scheme-dark"
      }
      lang="pl"
    >
      <header className="relative mx-auto mb-7 max-w-6xl">
        <Link
          href="/"
          className="text-[#dfcedf] underline-offset-[0.25em] hover:underline"
        >
          ← Strona główna
        </Link>
        <div
          className="absolute top-0 right-0 flex h-10 items-end gap-[0.28rem]"
          aria-hidden="true"
        >
          {Array.from({ length: 9 }, (_, index) => (
            <span
              key={index}
              className={
                "h-full w-[0.24rem] rounded-sm bg-[linear-gradient(#60e6e9,#9468ff_53%,#ff65b8)] " +
                "shadow-[0_0_0.6rem_#bc7eff65] [&:nth-child(3n+1)]:h-[30%] [&:nth-child(3n+2)]:h-[65%] " +
                "[&:nth-child(4n)]:h-[83%]"
              }
            />
          ))}
        </div>
        <h1 className="mt-[1.4rem] text-[clamp(2.65rem,7vw,5rem)] leading-none font-light">
          {title}
        </h1>
        {description && (
          <p className="mt-[0.65rem] text-[1.2rem] text-[#d8cbd9]">
            {description}
          </p>
        )}
      </header>
      {children}
    </main>
  );
}
