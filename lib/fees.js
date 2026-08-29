// Niveauer og servicegebyr er modelleret efter Handyhands offentlige gebyrstruktur
// (handyhand.dk/handyhander-niveauer). Handyhand kræver også en vis udførelsesrate for
// Sølv-niveau — det har vi ingen data for endnu, så her er niveauet udelukkende baseret
// på indtjening de seneste 30 dage.
export const LEVELS = [
  { key: "platin", label: "Platin", minEarnings: 23000, feePercent: 10.2 },
  { key: "guld", label: "Guld", minEarnings: 11500, feePercent: 12.8 },
  { key: "solv", label: "Sølv", minEarnings: 3800, feePercent: 16 },
  { key: "standard", label: "Standard", minEarnings: 0, feePercent: 20 },
];

export function levelForEarnings(earnings30d) {
  return LEVELS.find((l) => earnings30d >= l.minEarnings) || LEVELS[LEVELS.length - 1];
}

export function feeBreakdown(amountKr, earnings30d) {
  const level = levelForEarnings(earnings30d);
  const fee = Math.round(amountKr * (level.feePercent / 100));
  const net = amountKr - fee;
  return { level, fee, net };
}

export function formatKr(n) {
  return `${Math.round(n).toLocaleString("da-DK")} kr`;
}
