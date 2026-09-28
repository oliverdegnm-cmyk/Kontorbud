"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Star, CreditCard, Clock, Bell, Users, FileText as FileTextIcon, HelpCircle } from "lucide-react";
import { CATS, matchCategoryFromText } from "@/lib/categories";
import { CatIcon } from "@/lib/icons";
import Badge from "@/components/Badge";
import Stars from "@/components/Stars";
import { statusInfo, truncateText, getDeadlineLabel, capitalizeFirst } from "@/lib/status";
import { formatBudgetDisplay } from "@/lib/fees";
import Footer from "@/components/Footer";
import TaskCarousel from "@/components/TaskCarousel";
import { useName } from "@/lib/NameContext";
import { shortDisplayName } from "@/lib/displayName";
import { FAQ_SECTIONS } from "@/lib/faqData";

// Udvalgte FAQ-spørgsmål til forsiden - hentet fra samme kilde (lib/faqData.js)
// som /faq-siden bruger, så indholdet aldrig kan drive fra hinanden. Fire
// spørgsmål, der dækker både opgavestiller- og hjælper-siden af markedspladsen.
const HOME_FAQ_ITEMS = [
  FAQ_SECTIONS[0].items[0], // "Er det gratis at bruge Kontorbud?"
  FAQ_SECTIONS[0].items[3], // "Kan jeg både oprette opgaver og byde på opgaver med samme konto?"
  FAQ_SECTIONS[3].items[0], // "Hvordan foregår betalingen?"
  FAQ_SECTIONS[3].items[1], // "Hvad hvis jeg ikke er tilfreds med arbejdet?"
];

