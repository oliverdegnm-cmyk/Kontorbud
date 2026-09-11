import FaqClient from "./FaqClient";
import { FAQ_SECTIONS } from "@/lib/faqData";
import { safeJsonLd } from "@/lib/safeJsonLd";

export const metadata = {
  title: "Ofte stillede spørgsmål - Kontorbud",
  description: "Svar på de mest almindelige spørgsmål om at oprette opgaver, byde, betaling og sikkerhed på Kontorbud.",
  alternates: { canonical: "https://kontorbud.dk/faq" },
};

export default function FaqPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
      <FaqClient />
    </>
  );
}
