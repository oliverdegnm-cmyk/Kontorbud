"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { CATS } from "@/lib/categories";
import { useName } from "@/lib/NameContext";
import FileUploader from "@/components/FileUploader";

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const { name } = useName();

  const [loaded, setLoaded] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATS[0].name);
  const [budget, setBudget] = useState("");
  const [deadlineType, setDeadlineType] = useState("date"); // "date" | "flexible"
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [locationType, setLocationType] = useState("remote"); // "remote" | "in_person"
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const qs = name ? `?viewerName=${encodeURIComponent(name)}` : "";
    fetch(`/api/tasks/${id}${qs}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setNotAllowed(true);
          setLoaded(true);
          return;
        }
        const t = data.task;
        if (t.postedBy !== name || t.status !== "open") {
          setNotAllowed(true);
          setLoaded(true);
          return;
        }
        setTitle(t.title);
        setCategory(t.category);
        setBudget(t.budget === "Ikke angivet" ? "" : t.budget);
        if (t.deadlineDate) {
          setDeadlineType("date");
          setDeadlineDate(t.deadlineDate.slice(0, 10));
        } else {
          setDeadlineType("flexible");
        }
        setLocationType(t.locationType === "in_person" ? "in_person" : "remote");
        setArea(t.area || "");
        setAddress(t.address || "");
        setDescription(t.description);
        setExistingAttachments(t.attachments || []);
        setLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, name]);

  async function submit() {
    if (!title.trim() || !description.trim()) {
      setError("Udfyld mindst titel og beskrivelse.");
      return;
    }
    setError("");
    const isFlexible = deadlineType === "flexible";
    const isInPerson = locationType === "in_person";
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requesterName: name,
        title,
        category,
        budget,
        deadline: isFlexible ? "Fleksibel" : null,
        deadlineDate: isFlexible ? null : deadlineDate,
        description,
        locationType,
        area: isInPerson ? area : "",
        address: isInPerson ? address : "",
        newAttachments,
      }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return;
    }
    setOk(true);
    setTimeout(() => router.push(`/opgave/${id}`), 800);
  }

  if (!loaded) return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Henter opgave…</div>;

  if (notAllowed) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>
        Du kan ikke redigere denne opgave - enten er den ikke din, eller også er den ikke længere åben.{" "}
        <Link href={`/opgave/${id}`} style={{ color: "#7C3AED", fontWeight: 700 }}>
          Tilbage til opgaven
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => router.push(`/opgave/${id}`)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#5B6478", cursor: "pointer", marginBottom: 18, marginTop: 24 }}
      >
        <ArrowLeft size={14} /> Tilbage til opgaven
      </div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Redigér opgave</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>Du kan kun redigere, mens opgaven stadig er åben og ikke har fået et valgt bud.</p>

      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 30, maxWidth: 660 }}>
        <div className="kb-grid-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Titel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}>
              {CATS.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Budget</label>
            <input value={budget} onChange={(e) => setBudget(e.target.value)} style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Frist for udarbejdelse</label>
            <div style={{ display: "flex", gap: 8, marginBottom: deadlineType === "date" ? 8 : 0 }}>
              <button
                type="button"
                onClick={() => setDeadlineType("date")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: deadlineType === "date" ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                  background: deadlineType === "date" ? "#F1EBFF" : "#fff",
                  color: deadlineType === "date" ? "#5B21B6" : "#5B6478",
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
                  border: deadlineType === "flexible" ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                  background: deadlineType === "flexible" ? "#F1EBFF" : "#fff",
                  color: deadlineType === "flexible" ? "#5B21B6" : "#5B6478",
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
              <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 10 }}>Ingen fast deadline - I aftaler tidsplanen indbyrdes.</div>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Område</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setLocationType("remote")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: locationType === "remote" ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                  background: locationType === "remote" ? "#F1EBFF" : "#fff",
                  color: locationType === "remote" ? "#5B21B6" : "#5B6478",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Eksternt
              </button>
              <button
                type="button"
                onClick={() => setLocationType("in_person")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: locationType === "in_person" ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                  background: locationType === "in_person" ? "#F1EBFF" : "#fff",
                  color: locationType === "in_person" ? "#5B21B6" : "#5B6478",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Personligt fremmøde
              </button>
            </div>
            {locationType === "remote" && (
              <div style={{ fontSize: 11.5, color: "#9AA2B1" }}>Opgaven kan løses uden fysisk fremmøde.</div>
            )}
            {locationType === "in_person" && (
              <>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="By/område, f.eks. Aarhus"
                  style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginBottom: 8 }}
                />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Præcis adresse"
                  style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
                />
                <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>
                  Den præcise adresse vises kun til den hjælper, hvis bud du vælger - ikke offentligt.
                </div>
              </>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Beskrivelse</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", minHeight: 110, fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", resize: "vertical" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Vedhæftninger</label>
            {existingAttachments.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                {existingAttachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "#7C3AED", background: "#F5F7FB", padding: "8px 12px", borderRadius: 8, width: "fit-content" }}
                  >
                    <FileText size={13} /> {a.filename}
                  </a>
                ))}
              </div>
            )}
            <FileUploader files={newAttachments} setFiles={setNewAttachments} />
          </div>
        </div>
        <button
          onClick={submit}
          style={{ marginTop: 20, fontSize: 14.5, fontWeight: 700, padding: "12px 22px", borderRadius: 12, border: "none", background: "#7C3AED", color: "#fff", cursor: "pointer" }}
        >
          Gem ændringer
        </button>
        {error && (
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>
            {error}
          </div>
        )}
        {ok && (
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A" }}>
            ✓ Opgave opdateret.
          </div>
        )}
      </div>
    </div>
  );
}
