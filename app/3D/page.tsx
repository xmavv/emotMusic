import { LoadingScreen } from "@/app/components/loading-screen";
import { Suspense } from "react";
import { D3 } from "@/app/3D/3D";

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <D3 />
    </Suspense>
  );
}
