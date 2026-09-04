"use client";

import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useName } from "@/lib/NameContext";
import Badge from "@/components/Badge";
import { formatKr, LEVELS } from "@/lib/fees";
import { statusInfo } from "@/lib/status";

function MinePage() {
  const { name } = useName();
  const [tasks, setTasks] = useState(null);
  const [level, setLevel] = useState(null);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks || []));
  }, []);

  useEffect(() => {
    if (!name) return;
    fetch(`/api/helpers/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => !data.error && setLevel(data));
  }, [name]);

  if (!tasks) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Henter dine sager…</div>;
  }

  const posted = tasks.filter((t) => t.postedBy === name);
  const bidOn = tasks.filter((t) => t.bids.some((b) => b.bidderName === name));

  const currentIndex = level ? LEVELS.findIndex((l) => l.key === level.level.key) : -1;
  const nextLevel = currentIndex > 0 ? LEVELS[currentIndex - 1] : null;

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 4 }}>Mine sager</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 10 }}>
        Overblik over dine opgaver og bud, som{" "}
        <Link href={`/bruger/${encodeURIComponent(name)}`} style={{ color: "#2A55E5", fontWeight: 700 }}>
          {name}
        </Link>
        .
      </p>

      {level && (
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Dit hjælperniveau</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{level.level.label}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Servicegebyr</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{level.level.feePercent}%</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Udførelsesrate</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{level.completionRate}%</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Indtjening (30 dage)</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{formatKr(level.earnings30d)}</div>
            </div>
          </div>
          {nextLevel && (
            <div style={{ fontSize: 12.5, color: "#5B6478", marginTop: 14, paddingTop: 14, borderTop: "1px solid #E4E8F0" }}>
              Tjen {formatKr(Math.max(0, nextLevel.minEarnings - level.earnings30d))} mere og hold en god udførelsesrate for at nå <b>{nextLevel.label}</b> ({nextLevel.feePercent}% gebyr).
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", margin: "26px 0 12px" }}>
        Opgaver du har oprettet
      </div>
      {posted.length === 0 && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Du har ikke oprettet nogen opgaver endnu.</p>}
      {posted.map((t) => {
        const status = statusInfo(t);
        return (
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
            <Badge tone={status.tone}>{status.label}</Badge>
          </Link>
        );
      })}

      <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", margin: "30px 0 12px" }}>
        Opgaver du har budt på
      </div>
      {bidOn.length === 0 && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Du har ikke budt på nogen opgaver endnu.</p>}
      {bidOn.map((t) => {
        const mine = t.bids.find((b) => b.bidderName === name);
        const wasChosen = (t.status === "matched" || t.status === "completed") && t.acceptedBidId === mine.id;
        const wasPassedOver = (t.status === "matched" || t.status === "completed") && t.acceptedBidId !== mine.id;
        let tone = "bids";
        let label = "Afventer svar";
        if (t.status === "completed" && wasChosen) {
          tone = "completed";
          label = "Udført";
        } else if (wasChosen) {
          tone = "matched";
          label = "Dit bud blev valgt";
        } else if (wasPassedOver || t.status === "cancelled") {
          tone = "open";
          label = t.status === "cancelled" ? "Annulleret" : "Ikke valgt";
        }
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
            <Badge tone={tone}>{label}</Badge>
          </Link>
        );
      })}
    </div>
  );
}

export default function MinePageWrapper() {
  return (
    <RequireAuth>
      <MinePage />
    </RequireAuth>
  );
}
