export const CATS = [
  { name: "Bogføring & regnskab", icon: "Calculator", slug: "bogforing-regnskab" },
  { name: "Kundeservice & support", icon: "Headphones", slug: "kundeservice-support" },
  { name: "Dataindtastning", icon: "Keyboard", slug: "dataindtastning" },
  { name: "Oversættelse", icon: "Languages", slug: "oversaettelse" },
  { name: "Tekstforfatning & korrektur", icon: "PenTool", slug: "tekstforfatning-korrektur" },
  { name: "Kalender & rejseplanlægning", icon: "Calendar", slug: "kalender-rejseplanlaegning" },
  { name: "Kontraktgennemgang", icon: "FileText", slug: "kontraktgennemgang" },
  { name: "Journalføring & arkivering", icon: "Archive", slug: "journalforing-arkivering" },
  { name: "Grafisk design", icon: "Palette", slug: "grafisk-design" },
  { name: "Præsentationer & slides", icon: "Presentation", slug: "praesentationer-slides" },
  { name: "AI-opgaver", icon: "Sparkles", slug: "ai-opgaver" },
  { name: "Hjemmeside & IT", icon: "Globe", slug: "hjemmeside-it" },
  { name: "Andet", icon: "MoreHorizontal", slug: "andet" },
];

export function categoryBySlug(slug) {
  return CATS.find((c) => c.slug === slug) || null;
}
