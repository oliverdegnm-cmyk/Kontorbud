"use client";

export default function Badge({ children, tone }) {
  const tones = {
    open: { bg: "#FFF1E0", color: "#B5610E" },
    bids: { bg: "#EEF2FF", color: "#1B3AA6" },
    matched: { bg: "#E9F9F1", color: "#1AA37A" },
    completed: { bg: "#E9F9F1", color: "#146B4E" },
    cancelled: { bg: "#F5F7FB", color: "#5B6478" },
  };
  const t = tones[tone] || tones.bids;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        padding: "6px 12px",
        borderRadius: 999,
        background: t.bg,
        color: t.color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
