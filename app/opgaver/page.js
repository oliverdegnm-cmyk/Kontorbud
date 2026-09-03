"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, Search } from "lucide-react";
import { CATS } from "@/lib/categories";
import { CatIcon } from "@/lib/icons";
import Badge from "@/components/Badge";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import { statusInfo } from "@/lib/status";

const TaskMap = dynamic(() => import("@/components/TaskMap"), {
  ssr: false,
  loading: () => (
    <div style={{ borderRadius: 16, border: "1.5px solid #E4E8F0", height: "100%", minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "#5B6478", fontSize: 13 }}>
      Indlæser kort…
    </div>
  ),
});

function budgetNumber(budget) {
  const digits = (budget || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

export default function OpgaverPage() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [showMap, setShowMap] = useState(true);
  const [posterFilter, setPosterFilter] = useState("all");
  const [onlyWithLocation, setOnlyWithLocation] = useState(false);

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

  const q = query.trim().toLowerCase();
  let list = tasks
    .filter((t) => t.status !== "cancelled")
    .filter((t) => catFilter === "all" || t.category === catFilter)
    .filter((t) => posterFilter === "all" || t.posterType === posterFilter)
    .filter((t) => !onlyWithLocation || (t.lat && t.lng))
    .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.area || "").toLowerCase().includes(q));

  if (sort === "fewbids") list = [...list].sort((a, b) => a.bids.length - b.bids.length);
  else if (sort === "lowbudget") list = [...list].sort((a, b) => (budgetNumber(a.budget) ?? Infinity) - (budgetNumber(b.budget) ?? Infinity));
  else if (sort === "highbudget") list = [...list].sort((a, b) => (budgetNumber(b.budget) ?? -Infinity) - (budgetNumber(a.budget) ?? -Infinity));

  const withLocation = list.filter((t) => t.lat && t.lng).length;

  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Åbne opgaver</h2>
      <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 20 }}>
        {list.length} sager {catFilter === "all" ? "" : "i " + catFilter} · {withLocation} med placering på kortet
      </p>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "#F5F7FB", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[
          { key: "all", label: "Alle" },
          { key: "business", label: "Virksomheder" },
          { key: "private", label: "Private" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setPosterFilter(f.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: posterFilter === f.key ? "#2A55E5" : "transparent",
              color: posterFilter === f.key ? "#fff" : "#5B6478",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 360 }}>
          <Search size={16} color="#9AA2B1" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søg i titel, beskrivelse eller område…"
            style={{ width: "100%", fontSize: 13.5, padding: "10px 14px 10px 38px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#fff" }}
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{ fontSize: 13.5, padding: "10px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#fff", cursor: "pointer" }}
        >
          <option value="all">Alle kategorier</option>
          {CATS.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ fontSize: 13.5, padding: "10px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#fff", cursor: "pointer" }}
        >
          <option value="newest">Nyeste først</option>
          <option value="fewbids">Færrest bud</option>
          <option value="lowbudget">Laveste budget</option>
          <option value="highbudget">Højeste budget</option>
        </select>
        <button
          onClick={() => setOnlyWithLocation(!onlyWithLocation)}
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #E4E8F0",
            background: onlyWithLocation ? "#EEF2FF" : "#fff",
            color: onlyWithLocation ? "#1B3AA6" : "#5B6478",
            cursor: "pointer",
          }}
        >
          📍 Kun med placering
        </button>
        <button
          onClick={() => setShowMap(!showMap)}
          style={{ fontSize: 13.5, fontWeight: 700, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E4E8F0", background: showMap ? "#EEF2FF" : "#fff", color: showMap ? "#1B3AA6" : "#5B6478", cursor: "pointer" }}
        >
          {showMap ? "Skjul kort" : "Vis kort"}
        </button>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: "50px 10px", textAlign: "center", color: "#5B6478" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#14213D", marginBottom: 6 }}>Ingen opgaver matcher</div>
          <div style={{ fontSize: 13.5 }}>
            Prøv en anden søgning eller kategori, eller <Link href="/opret" style={{ color: "#2A55E5", fontWeight: 700 }}>opret en opgave</Link>.
          </div>
        </div>
      ) : (
        <div className="kb-grid-browse" style={{ display: "grid", gridTemplateColumns: showMap ? "1.1fr 0.9fr" : "1fr", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((t) => {
              const cat = CATS.find((c) => c.name === t.category);
              const status = statusInfo(t);
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700 }}>{t.title}</div>
                      {t.posterType === "business" && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#F5F7FB", color: "#5B6478", flex: "0 0 auto" }}>
                          Virksomhed
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#5B6478" }}>
                      {t.category} · Frist: {t.deadline}
                      {t.area ? ` · 📍 ${t.area}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 18, flex: "0 0 auto" }}>
                    <Badge tone={status.tone}>{status.label}</Badge>
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
          {showMap && (
            <div style={{ position: "sticky", top: 20 }}>
              <MapErrorBoundary>
                <TaskMap tasks={list} />
              </MapErrorBoundary>
              {withLocation < list.length && (
                <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 8 }}>
                  {list.length - withLocation} opgave(r) har ikke et genkendeligt område og vises ikke på kortet.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
