export function statusInfo(task) {
  if (task.status === "completed") return { tone: "completed", label: "Udført" };
  if (task.status === "cancelled") return { tone: "cancelled", label: "Annulleret" };
  if (task.status === "matched") return { tone: "matched", label: "Tildelt" };
  if (task.bids.length === 0) return { tone: "open", label: "Ledig" };
  return { tone: "bids", label: `${task.bids.length} bud` };
}

// Kort smagsprøve af en opgavebeskrivelse til brug på lister, så man kan se
// hvad opgaven handler om, uden at skulle klikke ind på den.
export function truncateText(text, maxLength = 110) {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}
