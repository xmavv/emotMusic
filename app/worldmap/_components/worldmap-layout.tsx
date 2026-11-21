import Link from "next/link";
import type { ReactNode } from "react";

interface WorldmapLayoutProps {
  map: ReactNode;
  footer: ReactNode;
  loading?: boolean;
  onMapMouseLeave?: () => void;
}

export function WorldmapLayout({
  map,
  footer,
  loading = false,
  onMapMouseLeave,
}: WorldmapLayoutProps) {
  return (
    <main
      aria-busy={loading || undefined}
      className="relative flex min-h-screen w-full flex-col bg-neutral-950 text-neutral-100 lg:h-screen"
    >
      <Link
        href="/"
        aria-label="Back"
        className="absolute left-5 top-4 z-10 text-xl text-neutral-500 hover:text-neutral-100"
      >
        ←
      </Link>

      <section
        onMouseLeave={onMapMouseLeave}
        className="relative flex flex-1 flex-col justify-center px-4 pt-10 lg:min-h-0 lg:px-6 lg:pb-2"
      >
        {map}
      </section>

      <footer aria-hidden={loading || undefined} className="px-4 pb-6">
        {footer}
      </footer>
    </main>
  );
}