export default function HomePage() {
  const router = useRouter();
  const { name } = useName();
  const [quickDescription, setQuickDescription] = useState("");
  const [matchingWithAi, setMatchingWithAi] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const matchedCategory = matchCategoryFromText(quickDescription);

  // Viser færre kategori-chips på mobil, så "Hvad skal du have løst?"
  // ikke bliver en lang, rodet søjle af kategorier på en smal skærm.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const visibleCatCount = isMobile ? 4 : 8;

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
            🇩🇰 Danmarks markedsplads for kontoropgaver
          </div>
          {/* H1 er bevidst FAST tekst (ikke længere et roterende ord som "AI-opgaver",
              "IT-opgaver" osv.) - en besøgende, der lander på siden eller tager et
              screenshot, skal altid se den samme, tydelige sætning om, hvad Kontorbud
              er: en bred markedsplads for kontoropgaver, ikke en AI-tjeneste. */}
          <h1 className="kb-hero-title" style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Få den rette hjælp til
            <br />
            <span style={{ color: "#2A55E5" }}>dine kontoropgaver</span>
          </h1>
          <p style={{ fontSize: 16, color: "#5B6478", margin: "18px 0 22px", maxWidth: 460, lineHeight: 1.6 }}>
            Beskriv din opgave, dit budget og hvornår du skal have den løst. Modtag bud fra relevante hjælpere, sammenlign dine muligheder og vælg selv den løsning, der passer dig bedst.
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
            <TrustBadge icon={Star} text="Du vælger selv din hjælper" />
            <TrustBadge icon={Clock} text="Mulighed for hasteopgaver" />
            <TrustBadge icon={ShieldCheck} text="Betalingen frigives først, når du har godkendt arbejdet" />
          </div>
          {/* "X opgaver oprettet af rigtige brugere"-linjen er fjernet fra visningen
              28/9 efter ønske fra Oliver (badge't med det grønne skjold) - selve
              activeTasks-beregningen er bevidst bevaret nedenfor, så linjen let kan
              genindsættes senere, hvis I ønsker det igen. */}
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
                quality={90}
                // "sizes" er bevidst sat højere end boksens faktiske CSS-bredde (480px):
                // admin-panelets zoom-funktion kan forstørre billedet op til 200% med en
                // CSS-transform, og next/image kender ikke til den forstørrelse - uden dette
                // ville den hente en for lille kilde og selv opskalere den, hvilket ser
                // sløret/uskarpt ud, præcis det problem der blev rapporteret.
                sizes="(max-width: 760px) 100vw, 960px"
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

      {/* "Sådan fungerer det" er flyttet op til lige efter hero (før "Hvad skal
          du have løst?"), så den besøgende forstår modellen (bud, sammenlign,
          betal), før de selv skal skrive noget. */}
      <SectionBand title="Sådan fungerer det" sub="Tre trin, fra du opretter opgaven, til den er løst." tint="#14213D">
      <div className="kb-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
        {[
          { num: "01", title: "Beskriv opgaven", text: "Skriv en kort titel, beskriv hvad du skal have løst, og sæt dit budget. Det tager under to minutter, og det er gratis." },
          { num: "02", title: "Modtag og sammenlign bud", text: "Hjælpere byder på opgaven. Sammenlign pris, profil og anmeldelser, og vælg selv, hvem du vil arbejde med." },
          { num: "03", title: "Godkend arbejdet og betal", text: "Betalingen håndteres sikkert af Stripe (højeste standard for datasikkerhed, PCI DSS niveau 1) og frigives først til hjælperen, når du selv markerer opgaven som udført." },
        ].map((step) => (
          <div key={step.num} style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 34 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#DCE4FB", marginBottom: 10 }}>{step.num}</div>
            <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 8 }}>{step.title}</div>
            <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.6, margin: 0 }}>{step.text}</p>
          </div>
        ))}
      </div>
      </SectionBand>

      {/* Betalings-tillidsboks - flyttet herop, lige under "Sådan fungerer det",
          efter ønske om at den skal stå direkte under trin-boksen på forsiden. */}
      <div style={{ background: "#F5F7FB", borderRadius: 20, padding: "44px 48px", marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 26 }}>
          <ShieldCheck size={18} color="#2A55E5" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#2A55E5" }}>Sikker betaling via Stripe</span>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Pengene bliver stående, til opgaven er løst</h3>
        <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.6, margin: 0, maxWidth: 600 }}>
          Betalingen håndteres af Stripe, der lever op til de højeste standarder for datasikkerhed (PCI DSS niveau 1). Dine kortoplysninger går aldrig gennem Kontorbuds egne servere, og beløbet frigives først, når du selv godkender.
        </p>
      </div>

      <SectionBand title="Hvad skal du have løst?" sub="Skriv en kort titel - vi finder automatisk den rette kategori for dig." border="#14213D">
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
          .slice(0, showAllCategories ? undefined : visibleCatCount)
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
        {!showAllCategories && CATS.length - 1 > visibleCatCount && (
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
            +{CATS.length - 1 - visibleCatCount} flere
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
                  className="kb-task-icon"
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <div className="kb-task-title" style={{ fontSize: 14, fontWeight: 700 }}>{capitalizeFirst(t.title)}</div>
                    {t.isUrgent && <UrgentBadge />}
                  </div>
                  <div className="kb-task-meta" style={{ fontSize: 12, color: "#5B6478" }}>
                    {t.category}
                    {" · "}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 700, color: t.deadline === "Fleksibel" ? "#1AA37A" : getDeadlineLabel(t).urgent ? "#C0392B" : "#14213D" }}>
                      <Clock size={11} /> {getDeadlineLabel(t).text}
                    </span>
                  </div>
                  {t.description && (
                    <div className="kb-task-desc" style={{ fontSize: 12, color: "#9AA2B1", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {truncateText(t.description, 80)}
                    </div>
                  )}
                </div>
                <div className="kb-task-secondary" style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                  <div className="kb-task-name" style={{ textAlign: "left", width: 120, flex: "0 0 auto" }}>
                    <div style={{ fontSize: 10.5, color: "#9AA2B1", fontWeight: 600 }}>Oprettet af</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 5 }}>
                      <Link
                        href={`/bruger/${encodeURIComponent(t.postedBy)}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: 13, fontWeight: 700, color: "#2A55E5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}
                      >
                        {shortDisplayName(t.postedBy)}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto", flexShrink: 0 }}>
                    <div style={{ width: 62, textAlign: "center" }}>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, width: 78, textAlign: "right" }}>{formatBudgetDisplay(t.budget)}</div>
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

      {/* Ny sektion: konkrete, dokumenterbare fordele ved markedspladsmodellen -
          ingen generiske marketingfraser. Samme navy-indramning ("tint") som
          "Sådan fungerer det" ovenfor, så de to sektioner visuelt hænger sammen. */}
      <SectionBand title="Hvorfor Kontorbud?" sub="Fire konkrete fordele ved at bruge platformen frem for selv at ringe rundt." tint="#14213D">
      <div className="kb-grid-cat" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
        <InfoTile icon={Users} title="Flere bud på samme opgave" text="Du slipper for selv at kontakte flere forskellige personer - opgaven når ud til flere hjælpere på én gang." />
        <InfoTile icon={Star} title="Sammenlign før du vælger" text="Se bud, profiler og anmeldelser, og vælg selv den hjælper, der passer bedst til opgaven." />
        <InfoTile icon={FileTextIcon} title="Du bestemmer budgettet" text="Beskriv opgaven og angiv, hvad du forventer at betale - hjælperne byder ud fra det." />
        <InfoTile icon={CreditCard} title="Sikker betaling" text="Betalingen holdes af Stripe og frigives først, når du selv markerer opgaven som udført." />
      </div>
      </SectionBand>

      {!name && (
        <div
          style={{
            background: "#EEF2FF",
            borderRadius: 20,
            padding: "40px 44px",
            marginTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Bell size={18} color="#2A55E5" />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#2A55E5" }}>Vil du tjene penge på dine kompetencer?</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Byd på opgaver og få besked, når der er noget i dit felt</h3>
            <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.6, margin: 0 }}>
              Opret en gratis konto på under et minut, gennemse åbne opgaver, og byd på dem, der passer dig. Du får besked med det samme, når der sker noget på dine egne bud og opgaver.
            </p>
          </div>
          <Link
            href="/opgaver"
            style={{ display: "inline-block", flexShrink: 0, fontSize: 14.5, fontWeight: 700, padding: "12px 24px", borderRadius: 999, background: "#2A55E5", color: "#fff" }}
          >
            Se åbne opgaver
          </Link>
        </div>
      )}

      {/* Ny sektion: FAQ på forsiden, med samme layout-idé som på AIbud.dk -
          hentet fra den samme FAQ_SECTIONS-kilde som /faq-siden bruger, så
          der ikke opstår to sæt svar, der kan komme til at modsige hinanden. */}
      <SectionHead title="Ofte stillede spørgsmål" sub="Et udpluk af de spørgsmål, vi oftest får - se alle svar på FAQ-siden." />
      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 24, padding: "6px 32px" }}>
        {HOME_FAQ_ITEMS.map((item, i) => (
          <div key={item.q} style={{ display: "flex", gap: 16, padding: "26px 0", borderTop: i > 0 ? "1px solid #F0F1F5" : "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EEF2FF", color: "#2A55E5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <HelpCircle size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 6 }}>{item.q}</div>
              <p style={{ fontSize: 13, color: "#5B6478", lineHeight: 1.6, margin: 0 }}>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 22 }}>
        <Link href="/faq" style={{ fontSize: 14, fontWeight: 700, color: "#2A55E5" }}>
          Se alle spørgsmål og svar →
        </Link>
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

// Lille pil, der viser hjælpere, at opgavestilleren selv har markeret opgaven
// som en hasteopgave - ikke et løfte om en bestemt svartid fra Kontorbud.
function UrgentBadge() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#FDEDEB", color: "#C0392B", flex: "0 0 auto" }}>
      ⚡ Haster
    </span>
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

// Kompakt info-kort brugt i "Hvem løser opgaverne?" og "Hvorfor Kontorbud?" -
// samme visuelle stil (hvid boks, farvet ikon-cirkel) som resten af siden,
// så de to nye sektioner ikke introducerer et nyt designsprog.
function InfoTile({ icon: Icon, title, text }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 22 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF2FF", color: "#2A55E5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon size={17} />
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.55, margin: 0 }}>{text}</p>
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
// Undtagelsen er "border"-varianten (en hvid boks med farvet kant): der sidder
// overskriften INDE i selve boksen, som en samlet, indrammet "kort"-sektion.
function SectionBand({ title, sub, children, tint, border, titleColor }) {
  if (border) {
    return (
      <div
        className="kb-section-headwrap kb-section-band"
        style={{ background: "#fff", border: `2px solid ${border}`, borderRadius: 28, padding: "40px 40px", margin: "96px 0 0" }}
      >
        <h2 className="kb-section-title" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em", margin: 0, color: titleColor || "inherit" }}>{title}</h2>
        {sub && <p style={{ fontSize: 15.5, color: "#5B6478", marginTop: 10, marginBottom: 28, maxWidth: 560 }}>{sub}</p>}
        {children}
      </div>
    );
  }
  return (
    <>
      <div className="kb-section-headwrap" style={{ margin: "96px 0 32px" }}>
        <h2 className="kb-section-title" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em", margin: 0, color: titleColor || "inherit" }}>{title}</h2>
        {sub && <p style={{ fontSize: 15.5, color: "#5B6478", marginTop: 10, maxWidth: 560 }}>{sub}</p>}
      </div>
      <div className="kb-section-band" style={{ background: tint || "#F5F7FB", borderRadius: 28, padding: "40px 40px" }}>
        {children}
      </div>
    </>
  );
}
