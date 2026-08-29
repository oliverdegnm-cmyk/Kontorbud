"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATS } from "@/lib/categories";
import { useName } from "@/lib/NameContext";

export default function PostTaskPage() {
  const router = useRouter();
  const { name } = useName();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATS[0].name);
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [okId, setOkId] = useState("");

  async function submit() {
    if (!title.trim() || !description.trim()) {
      setError("Udfyld mindst titel og beskrivelse, før du opretter opgaven.");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, budget, deadline, description, postedBy: name, area }),
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Titel</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="f.eks. Bogfør kvartalsregnskab for Q3"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="f.eks. 5 dage"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
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
