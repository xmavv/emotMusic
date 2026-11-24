import { LoadingScreen } from "@/components/loading-screen/loading-screen";
import { Suspense } from "react";
import { D3 } from "@/app/3d/3d";

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <D3 />
    </Suspense>
  );
}
