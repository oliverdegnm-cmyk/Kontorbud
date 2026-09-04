"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, MessageCircle, Star, CreditCard, Headset, ChevronRight } from "lucide-react";
import { CATS } from "@/lib/categories";
import { CatIcon } from "@/lib/icons";
import Badge from "@/components/Badge";
import { statusInfo } from "@/lib/status";

export default function HomePage() {
  const [tasks, setTasks] = useState(null);
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1758611972678-bc3b29b4718f?w=1400&auto=format&fit=crop&q=70");
  const [heroPosition, setHeroPosition] = useState(50);
  const [heroZoom, setHeroZoom] = useState(100);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.hero_image_url) setHeroImage(data.settings.hero_image_url);
        if (data.settings?.hero_image_url_position) setHeroPosition(parseFloat(data.settings.hero_image_url_position));
        if (data.settings?.hero_image_url_zoom) setHeroZoom(parseFloat(data.settings.hero_image_url_zoom));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => !data.error && setTasks(data.tasks))
      .catch(() => {});
  }, []);

  const activeTasks = (tasks || []).filter((t) => t.status !== "cancelled");

  return (
    <div>
      <div style={{ position: "relative", marginTop: 6 }}>
        <div style={{ width: "100%", height: 260, borderRadius: 28, overflow: "hidden" }}>
          <img
            src={heroImage}
            alt="Overvældet af kontoropgaver — beder om hjælp"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `center ${heroPosition}%`,
              transform: `scale(${heroZoom / 100})`,
              transformOrigin: "center",
              display: "block",
            }}
          />
        </div>
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
            🇩🇰 Danmarks platform for kontoropgaver
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 800, maxWidth: 480, margin: 0 }}>
            Få klaret dine kontoropgaver
          </h1>
          <p style={{ fontSize: 15, color: "#5B6478", margin: "14px 0 22px", maxWidth: 460, lineHeight: 1.6 }}>
            Beskriv opgaven, sæt et budget, og modtag bud fra dygtige hjælpere til kontoropgaver.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
            <Link
              href="/opgaver"
              style={{
                display: "inline-block",
                fontSize: 14.5,
                fontWeight: 700,
                padding: "12px 24px",
                borderRadius: 999,
                border: "1.5px solid #E4E8F0",
                color: "#14213D",
              }}
            >
              Se åbne opgaver
            </Link>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 20, flexWrap: "wrap" }}>
            <TrustBadge icon={CreditCard} text="Betaling holdes sikkert" />
            <TrustBadge icon={MessageCircle} text="Al kontakt på siden" />
            <TrustBadge icon={Star} text="Anmeldelser begge veje" />
            <TrustBadge icon={Headset} text="Dansk kundeservice" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "#1AA37A", marginTop: 18, paddingTop: 18, borderTop: "1px solid #F0F1F5" }}>
            <ShieldCheck size={15} />
            {activeTasks.length} opgaver oprettet af rigtige brugere — gemt permanent i databasen.
          </div>
        </div>
      </div>

      <div style={{ background: "#F5F7FB", borderRadius: 20, padding: "26px 32px", margin: "40px 0", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <ShieldCheck size={22} color="#2A55E5" />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Betaling håndteres af Stripe</div>
          <p style={{ fontSize: 13, color: "#5B6478", lineHeight: 1.6, margin: 0 }}>
            Stripe bruges af millioner af virksomheder verden over og opfylder de højeste standarder for datasikkerhed (PCI DSS niveau 1). Dine kortoplysninger går aldrig gennem Kontorbuds egne servere, og pengene holdes sikkert, indtil du selv frigiver dem.
          </p>
        </div>
      </div>

      <SectionHead title="Hvad skal du have løst?" sub="Vælg en kategori for at starte en ny opgave i det felt." />
      <div className="kb-grid-cat" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {CATS.filter((c) => c.name !== "Journalføring & arkivering").map((c) => {
          const count = activeTasks.filter((t) => t.category === c.name).length;
          return (
            <Link
              key={c.name}
              href={`/opret?category=${encodeURIComponent(c.name)}`}
              style={{ cursor: "pointer", textAlign: "center", display: "block" }}
            >
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  background: "#F5F7FB",
                  border: "2px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  color: "#2A55E5",
                }}
              >
                <CatIcon name={c.icon} size={24} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.3, color: "#14213D" }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#9AA2B1", marginTop: 2 }}>{count} opgaver</div>
            </Link>
          );
        })}
      </div>

      <SectionHead title="Seneste opgaver" sub="Et hurtigt indblik i, hvad andre får løst lige nu." />
      {activeTasks.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "#5B6478" }}>Ingen opgaver oprettet endnu.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {activeTasks.slice(0, 5).map((t) => {
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
                  padding: "14px 18px",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: "#EEF2FF",
                    color: "#2A55E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <CatIcon name={cat ? cat.icon : "FileText"} size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#5B6478" }}>{t.category}</div>
                </div>
                <Badge tone={status.tone}>{status.label}</Badge>
                <div style={{ fontSize: 13.5, fontWeight: 800, minWidth: 70, textAlign: "right" }}>{t.budget}</div>
                <ChevronRight size={16} color="#5B6478" />
              </Link>
            );
          })}
        </div>
      )}
      <Link
        href="/opgaver"
        style={{
          display: "inline-block",
          fontSize: 13.5,
          fontWeight: 700,
          padding: "11px 22px",
          borderRadius: 10,
          border: "1.5px solid #E4E8F0",
          color: "#14213D",
        }}
      >
        Se alle opgaver →
      </Link>
      <Link
        href="/opgaver?filter=business"
        style={{
          display: "inline-block",
          fontSize: 13.5,
          fontWeight: 700,
          padding: "11px 22px",
          borderRadius: 10,
          border: "1.5px solid #E4E8F0",
          color: "#14213D",
          marginLeft: 10,
        }}
      >
        Er du en virksomhed? Se opgaver fra andre virksomheder →
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#F5F7FB",
          borderRadius: 18,
          padding: "20px 26px",
          margin: "40px 0 0",
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
