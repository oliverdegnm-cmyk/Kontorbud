import HomeClient from "./HomeClient";

export const metadata = {
  title: "Kontorbud - Danmarks platform for kontoropgaver",
  description: "Få bud på dine kontoropgaver - bogføring, kundeservice, dataindtastning, grafisk design og meget mere. Betaling holdes sikkert, indtil du er tilfreds.",
  alternates: { canonical: "https://kontorbud.dk/" },
  openGraph: {
    title: "Kontorbud - Danmarks platform for kontoropgaver",
    description: "Få bud på dine kontoropgaver fra dygtige danske hjælpere. Gratis at oprette, betaling holdes sikkert.",
    url: "https://kontorbud.dk/",
    siteName: "Kontorbud",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}
