import { Suspense } from "react";
import { D3 } from "@/app/3d/3d";

export default function Page() {
  return (
    <Suspense fallback={"loading data"}>
      <D3 />
    </Suspense>
  );
}
