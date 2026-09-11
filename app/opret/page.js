import PostTaskClient from "./PostTaskClient";

export const metadata = {
  title: "Opret opgave - AIbud",
  description: "Beskriv din AI-opgave, sæt et budget, og modtag bud fra kvalificerede hjælpere. Gratis at oprette.",
  alternates: { canonical: "https://aibud.dk/opret" },
};

export default function Page() {
  return <PostTaskClient />;
}
