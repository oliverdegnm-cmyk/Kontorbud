"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { CATS } from "@/lib/categories";
import { CatIcon } from "@/lib/icons";
import Badge from "@/components/Badge";

export default function BrowsePage() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTasks(data.tasks);
      })
      .catch(() => setError("Kunne ikke hente opgaver. Tjek din forbindelse."));
  }, []);

  if (error) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#C0392B" }}>{error}</div>;
  }
  if (!tasks) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Henter opgaver…</div>;
  }

  const list = tasks.filter((t) => catFilter === "all" || t.category === catFilter);

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(180deg, #EEF2FF 0%, #fff 100%)",
          borderRadius: 28,
          padding: "48px 40px",
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 32,
          alignItems: "center",
          marginTop: 6,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              background: "#fff",
              border: "1px solid #E4E8F0",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 700,
              color: "#1B3AA6",
              marginBottom: 16,
            }}
          >
            Danmarks nyeste opgaveplatform for kontorarbejde
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 800, maxWidth: 440, margin: 0 }}>
            Få klaret dine administrative opgaver
          </h1>
          <p style={{ fontSize: 15, color: "#5B6478", margin: "14px 0 22px", maxWidth: 420, lineHeight: 1.6 }}>
            Beskriv opgaven, sæt et budget, og modtag bud fra dygtige administrative hjælpere.
          </p>
          <Link
            href="/opret"
            style={{
              display: "inline-block",
              fontSize: 14.5,
              fontWeight: 700,
              padding: "12px 22px",
              borderRadius: 12,
              background: "#2A55E5",
              color: "#fff",
            }}
          >
            Opret opgave gratis
          </Link>
        </div>
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E4E8F0", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#1AA37A", marginBottom: 10 }}>
            <ShieldCheck size={16} /> Live opgaveliste
          </div>
          <div style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.6 }}>
            {tasks.length} opgaver oprettet af rigtige brugere — gemt permanent i databasen.
          </div>
        </div>
      </div>

      <SectionHead title="Hvad skal du have løst?" sub="Vælg en kategori, eller se alle åbne sager nedenfor." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {CATS.map((c) => {
          const active = catFilter === c.name;
          const count = tasks.filter((t) => t.category === c.name).length;
          return (
            <div
              key={c.name}
              onClick={() => setCatFilter(active ? "all" : c.name)}
              style={{
                background: active ? "#EEF2FF" : "#F5F7FB",
                border: active ? "1.5px solid #2A55E5" : "1.5px solid transparent",
                borderRadius: 16,
                padding: "18px 14px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                  color: "#2A55E5",
                }}
              >
                <CatIcon name={c.icon} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: "#5B6478", marginTop: 2 }}>{count} opgaver</div>
            </div>
          );
        })}
      </div>

      <SectionHead title="Åbne opgaver" sub={`${list.length} sager ${catFilter === "all" ? "" : "i " + catFilter}`} />
      {list.length === 0 ? (
        <div style={{ padding: "50px 10px", textAlign: "center", color: "#5B6478" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#14213D", marginBottom: 6 }}>Ingen opgaver i denne kategori endnu</div>
          <div style={{ fontSize: 13.5 }}>
            Vær den første — <Link href="/opret" style={{ color: "#2A55E5", fontWeight: 700 }}>opret en opgave</Link>.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((t) => {
            const cat = CATS.find((c) => c.name === t.category);
            return (
              <Link
                key={t.id}
                href={`/opgave/${t.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "#fff",
                  border: "1.5px solid #E4E8F0",
                  borderRadius: 16,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#EEF2FF",
                    color: "#2A55E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <CatIcon name={cat ? cat.icon : "FileText"} size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 2 }}>{t.title}</div>
                  <div style={{ fontSize: 12.5, color: "#5B6478" }}>
                    {t.category} · Frist: {t.deadline}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 18, flex: "0 0 auto" }}>
                  {t.bids.length === 0 ? <Badge tone="open">Ledig</Badge> : <Badge tone="bids">{t.bids.length} bud</Badge>}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{t.budget}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: "#5B6478" }}>Budget</div>
                  </div>
                  <ChevronRight size={18} color="#5B6478" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ margin: "40px 0 16px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: "#5B6478", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}
