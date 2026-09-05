import ContactClient from "./KontaktClient";

export const metadata = {
  title: "Kontakt kundeservice - Kontorbud",
  description: "Har du et spørgsmål eller brug for hjælp? Dansk kundeservice - vi svarer hurtigst muligt.",
  alternates: { canonical: "https://kontorbud.dk/kontakt" },
};

export default function Page() {
  return <ContactClient />;
}
