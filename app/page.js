import HomeClient from "./HomeClient";

export const metadata = {
  title: "AIbud - Danmarks platform for AI-opgaver",
  description:
    "Få hjælp til prompt-engineering, AI-automatisering, chatbots og meget mere fra dygtige danske AI-eksperter - eller få nogen til at lære dig AI's muligheder at kende. Gratis at oprette en opgave - betalingen holdes sikkert, indtil du er tilfreds.",
  alternates: { canonical: "https://aibud.dk/" },
  openGraph: {
    title: "AIbud - Danmarks platform for AI-opgaver",
    description:
      "Opret din AI-opgave og få bud fra danske AI-eksperter - fra automatisering og chatbots til at blive undervist i AI's muligheder. Gratis at oprette, betaling holdes sikkert.",
    url: "https://aibud.dk/",
    siteName: "AIbud",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}
