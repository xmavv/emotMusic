import { LoadingScreen } from "@/app/components/loading-screen";
import { Suspense } from "react";
import { Pacmap } from "@/app/pacmap/pacmap";

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Pacmap />
    </Suspense>
  );
}
