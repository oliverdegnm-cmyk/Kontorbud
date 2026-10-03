"use client";

import RequireAuth from "@/components/RequireAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATS, matchCategoryFromText } from "@/lib/categories";
import { useName } from "@/lib/NameContext";
import FileUploader from "@/components/FileUploader";
import { Sparkles, ArrowLeft } from "lucide-react";

// 3/10: "byg et intelligent AI-flow til Opret en opgave" - delte stilarter for
// de nye skærme (intro/spørgsmål/resume) og den eksisterende fulde formular,
// så alle fire skærme visuelt hænger sammen uden at opfinde et nyt design.
const cardStyle = { background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 30, maxWidth: 660 };
const aiCardStyle = { background: "#F5F7FF", border: "1.5px solid #DCE4FB", borderRadius: 20, padding: 30, maxWidth: 660 };
const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 8 };
const inputStyle = { width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" };
const primaryBtnStyle = { marginTop: 6, fontSize: 14.5, fontWeight: 700, padding: "12px 22px", borderRadius: 12, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer" };
const linkBtnStyle = { background: "none", border: "none", padding: 0, fontSize: 12.5, fontWeight: 700, color: "#2A55E5", textDecoration: "underline", cursor: "pointer" };
const errorBoxStyle = { marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" };
const okBoxStyle = { marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A" };

// Genbrugt "vælg mellem to/flere" knap - erstatter de tidligere gentagne,
// håndskrevne knap-par (dato/fleksibel, normal/haste, eksternt/fremmøde,
// privat/virksomhed), så de også kan bruges i det nye levende resume og i
// spørgsmåls-skærmen uden at duplikere stilarterne fire gange.
function PillButton({ active, danger, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 0",
        borderRadius: 10,
        border: active ? `1.5px solid ${danger ? "#C0392B" : "#2A55E5"}` : "1.5px solid #E4E8F0",
        background: active ? (danger ? "#FDEDEB" : "#EEF2FF") : "#fff",
        color: active ? (danger ? "#C0392B" : "#1B3AA6") : "#5B6478",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, children, note }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {note && <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>{note}</div>}
    </div>
  );
}

function PostTaskPage() {
  const router = useRouter();
  const { name } = useName();
  const searchParams = useSearchParams();

  // 3/10: fire skærme i stedet for den tidligere envejs "AI-boks + stor
  // formular". "intro" og "form" svarer til punkt 1/16 i briefet,
  // "clarify" og "summary" er de nye, adaptive skærme (punkt 5-9).
  const [screen, setScreen] = useState("intro");
  const [wizardText, setWizardText] = useState(searchParams.get("description") || "");
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError, setWizardError] = useState("");

  // ---- opgavens felter - delt af alle fire skærme, så kunden aldrig skal
  // starte forfra, uanset hvilken skærm de redigerer fra (punkt 9/16). ----
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const categoryFromUrl = searchParams.get("category");
  const [category, setCategory] = useState(CATS.some((c) => c.name === categoryFromUrl) ? categoryFromUrl : "");
  const [categorySuggested, setCategorySuggested] = useState(false);
  const aiTimeout = useRef(null);
  const [budget, setBudget] = useState("");
  const [deadlineType, setDeadlineType] = useState("flexible"); // "date" | "flexible"
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [isUrgent, setIsUrgent] = useState(false);
  const [area, setArea] = useState("");
  const [locationType, setLocationType] = useState("remote");
  const [address, setAddress] = useState("");
  const [posterType, setPosterType] = useState("private");
  const [companyName, setCompanyName] = useState("");
  const [cvrNumber, setCvrNumber] = useState("");
  const [cvrStatus, setCvrStatus] = useState(null);
  const [cvrError, setCvrError] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [okId, setOkId] = useState("");

  // 3/10: kilde-mærkning pr. AI-relevant felt - "default" | "ai" | "user".
  // Dette er det, der sikrer at brugerens eget valg ALTID vinder: når et felt
  // først har kilde "user" (brugeren har selv svaret på et spørgsmål, rettet
  // direkte i resumeet, eller rettet i den fulde formular), rører AI'en aldrig
  // ved det igen - den må højst foreslå, aldrig overskrive (punkt 11-12).
  const [fieldSource, setFieldSource] = useState({
    title: "default",
    category: categoryFromUrl ? "user" : "default",
    description: "default",
    budget: "default",
    deadline: "default",
    locationType: "default",
    isUrgent: "default",
    posterType: "default",
  });
  function markUser(key) {
    setFieldSource((s) => (s[key] === "user" ? s : { ...s, [key]: "user" }));
  }
  // Punkt 12/15: en ref der altid afspejler den NYESTE fieldSource - bruges
  // inde i de forsinkede/asynkrone AI-kald nedenfor (debounce, 900ms-match,
  // fetch-svar), hvor et almindeligt closure-læs af "fieldSource" ellers ville
  // være en "gammel" værdi fra dengang kaldet blev planlagt. Uden denne kunne
  // et AI-svar, der kommer tilbage EFTER at kunden selv har rettet titel/
  // kategori manuelt i mellemtiden, fejlagtigt stadig tro feltet var
  // AI-styret og overskrive kundens eget valg - præcis det briefet siger
  // aldrig må ske.
  const fieldSourceRef = useRef(fieldSource);
  useEffect(() => {
    fieldSourceRef.current = fieldSource;
  }, [fieldSource]);
  // Samme grund som ovenfor: "title"/"category" skal også læses som deres
  // NUVÆRENDE værdi inde i det forsinkede AI-svar nedenfor, ikke den værdi de
  // havde, da debouncen blev sat i gang - ellers kan et "Fortryd" komme til at
  // gendanne en forældet værdi i stedet for kundens seneste egen rettelse.
  const liveFieldsRef = useRef({ title, category });
  useEffect(() => {
    liveFieldsRef.current = { title, category };
  }, [title, category]);

  // ---- de spørgsmål AI mangler svar på (punkt 5-7), og de to typer
  // AI-ændrings-bannere i det levende resume (punkt 11) ----
  const [missingFields, setMissingFields] = useState([]);
  const [categoryCandidates, setCategoryCandidates] = useState([]);
  const [clarifyingQuestion, setClarifyingQuestion] = useState(null);
  const [titleUndo, setTitleUndo] = useState(null); // { previousValue } - høj sikkerhed, auto-opdateret + Fortryd
  const [categorySuggestion, setCategorySuggestion] = useState(null); // { previousValue, newValue } - lavere sikkerhed, Skift/Behold
  const [reanalyzing, setReanalyzing] = useState(false);
  const descTimer = useRef(null);
  const requestIdRef = useRef(0);
  const lastAnalyzedDescRef = useRef("");

  // Spørgsmålene besvares ét ad gangen uden navigation - når det sidste er
  // besvaret, går vi automatisk videre til resumeet (punkt 6: "så få
  // spørgsmål som muligt", ikke en fast rækkefølge kunden skal klikke sig igennem).
  useEffect(() => {
    if (screen === "clarify" && missingFields.length === 0) setScreen("summary");
  }, [missingFields, screen]);

  function applyAnalysis(data) {
    const f = data.fields || {};
    if (f.title) {
      setTitle(f.title);
      setFieldSource((s) => ({ ...s, title: "ai" }));
    }
    if (f.category && fieldSource.category !== "user") {
      setCategory(f.category);
      setFieldSource((s) => ({ ...s, category: "ai" }));
    }
    if (f.description) {
      setDescription(f.description);
      setFieldSource((s) => ({ ...s, description: "ai" }));
      lastAnalyzedDescRef.current = f.description;
    }
    if (f.budget && fieldSource.budget !== "user") {
      setBudget(f.budget);
      setFieldSource((s) => ({ ...s, budget: "ai" }));
    }
    // Intet nævnt om frist -> deadlineType forbliver "flexible" (standard-
    // værdien sat ovenfor) - vi opfinder ALDRIG en dato, kunden ikke selv har
    // nævnt (punkt 4 i briefet), heller ikke den tidligere "i dag + 7 dage".
    if (fieldSource.deadline !== "user") {
      if (f.deadlineDate) {
        setDeadlineType("date");
        setDeadlineDate(f.deadlineDate);
        setFieldSource((s) => ({ ...s, deadline: "ai" }));
      } else if (f.deadlineFlexible) {
        setDeadlineType("flexible");
        setFieldSource((s) => ({ ...s, deadline: "ai" }));
      }
    }
    if (f.locationType && fieldSource.locationType !== "user") {
      setLocationType(f.locationType);
      setFieldSource((s) => ({ ...s, locationType: "ai" }));
      if (f.area) setArea(f.area);
    }
    if (f.isUrgent && fieldSource.isUrgent !== "user") {
      setIsUrgent(true);
      setFieldSource((s) => ({ ...s, isUrgent: "ai" }));
    }
    if (f.posterType && fieldSource.posterType !== "user") {
      setPosterType(f.posterType);
      setFieldSource((s) => ({ ...s, posterType: "ai" }));
    }

    // Et felt, kunden allerede selv har afgjort (fx kategori fra et
    // kategori-link, eller noget besvaret i et tidligere spørgsmål), skal
    // aldrig dukke op som et spørgsmål igen.
    const missing = (data.missingFields || []).filter((m) => {
      if (m === "category" || m === "clarify") return fieldSource.category !== "user";
      if (m === "workMode") return fieldSource.locationType !== "user";
      if (m === "priority") return fieldSource.isUrgent !== "user";
      if (m === "posterType") return fieldSource.posterType !== "user";
      if (m === "budget") return fieldSource.budget !== "user";
      if (m === "deadline") return fieldSource.deadline !== "user";
      return true;
    });
    setCategoryCandidates(data.categoryCandidates || []);
    setClarifyingQuestion(data.clarifyingQuestion || null);
    setMissingFields(missing);
    setScreen(missing.length > 0 ? "clarify" : "summary");
  }

  async function runInitialAnalysis() {
    if (!wizardText.trim()) return;
    setWizardLoading(true);
    setWizardError("");
    try {
      const res = await fetch("/api/tasks/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: wizardText }),
      });
      const data = await res.json();
      if (data.error) {
        setWizardError(data.error);
        setWizardLoading(false);
        return;
      }
      applyAnalysis(data);
    } catch (err) {
      setWizardError("Vi kunne ikke opdatere oplysningerne automatisk lige nu.");
    }
    setWizardLoading(false);
  }

  // Punkt 19: AI må ikke være et single point of failure - det, kunden
  // allerede har skrevet, går aldrig til spilde, uanset om AI fejler, eller
  // kunden bare selv foretrækker den fulde formular fra starten.
  function continueManually() {
    if (wizardText.trim() && !description.trim()) {
      setDescription(wizardText.trim());
      lastAnalyzedDescRef.current = wizardText.trim();
    }
    setScreen("form");
  }

  function answerCategory(value) {
    setCategory(value);
    setFieldSource((s) => ({ ...s, category: "user" }));
    setCategoryCandidates([]);
    setClarifyingQuestion(null);
    setMissingFields((m) => m.filter((k) => k !== "category" && k !== "clarify"));
  }

  function answerClarify(option) {
    setCategory(option.category);
    setFieldSource((s) => ({ ...s, category: "user" }));
    // Svaret flettes ind i beskrivelsen som en kort, sand tilføjelse - ikke
    // en opfundet detalje, kun det kunden lige selv har valgt (punkt 17).
    setDescription((d) => (d.trim() ? `${d.trim()} Fokus: ${option.label}.` : `Fokus: ${option.label}.`));
    setClarifyingQuestion(null);
    setMissingFields((m) => m.filter((k) => k !== "clarify"));
  }

  function answerWorkMode(value) {
    setLocationType(value);
    setFieldSource((s) => ({ ...s, locationType: "user" }));
    setMissingFields((m) => m.filter((k) => k !== "workMode"));
  }

  function answerPriority(value) {
    setIsUrgent(value);
    setFieldSource((s) => ({ ...s, isUrgent: "user" }));
    setMissingFields((m) => m.filter((k) => k !== "priority"));
  }

  // 3/10 (opfølgning): tre nye, lette spørgsmål - lagt til efter Olivers
  // feedback om at AI'en gerne må spørge om flere ting på én gang (privat/
  // virksomhed, budget, tidspunkt), ikke kun kategori/arbejdsform/prioritet.
  // Vises samlet med de øvrige kort på "clarify"-skærmen, ikke sekventielt.
  function answerPosterType(value) {
    setPosterType(value);
    setFieldSource((s) => ({ ...s, posterType: "user" }));
    setMissingFields((m) => m.filter((k) => k !== "posterType"));
  }
  function answerBudget(value) {
    setBudget(value);
    setFieldSource((s) => ({ ...s, budget: "user" }));
    setMissingFields((m) => m.filter((k) => k !== "budget"));
  }
  function answerDeadlineType(type) {
    setDeadlineType(type);
    setFieldSource((s) => ({ ...s, deadline: "user" }));
    setMissingFields((m) => m.filter((k) => k !== "deadline"));
  }

  function undoTitle() {
    if (!titleUndo) return;
    setTitle(titleUndo.previousValue);
    setTitleUndo(null);
  }
  function acceptCategorySuggestion() {
    if (!categorySuggestion) return;
    setCategory(categorySuggestion.newValue);
    setFieldSource((s) => ({ ...s, category: "ai" }));
    setCategorySuggestion(null);
  }
  function keepCurrentCategory() {
    setFieldSource((s) => ({ ...s, category: "user" }));
    setCategorySuggestion(null);
  }

  // Punkt 10/13/14/15: AI genvurderer KUN titel/kategori, og KUN når
  // beskrivelsen rent faktisk ændrer sig - ikke ved budget-, dato- eller
  // prioritets-ændringer. Ventes med et kort debounce + ved blur (punkt 14),
  // og et løbenummer sikrer at et ældre, langsommere svar aldrig kan
  // overskrive et nyere (punkt 15).
  function handleDescriptionChange(value) {
    setDescription(value);
    markUser("description");
    clearTimeout(descTimer.current);
    descTimer.current = setTimeout(() => triggerDescriptionReanalysis(value), 1100);
  }
  function handleDescriptionBlur() {
    clearTimeout(descTimer.current);
    triggerDescriptionReanalysis(description);
  }
  async function triggerDescriptionReanalysis(text) {
    const trimmed = text.trim();
    if (!trimmed || trimmed === lastAnalyzedDescRef.current) return;
    lastAnalyzedDescRef.current = trimmed;
    const myId = ++requestIdRef.current;
    setReanalyzing(true);
    try {
      const res = await fetch("/api/tasks/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, mode: "description_only" }),
      });
      const data = await res.json();
      if (myId !== requestIdRef.current) return; // et nyere kald har overtaget
      if (!data.error) {
        const f = data.fields || {};
        const live = liveFieldsRef.current;
        if (f.title && f.title !== live.title && fieldSourceRef.current.title !== "user") {
          setTitleUndo({ previousValue: live.title });
          setTitle(f.title);
        }
        if (f.category && f.category !== live.category && fieldSourceRef.current.category !== "user") {
          setCategorySuggestion({ previousValue: live.category, newValue: f.category });
        }
      }
    } catch (err) {
      // Stille fejl (punkt 19) - kundens egne oplysninger er urørte.
    }
    if (myId === requestIdRef.current) setReanalyzing(false);
  }

  function handleTitleChange(value) {
    setTitle(value);
    markUser("title");
    setTitleUndo(null);
    if (fieldSource.category !== "default") return;

    const localMatch = matchCategoryFromText(value);
    if (localMatch) {
      setCategory(localMatch.name);
      setCategorySuggested(true);
      return;
    }

    // Ordlisten fandt intet - spørger AI'en efter en kort pause i skrivningen,
    // i stedet for ved hvert eneste tastetryk.
    clearTimeout(aiTimeout.current);
    if (value.trim().length < 6) return;
    aiTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/match-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: value }),
        });
        const data = await res.json();
        if (data.category && fieldSourceRef.current.category === "default") {
          setCategory(data.category);
          setCategorySuggested(true);
        }
      } catch (err) {
        // stille fejl - brugeren kan stadig vælge kategori selv
      }
    }, 900);
  }

  function handleCategoryChange(value) {
    setCategory(value);
    markUser("category");
    setCategorySuggested(false);
    setCategorySuggestion(null);
  }

  async function lookupCvr(value) {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length !== 8) {
      setCvrStatus(null);
      return;
    }
    setCvrStatus("loading");
    setCvrError("");
    try {
      const res = await fetch(`/api/cvr-lookup?cvr=${digitsOnly}`);
      const data = await res.json();
      if (data.error) {
        setCvrStatus("error");
        setCvrError(data.error);
        return;
      }
      setCvrStatus("found");
      if (!companyName.trim()) setCompanyName(data.name);
    } catch (err) {
      setCvrStatus("error");
      setCvrError("Kunne ikke slå CVR-nummeret op. Prøv igen.");
    }
  }

  async function submit() {
    if (!title.trim() || !description.trim()) {
      setError("Udfyld mindst titel og beskrivelse, før du opretter opgaven.");
      return;
    }
    setError("");
    const isFlexible = deadlineType === "flexible";
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: category || "Andet",
          budget,
          deadline: isFlexible ? "Fleksibel" : null,
          deadlineDate: isFlexible ? null : deadlineDate,
          isUrgent,
          description,
          postedBy: name,
          area: locationType === "in_person" ? area : "",
          locationType,
          address: locationType === "in_person" ? address : "",
          attachments,
          posterType,
          companyName,
          cvrNumber,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setOkId(data.task.caseNo);
      setTimeout(() => router.push("/"), 1000);
    } catch (e) {
      setError("Kunne ikke oprette opgaven. Prøv igen.");
    }
  }

  // ---- skærm 1: intro - fritekst, "✨ Fortsæt med AI" (punkt 1) ----
  if (screen === "intro") {
    return (
      <div>
        <h2 style={{ fontSize: 24, marginTop: 24, marginBottom: 6 }}>Opret en opgave</h2>
        <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>
          Beskriv kort, hvad du skal have hjælp til – så klarer AI resten. Det er gratis at oprette.
        </p>
        <div style={aiCardStyle}>
          <label style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "#14213D", marginBottom: 6 }}>Hvad skal du have hjælp til?</label>
          <p style={{ fontSize: 12.5, color: "#5B6478", marginBottom: 12, lineHeight: 1.5 }}>Beskriv det med dine egne ord. Du behøver ikke udfylde en masse felter.</p>
          <textarea
            value={wizardText}
            onChange={(e) => setWizardText(e.target.value)}
            placeholder="Fx: Jeg skal have bogført Q3 i Dinero inden 1. november. Mit budget er ca. 2.000 kr."
            style={{ ...inputStyle, minHeight: 110, resize: "vertical", marginBottom: 14, background: "#fff" }}
          />
          <button
            type="button"
            onClick={runInitialAnalysis}
            disabled={wizardLoading || !wizardText.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 14,
              fontWeight: 700,
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: "#2A55E5",
              color: "#fff",
              cursor: wizardLoading || !wizardText.trim() ? "default" : "pointer",
              opacity: wizardLoading || !wizardText.trim() ? 0.6 : 1,
            }}
          >
            <Sparkles size={14} />
            {wizardLoading ? "Analyserer…" : "Fortsæt med AI"}
          </button>
          <div style={{ marginTop: 14 }}>
            <button type="button" onClick={continueManually} style={{ ...linkBtnStyle, color: "#5B6478" }}>
              Udfyld formularen selv
            </button>
          </div>
          {wizardError && (
            <div style={errorBoxStyle}>
              {wizardError}
              <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                <button type="button" onClick={runInitialAnalysis} style={{ ...linkBtnStyle, color: "#C0392B" }}>Prøv igen</button>
                <button type="button" onClick={continueManually} style={{ ...linkBtnStyle, color: "#C0392B" }}>Fortsæt manuelt</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- skærm 2: spørg kun om det, der mangler (punkt 5-7) ----
  if (screen === "clarify") {
    return (
      <div>
        <h2 style={{ fontSize: 24, marginTop: 24, marginBottom: 6 }}>Lige et par spørgsmål</h2>
        <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 20 }}>
          AI har allerede udfyldt det meste - vi skal lige vide {missingFields.length === 1 ? "det her" : "de her ting"}, før opgaven er klar.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 660 }}>
          {missingFields.includes("category") && (
            <div style={cardStyle}>
              <label style={labelStyle}>Hvilken kategori passer bedst?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(categoryCandidates.length > 0 ? categoryCandidates : CATS.map((c) => c.name)).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => answerCategory(n)}
                    style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          {missingFields.includes("clarify") && clarifyingQuestion && (
            <div style={cardStyle}>
              <label style={labelStyle}>{clarifyingQuestion.question}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {clarifyingQuestion.options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => answerClarify(opt)}
                    style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {missingFields.includes("workMode") && (
            <div style={cardStyle}>
              <label style={labelStyle}>Hvor skal opgaven løses?</label>
              <div style={{ display: "flex", gap: 8 }}>
                <PillButton onClick={() => answerWorkMode("remote")}>Eksternt</PillButton>
                <PillButton onClick={() => answerWorkMode("in_person")}>Personligt fremmøde</PillButton>
              </div>
            </div>
          )}
          {missingFields.includes("posterType") && (
            <div style={cardStyle}>
              <label style={labelStyle}>Opretter du som privatperson eller virksomhed?</label>
              <div style={{ display: "flex", gap: 8 }}>
                <PillButton onClick={() => answerPosterType("private")}>Privatperson</PillButton>
                <PillButton onClick={() => answerPosterType("business")}>Virksomhed</PillButton>
              </div>
            </div>
          )}
          {missingFields.includes("budget") && (
            <div style={cardStyle}>
              <label style={labelStyle}>Har du et omtrentligt budget?</label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="f.eks. 1.500 kr"
                style={inputStyle}
              />
              <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
                <button type="button" onClick={() => answerBudget(budget)} style={linkBtnStyle}>Gem</button>
                <button type="button" onClick={() => answerBudget("")} style={{ ...linkBtnStyle, color: "#5B6478" }}>Ved ikke endnu</button>
              </div>
            </div>
          )}
          {missingFields.includes("deadline") && (
            <div style={cardStyle}>
              <label style={labelStyle}>Hvornår skal opgaven helst være løst?</label>
              <div style={{ display: "flex", gap: 8, marginBottom: deadlineType === "date" ? 8 : 0 }}>
                <PillButton active={deadlineType === "date"} onClick={() => answerDeadlineType("date")}>Vælg dato</PillButton>
                <PillButton active={deadlineType === "flexible"} onClick={() => answerDeadlineType("flexible")}>Fleksibel</PillButton>
              </div>
              {deadlineType === "date" && (
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={deadlineDate}
                  onChange={(e) => { setDeadlineDate(e.target.value); markUser("deadline"); }}
                  style={inputStyle}
                />
              )}
            </div>
          )}
          {missingFields.includes("priority") && (
            <div style={cardStyle}>
              <label style={labelStyle}>Hvor meget haster opgaven?</label>
              <div style={{ display: "flex", gap: 8 }}>
                <PillButton onClick={() => answerPriority(false)}>Normal opgave</PillButton>
                <PillButton danger onClick={() => answerPriority(true)}>⚡ Hasteopgave</PillButton>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- skærm 4: den eksisterende, fulde formular (uændret indhold, nu nået
  // via "Udfyld formularen selv"/"Rediger alle oplysninger" - punkt 16) ----
  if (screen === "form") {
    return (
      <div>
        <button type="button" onClick={() => setScreen("summary")} style={{ ...linkBtnStyle, color: "#5B6478", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, marginTop: 24 }}>
          <ArrowLeft size={13} /> Tilbage til resume
        </button>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Opret en opgave</h2>
        <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>
          Beskriv opgaven klart, så bydere ved præcis, hvad de byder på. Det er gratis at oprette.
        </p>
        <div style={{ ...cardStyle, padding: 30 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Opretter du som</label>
            <div style={{ display: "flex", gap: 8 }}>
              <PillButton active={posterType === "private"} onClick={() => { setPosterType("private"); markUser("posterType"); }}>Privatperson</PillButton>
              <PillButton active={posterType === "business"} onClick={() => { setPosterType("business"); markUser("posterType"); }}>Virksomhed</PillButton>
            </div>
            {posterType === "business" && (
              <div style={{ marginTop: 10 }}>
                <div style={{ position: "relative" }}>
                  <input
                    value={cvrNumber}
                    onChange={(e) => {
                      setCvrNumber(e.target.value);
                      lookupCvr(e.target.value);
                    }}
                    placeholder="CVR-nummer (8 cifre)"
                    maxLength={8}
                    style={inputStyle}
                  />
                  {cvrStatus === "loading" && (
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11.5, color: "#9AA2B1" }}>Slår op…</span>
                  )}
                </div>
                {cvrStatus === "found" && <div style={{ fontSize: 12, color: "#1AA37A", marginTop: 6, fontWeight: 600 }}>✓ Fundet: {companyName}</div>}
                {cvrStatus === "error" && <div style={{ fontSize: 12, color: "#C0392B", marginTop: 6 }}>{cvrError}</div>}
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Virksomhedens navn"
                  style={{ ...inputStyle, marginTop: 10 }}
                />
              </div>
            )}
          </div>
          <div className="kb-grid-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Titel</label>
              <input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="f.eks. Bogfør kvartalsregnskab for Q3" style={inputStyle} />
              {titleUndo && (
                <div style={{ fontSize: 11.5, color: "#5B6478", marginTop: 6 }}>
                  Opdateret ud fra din ændring af beskrivelsen. <button type="button" onClick={undoTitle} style={linkBtnStyle}>Fortryd</button>
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>
                Kategori {categorySuggested && <span style={{ color: "#1AA37A", fontWeight: 700 }}>· foreslået ud fra titlen</span>}
              </label>
              <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} style={inputStyle}>
                {!category && <option value="">Vælg kategori</option>}
                {CATS.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
              {categorySuggestion && (
                <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 10, background: "#F5F7FF", border: "1.5px solid #DCE4FB", fontSize: 12.5, color: "#14213D" }}>
                  Din ændring ser ud til at passe bedre under <strong>{categorySuggestion.newValue}</strong>.
                  <div style={{ marginTop: 8, display: "flex", gap: 14 }}>
                    <button type="button" onClick={acceptCategorySuggestion} style={linkBtnStyle}>Skift kategori</button>
                    <button type="button" onClick={keepCurrentCategory} style={linkBtnStyle}>Behold {category}</button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Budget</label>
              <input value={budget} onChange={(e) => { setBudget(e.target.value); markUser("budget"); }} placeholder="f.eks. 1.500 kr" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Frist for udarbejdelse</label>
              <div style={{ display: "flex", gap: 8, marginBottom: deadlineType === "date" ? 8 : 0 }}>
                <PillButton active={deadlineType === "date"} onClick={() => { setDeadlineType("date"); markUser("deadline"); }}>Vælg dato</PillButton>
                <PillButton active={deadlineType === "flexible"} onClick={() => { setDeadlineType("flexible"); markUser("deadline"); }}>Fleksibel</PillButton>
              </div>
              {deadlineType === "date" && (
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={deadlineDate}
                  onChange={(e) => { setDeadlineDate(e.target.value); markUser("deadline"); }}
                  style={inputStyle}
                />
              )}
              {deadlineType === "flexible" && <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 10 }}>Ingen fast deadline - I aftaler tidsplanen indbyrdes.</div>}
            </div>
            <div>
              <label style={labelStyle}>Har opgaven høj prioritet?</label>
              <div style={{ display: "flex", gap: 8 }}>
                <PillButton active={!isUrgent} onClick={() => { setIsUrgent(false); markUser("isUrgent"); }}>Normal opgave</PillButton>
                <PillButton active={isUrgent} danger onClick={() => { setIsUrgent(true); markUser("isUrgent"); }}>⚡ Hasteopgave</PillButton>
              </div>
              {isUrgent && (
                <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 10 }}>
                  Markér som hasteopgave, hvis du ønsker hjælp hurtigst muligt. Det koster ikke ekstra, og er ikke en garanti for en bestemt svartid - opgaven vises blot tydeligt for hjælperne som noget, du gerne vil have løst hurtigt.
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Område</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <PillButton active={locationType === "remote"} onClick={() => { setLocationType("remote"); markUser("locationType"); }}>Eksternt</PillButton>
                <PillButton active={locationType === "in_person"} onClick={() => { setLocationType("in_person"); markUser("locationType"); }}>Personligt fremmøde</PillButton>
              </div>
              {locationType === "remote" && <div style={{ fontSize: 11.5, color: "#9AA2B1" }}>Opgaven kan løses uden fysisk fremmøde.</div>}
              {locationType === "in_person" && (
                <>
                  <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="By/område, f.eks. Aarhus" style={{ ...inputStyle, marginBottom: 8 }} />
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Præcis adresse, f.eks. Frodesvej 12, 8000 Aarhus" style={inputStyle} />
                  <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>Den præcise adresse vises kun til den hjælper, hvis bud du vælger - ikke offentligt.</div>
                </>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Beskrivelse</label>
              <textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Beskriv opgaven, omfang og eventuelle systemer eller filer bydere skal kende til."
                style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
              />
              {reanalyzing && <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>Opdaterer forslag…</div>}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Vedhæftninger (valgfrit)</label>
              <FileUploader files={attachments} setFiles={setAttachments} />
            </div>
          </div>
          <button onClick={submit} style={primaryBtnStyle}>Opret opgave gratis</button>
          {error && <div style={errorBoxStyle}>{error}</div>}
          {okId && <div style={okBoxStyle}>✓ Opgave oprettet som {okId} og synlig for alle bydere.</div>}
        </div>
      </div>
    );
  }

  // ---- skærm 3 (standard): det levende, redigerbare resume (punkt 8-9) ----
  return (
    <div>
      <h2 style={{ fontSize: 24, marginTop: 24, marginBottom: 6 }}>Klar til at oprette</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 20 }}>Tjek oplysningerne igennem - du kan rette direkte herunder, uden at starte forfra.</p>
      <div style={cardStyle}>
        <SummaryRow label="Titel">
          <input value={title} onChange={(e) => { setTitle(e.target.value); markUser("title"); setTitleUndo(null); }} style={inputStyle} />
          {titleUndo && (
            <div style={{ fontSize: 11.5, color: "#5B6478", marginTop: 6 }}>
              Opdateret ud fra din ændring af beskrivelsen. <button type="button" onClick={undoTitle} style={linkBtnStyle}>Fortryd</button>
            </div>
          )}
        </SummaryRow>

        <SummaryRow label="Kategori">
          <select value={category} onChange={(e) => { setCategory(e.target.value); markUser("category"); setCategorySuggestion(null); }} style={inputStyle}>
            {CATS.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
          {categorySuggestion && (
            <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 10, background: "#F5F7FF", border: "1.5px solid #DCE4FB", fontSize: 12.5, color: "#14213D" }}>
              Din ændring ser ud til at passe bedre under <strong>{categorySuggestion.newValue}</strong>.
              <div style={{ marginTop: 8, display: "flex", gap: 14 }}>
                <button type="button" onClick={acceptCategorySuggestion} style={linkBtnStyle}>Skift kategori</button>
                <button type="button" onClick={keepCurrentCategory} style={linkBtnStyle}>Behold {category}</button>
              </div>
            </div>
          )}
        </SummaryRow>

        <SummaryRow label="Budget">
          <input value={budget} onChange={(e) => { setBudget(e.target.value); markUser("budget"); }} placeholder="Ikke angivet" style={inputStyle} />
        </SummaryRow>

        <SummaryRow label="Deadline">
          <div style={{ display: "flex", gap: 8, marginBottom: deadlineType === "date" ? 8 : 0 }}>
            <PillButton active={deadlineType === "date"} onClick={() => { setDeadlineType("date"); markUser("deadline"); }}>Vælg dato</PillButton>
            <PillButton active={deadlineType === "flexible"} onClick={() => { setDeadlineType("flexible"); markUser("deadline"); }}>Fleksibel</PillButton>
          </div>
          {deadlineType === "date" && (
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={deadlineDate}
              onChange={(e) => { setDeadlineDate(e.target.value); markUser("deadline"); }}
              style={inputStyle}
            />
          )}
          {deadlineType === "flexible" && <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 8 }}>Ingen fast deadline - I aftaler tidsplanen indbyrdes.</div>}
        </SummaryRow>

        <SummaryRow label="Udførelse">
          <div style={{ display: "flex", gap: 8 }}>
            <PillButton active={locationType === "remote"} onClick={() => { setLocationType("remote"); markUser("locationType"); }}>Eksternt</PillButton>
            <PillButton active={locationType === "in_person"} onClick={() => { setLocationType("in_person"); markUser("locationType"); }}>Personligt fremmøde</PillButton>
          </div>
          {locationType === "in_person" && (
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="By/område" style={{ ...inputStyle, marginTop: 8 }} />
          )}
        </SummaryRow>

        <SummaryRow label="Prioritet">
          <div style={{ display: "flex", gap: 8 }}>
            <PillButton active={!isUrgent} onClick={() => { setIsUrgent(false); markUser("isUrgent"); }}>Normal opgave</PillButton>
            <PillButton active={isUrgent} danger onClick={() => { setIsUrgent(true); markUser("isUrgent"); }}>⚡ Hasteopgave</PillButton>
          </div>
        </SummaryRow>

        <SummaryRow label="Beskrivelse">
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            onBlur={handleDescriptionBlur}
            style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
          />
          {reanalyzing && <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>Opdaterer forslag…</div>}
        </SummaryRow>

        <SummaryRow
          label="Opretter du som"
          note={posterType === "business" ? "CVR-nummer og virksomhedsnavn udfyldes i den fulde formular." : null}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <PillButton active={posterType === "private"} onClick={() => { setPosterType("private"); markUser("posterType"); }}>Privatperson</PillButton>
            <PillButton active={posterType === "business"} onClick={() => { setPosterType("business"); markUser("posterType"); }}>Virksomhed</PillButton>
          </div>
        </SummaryRow>

        <SummaryRow label="Har du noget, der hjælper med at forklare opgaven?">
          <FileUploader files={attachments} setFiles={setAttachments} compact />
        </SummaryRow>

        <button onClick={submit} style={primaryBtnStyle}>Opret opgave gratis</button>
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={() => setScreen("form")} style={linkBtnStyle}>Rediger alle oplysninger</button>
        </div>
        {error && <div style={errorBoxStyle}>{error}</div>}
        {okId && <div style={okBoxStyle}>✓ Opgave oprettet som {okId} og synlig for alle bydere.</div>}
      </div>
    </div>
  );
}

export default function PostTaskClient() {
  return (
    <RequireAuth title="Log ind for at oprette en opgave" subtitle="Du skal være logget ind, før du kan oprette en opgave.">
      <PostTaskPage />
    </RequireAuth>
  );
}
