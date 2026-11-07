import { Suspense } from "react";
import { Countriesmap } from "@/app/countriesmap/countriesmap";

export default function Page() {
  return (
    <Suspense fallback={"loading data"}>
      <Countriesmap />
    </Suspense>
  );
}
