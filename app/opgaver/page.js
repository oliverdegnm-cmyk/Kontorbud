import { Suspense } from "react";
import OpgaverPage from "./OpgaverClient";

export const metadata = {
  title: "Åbne opgaver - AIbud",
  description: "Gennemse åbne AI-opgaver fra virksomheder og private i hele Danmark. Filtrér efter kategori, budget og placering.",
  alternates: { canonical: "https://aibud.dk/opgaver" },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OpgaverPage />
    </Suspense>
  );
}
