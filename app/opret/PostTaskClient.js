"use client";

import RequireAuth from "@/components/RequireAuth";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATS, matchCategoryFromText } from "@/lib/categories";
import { useName } from "@/lib/NameContext";
import FileUploader from "@/components/FileUploader";

function PostTaskPage() {
  const router = useRouter();
  const { name } = useName();

  const searchParams = useSearchParams();
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const categoryFromUrl = searchParams.get("category");
  const [category, setCategory] = useState(CATS.some((c) => c.name === categoryFromUrl) ? categoryFromUrl : CATS[0].name);
  const [categoryTouched, setCategoryTouched] = useState(!!categoryFromUrl);
  const [categorySuggested, setCategorySuggested] = useState(false);
  const aiTimeout = useRef(null);

  function handleTitleChange(value) {
    setTitle(value);
    if (categoryTouched) return;

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
        if (data.category && !categoryTouched) {
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
    setCategoryTouched(true);
    setCategorySuggested(false);
  }

  const [budget, setBudget] = useState("");
  const [deadlineType, setDeadlineType] = useState("date"); // "date" | "flexible"
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [area, setArea] = useState("");
  const [posterType, setPosterType] = useState("private");
  const [companyName, setCompanyName] = useState("");
  const [cvrNumber, setCvrNumber] = useState("");
  const [cvrStatus, setCvrStatus] = useState(null); // null | "loading" | "found" | "error"
  const [cvrError, setCvrError] = useState("");
  const [description, setDescription] = useState(searchParams.get("description") || "");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [okId, setOkId] = useState("");

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
          category,
          budget,
          deadline: isFlexible ? "Fleksibel" : null,
          deadlineDate: isFlexible ? null : deadlineDate,
          description,
          postedBy: name,
          area,
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

  return (
    <div>
      <h2 style={{ fontSize: 24, marginTop: 24, marginBottom: 6 }}>Opret en opgave</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>
        Beskriv opgaven klart, så bydere ved præcis, hvad de byder på. Det er gratis at oprette.
      </p>
      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 30, maxWidth: 660 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 8 }}>Opretter du som</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setPosterType("private")}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 10,
                border: posterType === "private" ? "1.5px solid #2A55E5" : "1.5px solid #E4E8F0",
                background: posterType === "private" ? "#EEF2FF" : "#fff",
                color: posterType === "private" ? "#1B3AA6" : "#5B6478",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Privatperson
            </button>
            <button
              type="button"
              onClick={() => setPosterType("business")}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 10,
                border: posterType === "business" ? "1.5px solid #2A55E5" : "1.5px solid #E4E8F0",
                background: posterType === "business" ? "#EEF2FF" : "#fff",
                color: posterType === "business" ? "#1B3AA6" : "#5B6478",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Virksomhed
            </button>
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
                  style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
                />
                {cvrStatus === "loading" && (
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11.5, color: "#9AA2B1" }}>Slår op…</span>
                )}
              </div>
              {cvrStatus === "found" && (
                <div style={{ fontSize: 12, color: "#1AA37A", marginTop: 6, fontWeight: 600 }}>✓ Fundet: {companyName}</div>
              )}
              {cvrStatus === "error" && <div style={{ fontSize: 12, color: "#C0392B", marginTop: 6 }}>{cvrError}</div>}

              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Virksomhedens navn"
                style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginTop: 10 }}
              />
            </div>
          )}
        </div>
        <div className="kb-grid-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Titel</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="f.eks. Bogfør kvartalsregnskab for Q3"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>
              Kategori {categorySuggested && <span style={{ color: "#1AA37A", fontWeight: 700 }}>· foreslået ud fra titlen</span>}
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            >
              {CATS.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Budget</label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="f.eks. 1.500 kr"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Frist</label>
            <div style={{ display: "flex", gap: 8, marginBottom: deadlineType === "date" ? 8 : 0 }}>
              <button
                type="button"
                onClick={() => setDeadlineType("date")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: deadlineType === "date" ? "1.5px solid #2A55E5" : "1.5px solid #E4E8F0",
                  background: deadlineType === "date" ? "#EEF2FF" : "#fff",
                  color: deadlineType === "date" ? "#1B3AA6" : "#5B6478",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Vælg dato
              </button>
              <button
                type="button"
                onClick={() => setDeadlineType("flexible")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: deadlineType === "flexible" ? "1.5px solid #2A55E5" : "1.5px solid #E4E8F0",
                  background: deadlineType === "flexible" ? "#EEF2FF" : "#fff",
                  color: deadlineType === "flexible" ? "#1B3AA6" : "#5B6478",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Fleksibel
              </button>
            </div>
            {deadlineType === "date" && (
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
              />
            )}
            {deadlineType === "flexible" && (
              <div style={{ fontSize: 11.5, color: "#9AA2B1" }}>Ingen fast deadline - I aftaler tidsplanen indbyrdes.</div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Område (valgfrit)</label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="f.eks. København eller Kan løses eksternt"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Beskrivelse</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv opgaven, omfang og eventuelle systemer eller filer bydere skal kende til."
              style={{ width: "100%", minHeight: 110, fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", resize: "vertical" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Vedhæftninger (valgfrit)</label>
            <FileUploader files={attachments} setFiles={setAttachments} />
          </div>
        </div>
        <button
          onClick={submit}
          style={{ marginTop: 20, fontSize: 14.5, fontWeight: 700, padding: "12px 22px", borderRadius: 12, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer" }}
        >
          Opret opgave gratis
        </button>
        {error && (
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>
            {error}
          </div>
        )}
        {okId && (
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A" }}>
            ✓ Opgave oprettet som {okId} og synlig for alle bydere.
          </div>
        )}
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
