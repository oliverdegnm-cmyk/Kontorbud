// Niveauer og servicegebyr er modelleret efter Handyhands offentlige gebyrstruktur
// (handyhand.dk/handyhander-niveauer): niveau kræver BÅDE en indtjeningsgrænse og en
// udførelsesrate-kategori. Handyhand oplyser ikke de præcise procent-grænser for
// "Ringe / Okay / God / Fantastisk" udførelsesrate offentligt, så grænserne herunder
// (70 / 85 / 95 %) er vores bedste antagelse og bør justeres, hvis I får bedre data.
export const RATE_CATEGORIES = [
  { key: "fantastisk", label: "Fantastisk", min: 95, order: 3 },
  { key: "god", label: "God", min: 85, order: 2 },
  { key: "okay", label: "Okay", min: 70, order: 1 },
  { key: "ringe", label: "Ringe", min: 0, order: 0 },
];

export const LEVELS = [
  { key: "platin", label: "Platin", minEarnings: 23000, minRateOrder: 3, feePercent: 10.2 },
  { key: "guld", label: "Guld", minEarnings: 11500, minRateOrder: 2, feePercent: 12.8 },
  { key: "solv", label: "Sølv", minEarnings: 3800, minRateOrder: 1, feePercent: 16 },
  { key: "standard", label: "Standard", minEarnings: 0, minRateOrder: 0, feePercent: 20 },
];

export function rateCategoryFor(ratePercent) {
  return RATE_CATEGORIES.find((r) => ratePercent >= r.min) || RATE_CATEGORIES[RATE_CATEGORIES.length - 1];
}

// completed/cancelled counts come from the helper's last 20 assigned tasks.
// With no history yet, we give the benefit of the doubt (100%) rather than penalizing new helpers.
export function completionRate(completedCount, cancelledCount) {
  const total = completedCount + cancelledCount;
  if (total === 0) return 100;
  return Math.round((completedCount / total) * 100);
}

export function levelFor(earnings30d, ratePercent) {
  const rateCat = rateCategoryFor(ratePercent);
  return (
    LEVELS.find((l) => earnings30d >= l.minEarnings && rateCat.order >= l.minRateOrder) || LEVELS[LEVELS.length - 1]
  );
}

export function feeBreakdown(amountKr, earnings30d, ratePercent) {
  const level = levelFor(earnings30d, ratePercent);
  const fee = Math.round(amountKr * (level.feePercent / 100));
  const net = amountKr - fee;
  return { level, fee, net };
}

export function formatKr(n) {
  return `${Math.round(n).toLocaleString("da-DK")} kr`;
}
