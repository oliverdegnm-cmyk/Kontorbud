import { Suspense } from "react";
import OpgaverPage from "./OpgaverClient";

export const metadata = {
  title: "Åbne opgaver - Kontorbud",
  description: "Gennemse åbne kontoropgaver fra virksomheder og private i hele Danmark. Filtrér efter kategori, budget og placering.",
  alternates: { canonical: "https://kontorbud.dk/opgaver" },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OpgaverPage />
    </Suspense>
  );
}
