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

// Viser en frist pænt med "dage" bagved, hvis værdien blot er et rent tal
// (f.eks. fra en ældre opgave eller redigering) - "Fleksibel" og andet
// fritekst-indhold rørs ikke.
export function formatDeadlineDisplay(value) {
  if (!value) return value;
  const trimmed = value.toString().trim();
  if (/^\d+$/.test(trimmed)) return `${trimmed} dage`;
  return trimmed;
}

// Udregner "X dage tilbage" ud fra en rigtig kalenderdato, i stedet for en
// fast tekst der aldrig ændrer sig. Falder tilbage til den gamle tekst-baserede
// visning for opgaver oprettet før kalender-vælgeren blev indført.
export function getDeadlineLabel(task) {
  if (task.deadlineDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(task.deadlineDate);
    target.setHours(0, 0, 0, 0);
    const days = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: "Udløbet", urgent: true };
    if (days === 0) return { text: "I dag", urgent: true };
    if (days === 1) return { text: "1 dag tilbage", urgent: true };
    if (days <= 3) return { text: `${days} dage tilbage`, urgent: true };
    return { text: `${days} dage tilbage`, urgent: false };
  }
  return { text: formatDeadlineDisplay(task.deadline), urgent: false };
}

// Sørger for at opgavetitler altid starter med stort bogstav i visningen,
// uanset hvordan brugeren selv skrev dem ved oprettelsen.
export function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
