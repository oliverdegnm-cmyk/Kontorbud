import HowItWorksClient from "./HvordanClient";

export const metadata = {
  title: "Sådan fungerer AIbud",
  description: "Beskriv din opgave - eller det, du gerne vil lære om AI - få tilbud, vælg den rette hjælper. Betal først, når du er tilfreds - betalingen holdes sikkert af platformen indtil da.",
  alternates: { canonical: "https://aibud.dk/hvordan-det-virker" },
};

export default function Page() {
  return <HowItWorksClient />;
}
