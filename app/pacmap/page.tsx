import { LoadingScreen } from "@/components/loading-screen/loading-screen";
import { Suspense } from "react";
import { Pacmap } from "@/app/pacmap/pacmap";

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Pacmap />
    </Suspense>
  );
}
