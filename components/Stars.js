"use client";

import { Star } from "lucide-react";

export default function Stars({ value, size = 13 }) {
  const full = Math.round(value || 0);
  return (
    <span style={{ display: "inline-flex", gap: 1, color: "#FFB400" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= full ? "#FFB400" : "none"} stroke="#FFB400" />
      ))}
    </span>
  );
}
