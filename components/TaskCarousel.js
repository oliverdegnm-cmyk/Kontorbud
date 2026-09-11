"use client";

import Link from "next/link";
import { CatIcon } from "@/lib/icons";
import { CATS } from "@/lib/categories";
import { formatBudgetDisplay } from "@/lib/fees";
import { capitalizeFirst } from "@/lib/status";
import Badge from "@/components/Badge";
import Stars from "@/components/Stars";

export default function TaskCarousel({ tasks }) {
  if (!tasks || tasks.length === 0) return null;

  // Duplikeres, så løkken kan glide sømløst uden et synligt "hop" i overgangen.
  const items = tasks.length < 6 ? [...tasks, ...tasks, ...tasks, ...tasks] : [...tasks, ...tasks];

  return (
    <div style={{ overflow: "hidden", marginBottom: 8 }}>
      <div className="kb-marquee-track" style={{ display: "flex", gap: 14, width: "max-content" }}>
        {items.map((t, i) => {
          const cat = CATS.find((c) => c.name === t.category);
          return (
            <Link
              key={`${t.id}-${i}`}
              href={`/opgave/${t.id}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: 220,
                flex: "0 0 auto",
                background: "#fff",
                border: "1.5px solid #E4E8F0",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "#F1EBFF",
                    color: "#7C3AED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CatIcon name={cat ? cat.icon : "FileText"} size={15} />
                </div>
                <Badge tone={t.status === "completed" ? "completed" : "matched"}>{t.status === "completed" ? "Udført" : "Tildelt"}</Badge>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{capitalizeFirst(t.title)}</div>
              <div style={{ fontSize: 11.5, color: "#5B6478", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.category}</div>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{formatBudgetDisplay(t.budget)}</div>
              {t.completedByName && (
                <div style={{ borderTop: "1px solid #F0F1F5", marginTop: 2, paddingTop: 8 }}>
                  <div style={{ fontSize: 10.5, color: "#9AA2B1", fontWeight: 600 }}>Udført af</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#14213D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.completedByName}</div>
                  <div style={{ fontSize: 11, color: "#5B6478", marginTop: 2 }}>
                    {t.completedByReviewCount > 0 ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <Stars value={t.completedByRating} size={11} /> ({t.completedByReviewCount})
                      </span>
                    ) : (
                      "ingen anmeldelser"
                    )}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
