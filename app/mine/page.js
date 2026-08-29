"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useName } from "@/lib/NameContext";
import Badge from "@/components/Badge";

export default function MinePage() {
  const { name } = useName();
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks || []));
  }, []);

  if (!tasks) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Henter dine sager…</div>;
  }

  const posted = tasks.filter((t) => t.postedBy === name);
  const bidOn = tasks.filter((t) => t.bids.some((b) => b.bidderName === name));

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 4 }}>Mine sager</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 10 }}>Overblik over dine opgaver og bud, som {name}.</p>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", margin: "26px 0 12px" }}>
        Opgaver du har oprettet
      </div>
      {posted.length === 0 && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Du har ikke oprettet nogen opgaver endnu.</p>}
      {posted.map((t) => (
        <Link
          key={t.id}
          href={`/opgave/${t.id}`}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, marginBottom: 10 }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "#5B6478", marginTop: 2 }}>
              {t.caseNo} · {t.category}
            </div>
          </div>
          {t.bids.length === 0 ? <Badge tone="open">Ledig</Badge> : <Badge tone="bids">{t.bids.length} bud</Badge>}
        </Link>
      ))}

      <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", margin: "30px 0 12px" }}>
        Opgaver du har budt på
      </div>
      {bidOn.length === 0 && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Du har ikke budt på nogen opgaver endnu.</p>}
      {bidOn.map((t) => {
        const mine = t.bids.find((b) => b.bidderName === name);
        return (
          <Link
            key={t.id}
            href={`/opgave/${t.id}`}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, marginBottom: 10 }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "#5B6478", marginTop: 2 }}>
                {t.caseNo} · Dit bud: {mine.amount}
              </div>
            </div>
            <Badge tone="bids">Afventer svar</Badge>
          </Link>
        );
      })}
    </div>
  );
}
