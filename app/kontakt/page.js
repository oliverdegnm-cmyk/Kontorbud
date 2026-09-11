import { Suspense } from "react";
import ContactClient from "./KontaktClient";

export const metadata = {
  title: "Kontakt kundeservice - AIbud",
  description: "Har du et spørgsmål eller brug for hjælp? Dansk kundeservice - vi svarer hurtigst muligt.",
  alternates: { canonical: "https://aibud.dk/kontakt" },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ContactClient />
    </Suspense>
  );
}
