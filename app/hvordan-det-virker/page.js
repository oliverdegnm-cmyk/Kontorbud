import HowItWorksClient from "./HvordanClient";

export const metadata = {
  title: "Sådan fungerer Kontorbud",
  description: "Beskriv din opgave, få tilbud, vælg den rette hjælper. Betal først, når du er tilfreds - betalingen holdes sikkert af platformen indtil da.",
  alternates: { canonical: "https://kontorbud.dk/hvordan-det-virker" },
};

export default function Page() {
  return <HowItWorksClient />;
}
