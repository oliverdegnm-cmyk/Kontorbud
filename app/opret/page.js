import PostTaskClient from "./PostTaskClient";

export const metadata = {
  title: "Opret opgave - Kontorbud",
  description: "Beskriv din kontoropgave, sæt et budget, og modtag bud fra kvalificerede hjælpere. Gratis at oprette.",
  alternates: { canonical: "https://kontorbud.dk/opret" },
};

export default function Page() {
  return <PostTaskClient />;
}
