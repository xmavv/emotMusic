import Link from "next/link";
import type { ReactNode } from "react";

interface WorldmapLayoutProps {
  controls?: ReactNode;
  map: ReactNode;
  footer: ReactNode;
  loading?: boolean;
}

export function WorldmapLayout({
  controls,
  map,
  footer,
  loading = false,
}: WorldmapLayoutProps) {
  return (
    <main
      aria-busy={loading || undefined}
      className="relative flex min-h-screen w-full flex-col bg-neutral-950 text-neutral-100 lg:h-screen"
    >
      <header className="absolute left-5 top-2 z-10 flex h-8 items-center gap-4">
        <Link
          href="/"
          aria-label="Back"
          className="text-neutral-500 hover:text-neutral-100"
        >
          <svg
            viewBox="0 0 20 20"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M18 10H2M8 4l-6 6 6 6" />
          </svg>
        </Link>
        {controls}
      </header>

      <section className="relative flex flex-1 flex-col justify-center px-4 pt-10 lg:min-h-0 lg:px-6 lg:pb-2">
        {map}
      </section>

      <footer aria-hidden={loading || undefined} className="px-4 pb-6">
        {footer}
      </footer>
    </main>
  );
}
