import { Suspense } from "react";
import { Songs } from "@/app/spiderchart/songs";
import { LoadingScreen } from "@/components/loading-screen/loading-screen";

export default function Layout({ children }: LayoutProps<"/spiderchart">) {
  return (
    <main className="h-screen w-screen grid grid-cols-4">
      <Suspense fallback={<LoadingScreen />}>
        <Songs />
      </Suspense>
      <div className="col-span-3">{children}</div>
    </main>
  );
}
