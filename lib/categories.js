export const CATS = [
  { name: "Bogføring & regnskab", icon: "Calculator", slug: "bogforing-regnskab", keywords: ["bogføring", "regnskab", "moms", "årsregnskab", "faktura", "økonomi", "budget", "revisor"] },
  { name: "Kundeservice & support", icon: "Headphones", slug: "kundeservice-support", keywords: ["kundeservice", "support", "kunde", "telefon", "chat", "henvendelser"] },
  { name: "Dataindtastning", icon: "Keyboard", slug: "dataindtastning", keywords: ["data", "indtastning", "excel", "registrering", "indtaste"] },
  { name: "Oversættelse", icon: "Languages", slug: "oversaettelse", keywords: ["oversæt", "oversættelse", "sprog", "engelsk", "tysk", "tolke"] },
  { name: "Tekstforfatning & korrektur", icon: "PenTool", slug: "tekstforfatning-korrektur", keywords: ["tekst", "korrektur", "skriv", "artikel", "blog", "indhold", "copywriting"] },
  { name: "Kalender & rejseplanlægning", icon: "Calendar", slug: "kalender-rejseplanlaegning", keywords: ["kalender", "rejse", "planlægning", "møde", "booking", "billet"] },
  { name: "Kontraktgennemgang", icon: "FileText", slug: "kontraktgennemgang", keywords: ["kontrakt", "juridisk", "aftale", "fuldmagt", "jura"] },
  { name: "Journalføring & arkivering", icon: "Archive", slug: "journalforing-arkivering", keywords: ["journal", "arkiv", "arkivering", "sagsbehandling"] },
  { name: "Grafisk design", icon: "Palette", slug: "grafisk-design", keywords: ["design", "logo", "grafik", "billede", "visitkort", "layout"] },
  { name: "Præsentationer & slides", icon: "Presentation", slug: "praesentationer-slides", keywords: ["præsentation", "slides", "powerpoint", "pitch", "oplæg"] },
  { name: "AI-opgaver", icon: "Sparkles", slug: "ai-opgaver", keywords: ["ai", "kunstig intelligens", "chatgpt", "automatisering", "prompt"] },
  { name: "Hjemmeside & IT", icon: "Globe", slug: "hjemmeside-it", keywords: ["hjemmeside", "website", "it", "kode", "app", "wordpress", "webshop", "seo", "søgemaskineoptimering", "google ranking", "hosting", "domæne"] },
  { name: "Andet", icon: "MoreHorizontal", slug: "andet", keywords: [] },
];

export function categoryBySlug(slug) {
  return CATS.find((c) => c.slug === slug) || null;
}

// Finder den kategori, der bedst matcher en fritekst-søgning (f.eks. "jeg
// skal have lavet mit regnskab" -> "Bogføring & regnskab"). Returnerer null,
// hvis intet giver mening at gætte på.
export function matchCategoryFromText(text) {
  if (!text?.trim()) return null;
  const q = text.toLowerCase();

  // Direkte match på selve kategorinavnet vejer tungest.
  const directMatch = CATS.find((c) => q.includes(c.name.toLowerCase().split(" ")[0].replace(/[&,]/g, "")));
  if (directMatch) return directMatch;

  let best = null;
  let bestLength = 0;
  for (const cat of CATS) {
    for (const kw of cat.keywords) {
      if (q.includes(kw) && kw.length > bestLength) {
        best = cat;
        bestLength = kw.length;
      }
    }
  }
  return best;
}
