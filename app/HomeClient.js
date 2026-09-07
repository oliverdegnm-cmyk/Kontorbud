"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, MessageCircle, Star, CreditCard, Headset, ChevronRight, Clock } from "lucide-react";
import { CATS, matchCategoryFromText } from "@/lib/categories";
import { CatIcon } from "@/lib/icons";
import Badge from "@/components/Badge";
import Stars from "@/components/Stars";
import { statusInfo, truncateText, formatDeadlineDisplay, capitalizeFirst } from "@/lib/status";
import { formatBudgetDisplay } from "@/lib/fees";
import Footer from "@/components/Footer";
import TaskCarousel from "@/components/TaskCarousel";

export default function HomePage() {
  const router = useRouter();
  const [quickDescription, setQuickDescription] = useState("");
  const [matchingWithAi, setMatchingWithAi] = useState(false);
  const matchedCategory = matchCategoryFromText(quickDescription);

  async function goToCreateTask() {
    const title = quickDescription.trim();
    const titleParam = title ? `title=${encodeURIComponent(title)}` : "";

    const localMatch = matchCategoryFromText(quickDescription);
    if (localMatch || !title) {
      const params = [titleParam, localMatch ? `category=${encodeURIComponent(localMatch.name)}` : ""].filter(Boolean).join("&");
      router.push(`/opret${params ? "?" + params : ""}`);
      return;
    }

    // Ordlisten fandt intet - spørger AI'en som sikkerhedsnet, før vi giver op
    // og lader brugeren vælge kategori selv på opret-siden.
    setMatchingWithAi(true);
    try {
      const res = await fetch("/api/match-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickDescription }),
      });
      const data = await res.json();
      const params = [titleParam, data.category ? `category=${encodeURIComponent(data.category)}` : ""].filter(Boolean).join("&");
      router.push(`/opret${params ? "?" + params : ""}`);
    } catch (err) {
      router.push(`/opret${titleParam ? "?" + titleParam : ""}`);
    }
    setMatchingWithAi(false);
  }
  const [tasks, setTasks] = useState(null);
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1758611972678-bc3b29b4718f?w=1400&auto=format&fit=crop&q=70");
  const [heroPosition, setHeroPosition] = useState(50);
  const [heroZoom, setHeroZoom] = useState(100);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.hero_image_url) setHeroImage(data.settings.hero_image_url);
        if (data.settings?.hero_image_url_position) setHeroPosition(parseFloat(data.settings.hero_image_url_position));
        if (data.settings?.hero_image_url_zoom) setHeroZoom(parseFloat(data.settings.hero_image_url_zoom));
      })
      .catch(() => {})
      .finally(() => {
        setHeroLoaded(true);
      });
  }, []);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => !data.error && setTasks(data.tasks))
      .catch(() => {});
  }, []);

  const activeTasks = (tasks || []).filter((t) => t.status !== "cancelled");
  const openTasks = (tasks || []).filter((t) => t.status === "open");
  const inspirationTasks = (tasks || []).filter((t) => t.status === "completed" || t.status === "matched");

  return (
    <div>
      <div style={{ position: "relative", marginTop: 6 }}>
        <div style={{ width: "100%", height: 340, borderRadius: 28, overflow: "hidden", background: "#F5F7FB", position: "relative" }}>
          {heroLoaded && (
            <Image
              src={heroImage}
              alt="Overvældet af kontoropgaver - beder om hjælp"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 1080px"
              style={{
                objectFit: "cover",
                objectPosition: `center ${heroPosition}%`,
                transform: `scale(${heroZoom / 100})`,
                transformOrigin: "center",
              }}
            />
          )}
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
            Få bud på dine kontoropgaver
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
            {activeTasks.length} opgaver oprettet af rigtige brugere.
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

      <SectionHead title="Hvad skal du have løst?" sub="Skriv en kort titel - vi finder automatisk den rette kategori for dig." />
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 28,
          background: "#F5F7FB",
          border: "1.5px solid #E4E8F0",
          borderRadius: 16,
          padding: 10,
          flexWrap: "wrap",
        }}
      >
        <input
          value={quickDescription}
          onChange={(e) => setQuickDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goToCreateTask()}
          placeholder="f.eks. Hjælp til mit årsregnskab…"
          style={{ flex: "1 1 240px", fontSize: 14.5, padding: "13px 16px", border: "1.5px solid #E4E8F0", borderRadius: 12, background: "#fff" }}
        />
        <button
          onClick={goToCreateTask}
          disabled={matchingWithAi}
          style={{
            fontSize: 14.5,
            fontWeight: 700,
            padding: "13px 24px",
            borderRadius: 12,
            border: "none",
            background: "#2A55E5",
            color: "#fff",
            cursor: matchingWithAi ? "default" : "pointer",
            opacity: matchingWithAi ? 0.7 : 1,
            flex: "0 0 auto",
          }}
        >
          {matchingWithAi ? "Finder bedste kategori…" : "Opret opgave →"}
        </button>
      </div>
      {matchedCategory && (
        <div style={{ fontSize: 12.5, color: "#1AA37A", marginTop: -18, marginBottom: 20, fontWeight: 700 }}>✓ Fundet: {matchedCategory.name}</div>
      )}

      <div style={{ fontSize: 12.5, color: "#9AA2B1", marginBottom: 16 }}>...eller tryk på en kategori for inspiration og typiske opgaver:</div>
      <div className="kb-grid-cat" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {CATS.filter((c) => c.name !== "Journalføring & arkivering").map((c) => {
          const count = openTasks.filter((t) => t.category === c.name).length;
          return (
            <Link key={c.slug} href={`/kategori/${c.slug}`} style={{ cursor: "pointer", textAlign: "center", display: "block" }}>
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
              <div style={{ fontSize: 11, color: "#9AA2B1", marginTop: 2 }}>{count} åbne</div>
            </Link>
          );
        })}
      </div>

      <SectionHead title="Åbne opgaver" sub="Et hurtigt indblik i, hvad andre får løst lige nu." />
      {openTasks.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "#5B6478" }}>Ingen åbne opgaver lige nu.</p>
      ) : (
        <div className="kb-task-list-container" style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          {openTasks.slice(0, 5).map((t) => {
            const cat = CATS.find((c) => c.name === t.category);
            const status = statusInfo(t);
            return (
              <div
                key={t.id}
                onClick={() => router.push(`/opgave/${t.id}`)}
                className="kb-task-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "38px 1fr 320px",
                  alignItems: "center",
                  gap: 16,
                  background: "#fff",
                  border: "1.5px solid #E4E8F0",
                  borderRadius: 16,
                  padding: "18px 20px",
                  cursor: "pointer",
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
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{capitalizeFirst(t.title)}</div>
                  <div style={{ fontSize: 12, color: "#5B6478" }}>
                    {t.category}
                    {" · "}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 700, color: t.deadline === "Fleksibel" ? "#1AA37A" : "#14213D" }}>
                      <Clock size={11} /> {formatDeadlineDisplay(t.deadline)}
                    </span>
                  </div>
                  {t.description && (
                    <div style={{ fontSize: 12, color: "#9AA2B1", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {truncateText(t.description, 80)}
                    </div>
                  )}
                </div>
                <div className="kb-task-secondary" style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                  <div style={{ textAlign: "left", width: 120 }}>
                    <div style={{ fontSize: 10.5, color: "#9AA2B1", fontWeight: 600 }}>Oprettet af</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 5 }}>
                      <Link
                        href={`/bruger/${encodeURIComponent(t.postedBy)}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: 13, fontWeight: 700, color: "#2A55E5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}
                      >
                        {t.postedBy}
                      </Link>
                    </div>
                    <div style={{ fontSize: 11, color: "#5B6478", marginTop: 2, whiteSpace: "nowrap" }}>
                      {t.posterReviewCount > 0 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, justifyContent: "flex-start" }}>
                          <Stars value={t.posterRating} size={11} /> ({t.posterReviewCount})
                        </span>
                      ) : (
                        "ingen anmeldelser"
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 62, textAlign: "center" }}>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, width: 78, textAlign: "right" }}>{formatBudgetDisplay(t.budget)}</div>
                    <ChevronRight size={16} color="#5B6478" />
                  </div>
                </div>
              </div>
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
        href="/opgaver?filter=private"
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
        Se opgaver fra private →
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
        Se opgaver fra virksomheder →
      </Link>

      {inspirationTasks.length > 0 && (
        <>
          <SectionHead title="Til inspiration" sub="Se, hvad andre allerede har fået løst - eller er i gang med lige nu." />
          <TaskCarousel tasks={inspirationTasks} />
        </>
      )}

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

      <Footer />
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
