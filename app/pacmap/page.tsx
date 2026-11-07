import { Suspense } from "react";
import { Pacmap } from "@/app/pacmap/pacmap";

export default function Page() {
  return (
    <Suspense fallback={"loading data"}>
      <Pacmap />
    </Suspense>
  );
}
