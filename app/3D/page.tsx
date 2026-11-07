import { Suspense } from "react";
import { D3 } from "@/app/3D/3D";

export default function Page() {
  return (
    <Suspense fallback={"loading data"}>
      <D3 />
    </Suspense>
  );
}
