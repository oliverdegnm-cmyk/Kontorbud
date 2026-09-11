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
import { statusInfo, truncateText, getDeadlineLabel, capitalizeFirst } from "@/lib/status";
import { formatBudgetDisplay } from "@/lib/fees";
import Footer from "@/components/Footer";
import TaskCarousel from "@/components/TaskCarousel";

// Ord der skiftevis vises i forsidens rubrik ("Få bud på dine ___").
// "kontoropgaver" er sat ind som hvert femte ord, så platformens eget navn
// jævnligt vender tilbage og fremhæves med et lille "pop".
const HERO_ROTATING_WORDS = [
  "AI-opgaver",
  "IT-opgaver",
  "regnskabsopgaver",
  "kundeserviceopgaver",
  "kontoropgaver",
  "oversættelsesopgaver",
  "HR-opgaver",
  "marketingopgaver",
  "designopgaver",
  "kontoropgaver",
];

export default function HomePage() {
  const router = useRouter();
  const [quickDescription, setQuickDescription] = useState("");
  const [matchingWithAi, setMatchingWithAi] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
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
  const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&auto=format&fit=crop&q=70";
  const [heroImages, setHeroImages] = useState([{ url: DEFAULT_HERO_IMAGE, position: 50, zoom: 100 }]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        try {
          const parsed = JSON.parse(data.settings?.hero_images || "[]");
          if (Array.isArray(parsed) && parsed.length > 0) setHeroImages(parsed);
        } catch (err) {
          // behold standardbilledet, hvis noget ikke kan tolkes
        }
      })
      .catch(() => {})
      .finally(() => {
        setHeroLoaded(true);
      });
  }, []);

  // Skifter automatisk til næste billede hvert 6. sekund, hvis der er mere end ét.
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => !data.error && setTasks(data.tasks))
      .catch(() => {});
  }, []);

  const [heroWordIndex, setHeroWordIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroWordIndex((i) => (i + 1) % HERO_ROTATING_WORDS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);
  const heroWord = HERO_ROTATING_WORDS[heroWordIndex];
  const heroWordIsKontor = heroWord === "kontoropgaver";

  const activeTasks = (tasks || []).filter((t) => t.status !== "cancelled");
  const openTasks = (tasks || []).filter((t) => t.status === "open");
  const inspirationTasks = (tasks || []).filter((t) => t.status === "completed" || t.status === "matched");

  return (
    <div>
      <div className="kb-grid-hero" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 32, alignItems: "stretch", marginTop: 40 }}>
        <div
          className="kb-hero-card"
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "8px 48px 48px 0",
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
          <h1 className="kb-hero-title" style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Få bud på dine
            <br />
            <span
              key={heroWordIndex}
              className={heroWordIsKontor ? "kb-hero-rotate-word kb-hero-rotate-word--pop" : "kb-hero-rotate-word"}
              style={{ color: heroWordIsKontor ? "#2A55E5" : "inherit" }}
            >
              {heroWord}
            </span>
          </h1>
          <p style={{ fontSize: 16, color: "#5B6478", margin: "18px 0 22px", maxWidth: 460, lineHeight: 1.6 }}>
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
        <div
          className="kb-hide-mobile"
          style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#F5F7FB", minHeight: 420 }}
        >
          {heroLoaded &&
            heroImages.map((img, i) => (
              <Image
                key={img.url + i}
                src={img.url}
                alt="Kontorbud - få bud på dine kontoropgaver"
                fill
                priority={i === 0}
                sizes="(max-width: 760px) 100vw, 480px"
                style={{
                  objectFit: "cover",
                  objectPosition: `center ${img.position}%`,
                  transform: `scale(${img.zoom / 100})`,
                  transformOrigin: "center",
                  opacity: i === heroIndex ? 1 : 0,
                  transition: "opacity 1.2s ease",
                }}
              />
            ))}
        </div>
      </div>

      <SectionBand title="Hvad skal du have løst?" sub="Skriv en kort titel - vi finder automatisk den rette kategori for dig." border="#2A55E5" titleColor="#2A55E5">
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 36,
          background: "#fff",
          border: "1.5px solid #E4E8F0",
          borderRadius: 16,
          padding: 16,
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

      <div style={{ fontSize: 12.5, color: "#9AA2B1", marginBottom: 18 }}>...eller tryk på en kategori for inspiration og typiske opgaver:</div>
      <div className="kb-cat-chips" style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: 10, marginBottom: 20 }}>
        {CATS.filter((c) => c.name !== "Journalføring & arkivering")
          .slice(0, showAllCategories ? undefined : 8)
          .map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 20px 13px 15px",
                borderRadius: 16,
                background: "#fff",
                border: "1.5px solid #E4E8F0",
                color: "#14213D",
              }}
            >
              <span style={{ display: "flex", color: "#2A55E5", flex: "0 0 auto" }}>
                <CatIcon name={c.icon} size={16} />
              </span>
              <span>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, lineHeight: 1.3 }}>{c.name}</span>
                {c.tagline && <span style={{ display: "block", fontSize: 11, color: "#9AA2B1", lineHeight: 1.3, marginTop: 1 }}>{c.tagline}</span>}
              </span>
            </Link>
          ))}
        {!showAllCategories && CATS.length - 1 > 8 && (
          <button
            onClick={() => setShowAllCategories(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "center",
              gap: 5,
              padding: "9px 16px",
              borderRadius: 999,
              background: "#fff",
              border: "1.5px solid #E4E8F0",
              color: "#1B3AA6",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            +{CATS.length - 1 - 8} flere
          </button>
        )}
        {showAllCategories && (
          <button
            onClick={() => setShowAllCategories(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "center",
              gap: 5,
              padding: "9px 16px",
              borderRadius: 999,
              background: "#fff",
              border: "1.5px solid #E4E8F0",
              color: "#5B6478",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Vis færre
          </button>
        )}
      </div>
      </SectionBand>

      <SectionBand title="Åbne opgaver" sub="Et hurtigt indblik i, hvad andre får løst lige nu.">
      {openTasks.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "#5B6478" }}>Ingen åbne opgaver lige nu.</p>
      ) : (
        <div className="kb-task-list-container" style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 24 }}>
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
                  gap: 18,
                  background: "#fff",
                  border: "1.5px solid #E4E8F0",
                  borderRadius: 16,
                  padding: "28px 30px",
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
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{capitalizeFirst(t.title)}</div>
                  <div style={{ fontSize: 12, color: "#5B6478" }}>
                    {t.category}
                    {" · "}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 700, color: t.deadline === "Fleksibel" ? "#1AA37A" : getDeadlineLabel(t).urgent ? "#C0392B" : "#14213D" }}>
                      <Clock size={11} /> {getDeadlineLabel(t).text}
                    </span>
                  </div>
                  {t.description && (
                    <div style={{ fontSize: 12, color: "#9AA2B1", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Link
          href="/opgaver"
          style={{
            display: "inline-block",
            fontSize: 13.5,
            fontWeight: 700,
            padding: "11px 22px",
            borderRadius: 10,
            border: "1.5px solid #E4E8F0",
            background: "#fff",
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
            background: "#fff",
            color: "#14213D",
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
            background: "#fff",
            color: "#14213D",
          }}
        >
          Se opgaver fra virksomheder →
        </Link>
      </div>
      </SectionBand>

      {inspirationTasks.length > 0 && (
        <>
          <SectionHead title="Til inspiration" sub="Se, hvad andre allerede har fået løst - eller er i gang med lige nu." />
          <TaskCarousel tasks={inspirationTasks} />
        </>
      )}

      <SectionBand title="Sådan fungerer det" sub="Tre trin, fra du opretter opgaven, til den er løst." tint="#14213D">
      <div className="kb-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
        {[
          { num: "01", title: "Beskriv opgaven", text: "Skriv en kort titel og sæt dit budget. Det tager under to minutter, og det er gratis." },
          { num: "02", title: "Modtag bud", text: "Dygtige hjælpere byder på opgaven. Sammenlign pris, profil og anmeldelser." },
          { num: "03", title: "Betal når du er tilfreds", text: "Beløbet holdes sikkert og frigives først, når opgaven er løst som aftalt." },
        ].map((step) => (
          <div key={step.num} style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 34 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#DCE4FB", marginBottom: 10 }}>{step.num}</div>
            <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 8 }}>{step.title}</div>
            <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.6, margin: 0 }}>{step.text}</p>
          </div>
        ))}
      </div>
      </SectionBand>

      <div style={{ background: "#F5F7FB", borderRadius: 20, padding: "44px 48px", marginTop: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 26 }}>
          <ShieldCheck size={18} color="#2A55E5" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#2A55E5" }}>Sikker betaling via Stripe</span>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Pengene bliver stående, til opgaven er løst</h3>
        <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.6, margin: 0, maxWidth: 600 }}>
          Betalingen håndteres af Stripe, der lever op til de højeste standarder for datasikkerhed (PCI DSS niveau 1). Dine kortoplysninger går aldrig gennem Kontorbuds egne servere, og beløbet frigives først, når du selv godkender.
        </p>
      </div>

      <div style={{ textAlign: "center", margin: "100px 0 60px", padding: "0 20px" }}>
        <h2 style={{ fontSize: 27, fontWeight: 800, marginBottom: 28 }}>Klar til at starte?</h2>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/opret"
            style={{ display: "inline-block", fontSize: 14.5, fontWeight: 700, padding: "12px 24px", borderRadius: 999, background: "#2A55E5", color: "#fff" }}
          >
            Opret opgave gratis
          </Link>
          <Link
            href="/opgaver"
            style={{ display: "inline-block", fontSize: 14.5, fontWeight: 700, padding: "12px 24px", borderRadius: 999, border: "1.5px solid #E4E8F0", color: "#14213D" }}
          >
            Se opgaver
          </Link>
        </div>
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

