"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, ShieldCheck, Search, MessageCircle, Star, CreditCard } from "lucide-react";
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

export default function BrowsePage() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [showMap, setShowMap] = useState(true);

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
    .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.area || "").toLowerCase().includes(q));

  if (sort === "fewbids") list = [...list].sort((a, b) => a.bids.length - b.bids.length);
  else if (sort === "lowbudget") list = [...list].sort((a, b) => (budgetNumber(a.budget) ?? Infinity) - (budgetNumber(b.budget) ?? Infinity));
  else if (sort === "highbudget") list = [...list].sort((a, b) => (budgetNumber(b.budget) ?? -Infinity) - (budgetNumber(a.budget) ?? -Infinity));

  const activeTasks = tasks.filter((t) => t.status !== "cancelled");
  const withLocation = list.filter((t) => t.lat && t.lng).length;

  return (
    <div>
      <div style={{ position: "relative", marginTop: 6 }}>
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&auto=format&fit=crop&q=70"
          alt="Administrativt arbejde ved skrivebordet"
          style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 28, display: "block" }}
        />
        <div
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: 24,
            padding: "32px 36px",
            margin: "-64px 20px 0",
            boxShadow: "0 24px 48px -24px rgba(20,33,61,.25)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#EEF2FF",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 700,
              color: "#1B3AA6",
              marginBottom: 16,
            }}
          >
            Danmarks platform for administrative opgaver
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 800, maxWidth: 480, margin: 0 }}>
            Få klaret dine administrative opgaver
          </h1>
          <p style={{ fontSize: 15, color: "#5B6478", margin: "14px 0 22px", maxWidth: 460, lineHeight: 1.6 }}>
            Beskriv opgaven, sæt et budget, og modtag bud fra dygtige administrative hjælpere.
          </p>
          <Link
            href="/opret"
            style={{
              display: "inline-block",
              fontSize: 14.5,
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: 999,
              background: "#2A55E5",
              color: "#fff",
            }}
          >
            Opret opgave gratis
          </Link>
          <div style={{ display: "flex", gap: 18, marginTop: 20, flexWrap: "wrap" }}>
            <TrustBadge icon={CreditCard} text="Betaling holdes sikkert" />
            <TrustBadge icon={MessageCircle} text="Al kontakt på siden" />
            <TrustBadge icon={Star} text="Anmeldelser begge veje" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "#1AA37A", marginTop: 18, paddingTop: 18, borderTop: "1px solid #F0F1F5" }}>
            <ShieldCheck size={15} />
            {activeTasks.length} opgaver oprettet af rigtige brugere — gemt permanent i databasen.
          </div>
        </div>
      </div>

      <SectionHead title="Hvad skal du have løst?" sub="Vælg en kategori, eller se alle åbne sager nedenfor." />
      <div className="kb-grid-cat" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {CATS.map((c) => {
          const active = catFilter === c.name;
          const count = activeTasks.filter((t) => t.category === c.name).length;
          return (
            <div
              key={c.name}
              onClick={() => setCatFilter(active ? "all" : c.name)}
              style={{ cursor: "pointer", textAlign: "center" }}
            >
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  background: active ? "#EEF2FF" : "#F5F7FB",
                  border: active ? "2px solid #2A55E5" : "2px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  color: "#2A55E5",
                }}
              >
                <CatIcon name={c.icon} size={24} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.3 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#9AA2B1", marginTop: 2 }}>{count} opgaver</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#F5F7FB",
          borderRadius: 18,
          padding: "20px 26px",
          margin: "40px 0",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Ny på Kontorbud?</div>
          <div style={{ fontSize: 13, color: "#5B6478" }}>Se hvordan bud, betaling og udbetaling fungerer, trin for trin.</div>
        </div>
        <Link
          href="/hvordan-det-virker"
          style={{ fontSize: 13.5, fontWeight: 700, padding: "10px 20px", borderRadius: 10, background: "#fff", border: "1.5px solid #E4E8F0", color: "#14213D", whiteSpace: "nowrap" }}
        >
          Sådan fungerer det →
        </Link>
      </div>

      <SectionHead title="Åbne opgaver" sub={`${list.length} sager ${catFilter === "all" ? "" : "i " + catFilter} · ${withLocation} med placering på kortet`} />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
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
                    <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 2 }}>{t.title}</div>
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

function TrustBadge({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "#5B6478" }}>
      <Icon size={15} color="#2A55E5" />
      {text}
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