function SectionHead({ title, sub, large, mt }) {
  return (
    <div className="kb-section-headwrap" style={{ margin: `${mt ?? 96}px 0 32px` }}>
      <h2 className={large ? "kb-section-title-large" : "kb-section-title"} style={{ fontSize: large ? 38 : 30, fontWeight: 800, letterSpacing: "-0.01em", margin: 0 }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: large ? 17 : 15.5, color: "#5B6478", marginTop: 10, maxWidth: 560 }}>{sub}</p>}
    </div>
  );
}

// Ligesom SectionHead, men med indholdet pakket ind i et rundet, farvet felt
// nedenunder - så forsiden får skiftevis hvide og farvede sektioner, ligesom
// på Handyhands forside. Overskriften selv sidder UDENFOR feltet, i nøjagtig
// samme stil og med samme venstre-kant som alle andre overskrifter på siden,
// så ingen overskrifter "springer" i, hvor langt til venstre de starter.
function SectionBand({ title, sub, children, tint, border, titleColor }) {
  return (
    <>
      <div className="kb-section-headwrap" style={{ margin: "96px 0 32px" }}>
        <h2 className="kb-section-title" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em", margin: 0, color: titleColor || "inherit" }}>{title}</h2>
        {sub && <p style={{ fontSize: 15.5, color: "#5B6478", marginTop: 10, maxWidth: 560 }}>{sub}</p>}
      </div>
      <div
        className="kb-section-band"
        style={
          border
            ? { background: "#fff", border: `2px solid ${border}`, borderRadius: 28, padding: "40px 40px" }
            : { background: tint || "#F5F7FB", borderRadius: 28, padding: "40px 40px" }
        }
      >
        {children}
      </div>
    </>
  );
}
