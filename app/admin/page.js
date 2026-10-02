"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useName } from "@/lib/NameContext";
import { ShieldCheck, Trash2, Image as ImageIcon, Upload, MessageSquare, UserX, LifeBuoy } from "lucide-react";
import { upload } from "@vercel/blob/client";
import RequireAuth from "@/components/RequireAuth";
import MessageThread from "@/components/MessageThread";
import { SUPPORT_SENDER } from "@/lib/support";

// Skalerer og komprimerer et uploadet billede i browseren, før det sendes til Blob-lageret -
// så store, rå foto-filer fra en telefon (ofte 4000px+ og flere MB) altid ender som et skarpt,
// hurtigt-indlæsende JPEG i en fornuftig størrelse, uanset hvad der uploades. Fejler optimeringen
// af en eller anden grund, uploades originalfilen i stedet, så upload aldrig går i stå.
// maxDim/quality er bevidst sat i den høje ende (2400px / 92%) - både hero- og kontaktfoto kan
// zoomes op til 200% i admin-panelet (CSS-forstørrelse af selve billedet), så kilden skal have
// margin nok til stadig at se skarp ud forstørret, uden at det først bliver udvisket her.
async function optimizeImage(file, maxDim = 2400, quality = 0.92) {
  if (!file.type?.startsWith("image/") || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (err) {
    console.error("Kunne ikke optimere billedet, uploader originalen i stedet:", err);
    return file;
  }
}

function Badge({ children, tone }) {
  const tones = {
    open: { bg: "#FFF1E0", color: "#B5610E" },
    matched: { bg: "#EEF2FF", color: "#1B3AA6" },
    completed: { bg: "#E9F9F1", color: "#146B4E" },
    cancelled: { bg: "#F5F7FB", color: "#5B6478" },
  };
  const t = tones[tone] || tones.open;
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: t.bg, color: t.color, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function AdminPageInner() {
  const { name, isAdmin, ready } = useName();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "support" ? "support" : "tasks");
  const [supportUser, setSupportUser] = useState(searchParams.get("bruger") || null);
  const [tasks, setTasks] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");

  function loadTasks() {
    fetch("/api/admin/tasks")
      .then((r) => r.json())
      .then((data) => (data.error ? setError(data.error) : setTasks(data.tasks)));
  }
  function loadUsers() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => (data.error ? setError(data.error) : setUsers(data.users)));
  }

  useEffect(() => {
    if (!isAdmin) return;
    loadTasks();
    loadUsers();
  }, [isAdmin]);

  async function deleteTask(id, title) {
    if (!confirm(`Slet "${title}" permanent? Eventuel holdt betaling refunderes automatisk. Kan ikke fortrydes.`)) return;
    const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    loadTasks();
  }

  async function reconcilePayment(id, title) {
    if (!confirm(`Slå op hos Stripe, om betalingen for "${title}" faktisk gik igennem, og ret opgaven hvis den gjorde?`)) return;
    const res = await fetch(`/api/admin/tasks/${id}/reconcile-payment`, { method: "POST" });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    alert("Opgaven er rettet - betalingen blev fundet hos Stripe og markeret som holdt.");
    loadTasks();
  }

  async function deleteUser(id, userName) {
    if (!confirm(`Slet kontoen for "${userName}" permanent? De kan ikke længere logge ind. Deres opgaver og bud bliver ikke slettet. Kan ikke fortrydes.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    loadUsers();
  }

  async function toggleAdmin(id, userName, currentlyAdmin) {
    const question = currentlyAdmin
      ? `Fjern administrator-adgang fra "${userName}"?`
      : `Gør "${userName}" til administrator? De får derefter fuld adgang til denne admin-side.`;
    if (!confirm(question)) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !currentlyAdmin }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    loadUsers();
  }

  function openSupportThread(userName) {
    setSupportUser(userName);
    setTab("support");
  }

  if (!ready) return null;
  if (!name) {
    return (
      <div style={{ marginTop: 24 }}>
        <RequireAuth title="Log ind som administrator" subtitle="Denne side kræver administrator-adgang." />
      </div>
    );
  }
  if (!isAdmin) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Ingen adgang.</div>;
  }

  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <ShieldCheck size={20} color="#2A55E5" />
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Admin</h2>
      </div>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>Overblik til kundeservice - alle opgaver og brugere, uanset status.</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 22, background: "#F5F7FB", borderRadius: 10, padding: 4, width: "fit-content" }}>
        <button
          onClick={() => setTab("tasks")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "tasks" ? "#2A55E5" : "transparent", color: tab === "tasks" ? "#fff" : "#5B6478" }}
        >
          Opgaver
        </button>
        <button
          onClick={() => setTab("users")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "users" ? "#2A55E5" : "transparent", color: tab === "users" ? "#fff" : "#5B6478" }}
        >
          Brugere
        </button>
        <button
          onClick={() => setTab("contact")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "contact" ? "#2A55E5" : "transparent", color: tab === "contact" ? "#fff" : "#5B6478" }}
        >
          Kontakt
        </button>
        <button
          onClick={() => setTab("images")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "images" ? "#2A55E5" : "transparent", color: tab === "images" ? "#fff" : "#5B6478" }}
        >
          Billeder
        </button>
        <button
          onClick={() => setTab("support")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "support" ? "#2A55E5" : "transparent", color: tab === "support" ? "#fff" : "#5B6478" }}
        >
          Support
        </button>
      </div>

      {error && <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>{error}</div>}

      {tab === "tasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks === null && <p style={{ color: "#5B6478", fontSize: 13.5 }}>Henter…</p>}
          {tasks && tasks.length === 0 && <p style={{ color: "#5B6478", fontSize: 13.5 }}>Ingen opgaver endnu.</p>}
          {tasks &&
            tasks.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: "14px 18px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/opgave/${t.id}`} style={{ fontWeight: 700, fontSize: 13.5, color: "#14213D" }}>
                    {t.title}
                  </Link>
                  <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 2 }}>
                    {t.caseNo} · {t.category} · oprettet af {t.postedBy} · {t.bidCount} bud
                  </div>
                </div>
                {t.isUrgent && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#FDEDEB", color: "#C0392B", flex: "0 0 auto", whiteSpace: "nowrap" }}>
                    ⚡ Haster
                  </span>
                )}
                <Badge tone={t.status}>{t.status}</Badge>
                {t.paymentStatus !== "unpaid" && <Badge tone="matched">{t.paymentStatus}</Badge>}
                {t.status === "open" && t.pendingBidId && (
                  <button
                    onClick={() => reconcilePayment(t.id, t.title)}
                    title="Denne opgave venter på en betaling, der måske gik igennem hos Stripe uden at nå frem hertil. Klik for at tjekke og reparere."
                    style={{ fontSize: 11.5, fontWeight: 700, padding: "6px 12px", borderRadius: 999, border: "1.5px solid #F5D9AE", background: "#FFF1E0", color: "#B5610E", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    ⚠ Tjek betaling
                  </button>
                )}
                <button
                  onClick={() => deleteTask(t.id, t.title)}
                  title="Slet permanent"
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "0 0 auto" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>
      )}

      {tab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users === null && <p style={{ color: "#5B6478", fontSize: 13.5 }}>Henter…</p>}
          {users &&
            users.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: "14px 18px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/bruger/${encodeURIComponent(u.name)}`} style={{ fontWeight: 700, fontSize: 13.5, color: "#14213D" }}>
                    {u.name}
                  </Link>
                  <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 2 }}>{u.email}</div>
                </div>
                {u.isAdmin && <Badge tone="matched">Admin</Badge>}
                {u.emailVerified ? <Badge tone="completed">Email bekræftet</Badge> : <Badge tone="open">Email ikke bekræftet</Badge>}
                {u.stripeConnected ? <Badge tone="completed">Stripe forbundet</Badge> : <Badge tone="cancelled">Ingen Stripe</Badge>}
                <button
                  onClick={() => openSupportThread(u.name)}
                  title="Se/send support-besked"
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "0 0 auto" }}
                >
                  <MessageSquare size={14} />
                </button>
                <button
                  onClick={() => toggleAdmin(u.id, u.name, u.isAdmin)}
                  title={u.isAdmin ? "Fjern administrator-adgang" : "Gør til administrator"}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: u.isAdmin ? "1.5px solid #E4E8F0" : "1.5px solid #C7D3FA",
                    background: u.isAdmin ? "#fff" : "#EEF2FF",
                    color: u.isAdmin ? "#5B6478" : "#1B3AA6",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flex: "0 0 auto",
                  }}
                >
                  {u.isAdmin ? "Fjern admin" : "Gør til admin"}
                </button>
                {!u.isAdmin && (
                  <button
                    onClick={() => deleteUser(u.id, u.name)}
                    title="Slet konto"
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "0 0 auto" }}
                  >
                    <UserX size={14} />
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      {tab === "contact" && <ContactSettings />}
      {tab === "images" && <ImagesTab />}
      {tab === "support" && <SupportTab presetUser={supportUser} />}
    </div>
  );
}

// useSearchParams() kræver en Suspense-grænse omkring sig i App Router, ellers fejler
// den statiske build-prerendering af siden (se Vercel build-fejl 19/9). AdminPageInner
// gør det egentlige arbejde, denne wrapper sørger bare for grænsen.
export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageInner />
    </Suspense>
  );
}

function SupportTab({ presetUser }) {
  const [threads, setThreads] = useState(null);
  const [selected, setSelected] = useState(presetUser || null);
  const [manualName, setManualName] = useState("");

  function loadThreads() {
    fetch("/api/admin/support-threads")
      .then((r) => r.json())
      .then((data) => !data.error && setThreads(data.threads));
  }

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (presetUser) setSelected(presetUser);
  }, [presetUser]);

  function startManual() {
    const trimmed = manualName.trim();
    if (!trimmed) return;
    setSelected(trimmed);
    setManualName("");
  }

  return (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ width: 260, flex: "0 0 auto", background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", marginBottom: 10, padding: "0 4px" }}>Igangværende samtaler</div>
        {threads === null && <p style={{ fontSize: 12.5, color: "#5B6478", padding: "0 4px" }}>Henter…</p>}
        {threads && threads.length === 0 && <p style={{ fontSize: 12.5, color: "#5B6478", padding: "0 4px" }}>Ingen support-beskeder endnu.</p>}
        {threads &&
          threads.map((t) => (
            <button
              key={t.userName}
              onClick={() => setSelected(t.userName)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                fontSize: 12.5,
                padding: "9px 10px",
                borderRadius: 8,
                border: "none",
                background: selected === t.userName ? "#EEF2FF" : "transparent",
                color: "#14213D",
                cursor: "pointer",
                marginBottom: 2,
              }}
            >
              <div style={{ fontWeight: 700 }}>{t.userName}</div>
              <div style={{ color: "#9AA2B1", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.lastSender === SUPPORT_SENDER ? "Support: " : `${t.userName}: `}
                {t.lastBody}
              </div>
            </button>
          ))}

        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0F1F5" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#5B6478", marginBottom: 6, padding: "0 4px" }}>Start ny samtale</div>
          <div style={{ display: "flex", gap: 6, padding: "0 4px" }}>
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startManual()}
              placeholder="Brugernavn"
              style={{ flex: 1, fontSize: 12.5, padding: "8px 10px", border: "1.5px solid #E4E8F0", borderRadius: 8 }}
            />
            <button
              onClick={startManual}
              style={{ fontSize: 12, fontWeight: 700, padding: "0 12px", borderRadius: 8, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer" }}
            >
              Gå
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 280, background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: 16 }}>
        {selected ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <LifeBuoy size={15} color="#2A55E5" />
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{selected}</div>
            </div>
            <MessageThread
              key={selected}
              endpoint="/api/messages/support"
              bidderName={selected}
              currentName={SUPPORT_SENDER}
              placeholder="Svar som Kontorbud support…"
              maxHeight={360}
            />
          </>
        ) : (
          <p style={{ fontSize: 13.5, color: "#5B6478" }}>Vælg en samtale i listen, eller start en ny.</p>
        )}
      </div>
    </div>
  );
}

function ImagesTab() {
  return (
    <div>
      <HeroImagesSetting />
      {/* 11/10: de to faste kontaktside-fotos (Josefine + Anna) er afløst af en
          admin-styret liste, så Oliver selv kan tilføje/fjerne medarbejdere -
          se StaffMembersSetting herunder og app/kontakt/KontaktClient.js. */}
      <StaffMembersSetting />
    </div>
  );
}

// 11/10: ønske fra Oliver om at kunne tilføje/fjerne kontaktside-medarbejdere
// selv, i stedet for kun at kunne justere de to faste personer Josefine og
// Anna. Modelleret direkte efter HeroImagesSetting herover (samme JSON-liste-
// mønster i site_settings), men med navn + titel som ekstra, redigerbare
// felter pr. person. Gemmes som JSON i site_settings-nøglen "staff_members"
// (se lib/staff.js, som bruges af både denne fane og den offentlige side).
function StaffMembersSetting() {
  const [staff, setStaff] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rowUploading, setRowUploading] = useState(null);
  const [rowSaved, setRowSaved] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        const settings = data.settings || {};
        try {
          const parsed = settings.staff_members ? JSON.parse(settings.staff_members) : null;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStaff(parsed);
            return;
          }
        } catch (err) {
          // ugyldig JSON - fald igennem til migreringen herunder
        }
        // Migrering: endnu ingen gemt medarbejderliste - byg den ud fra de to
        // faste fotos, der var sat op før denne fane fandtes, så Oliver ikke
        // selv skal genoprette Josefine og Anna første gang han åbner denne fane.
        setStaff([
          {
            name: "Josefine Mortensen",
            title: "Kundeservice Medarbejder",
            url: settings.kontakt_foto || "/kontakt-foto.jpg",
            position: settings.kontakt_foto_position ? parseFloat(settings.kontakt_foto_position) : 50,
            zoom: settings.kontakt_foto_zoom ? parseFloat(settings.kontakt_foto_zoom) : 100,
          },
          {
            name: "Anna Minaei",
            title: "Kundeservice Medarbejder",
            url: settings.kontakt_foto_2 || "/kontakt-foto-anna.jpg",
            position: settings.kontakt_foto_2_position ? parseFloat(settings.kontakt_foto_2_position) : 50,
            zoom: settings.kontakt_foto_2_zoom ? parseFloat(settings.kontakt_foto_2_zoom) : 100,
          },
        ]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function persist(next) {
    setStaff(next);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "staff_members", value: JSON.stringify(next) }),
    });
  }

  function updateField(idx, field, value) {
    setStaff((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  async function addMember(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const optimized = await optimizeImage(file);
      const blob = await upload(optimized.name, optimized, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ purpose: "image" }),
      });
      await persist([...staff, { name: "", title: "Kundeservice Medarbejder", url: blob.url, position: 50, zoom: 100 }]);
    } catch (err) {
      setError(err?.message || "Kunne ikke uploade billedet. Prøv igen.");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function changePhoto(idx, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRowUploading(idx);
    setError("");
    try {
      const optimized = await optimizeImage(file);
      const blob = await upload(optimized.name, optimized, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ purpose: "image" }),
      });
      const next = staff.map((p, i) => (i === idx ? { ...p, url: blob.url, position: 50, zoom: 100 } : p));
      await persist(next);
    } catch (err) {
      setError(err?.message || "Kunne ikke uploade billedet. Prøv igen.");
    }
    setRowUploading(null);
    e.target.value = "";
  }

  async function removeMember(idx) {
    await persist(staff.filter((_, i) => i !== idx));
  }

  async function saveRow(idx) {
    await persist(staff);
    setRowSaved(idx);
    setTimeout(() => setRowSaved(null), 2000);
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Medarbejdere på kontaktsiden</div>
      <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 14 }}>
        Vises til højre på kontaktsiden (skjules på mobil). Tilføj, fjern eller ret navn, titel og foto efter behov.
      </div>

      {!loaded && <p style={{ color: "#5B6478", fontSize: 13.5 }}>Henter…</p>}
      {loaded && staff.length === 0 && (
        <p style={{ color: "#5B6478", fontSize: 13, marginBottom: 14 }}>Der er ingen medarbejdere sat op endnu - tilføj én herunder.</p>
      )}

      {loaded && staff.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 14 }}>
          {staff.map((person, idx) => (
            <div key={idx} style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 140, height: 130, borderRadius: 12, border: "1px solid #E4E8F0", overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={person.url}
                    alt={person.name || `Medarbejder ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: `center ${person.position}%`,
                      transform: `scale(${(person.zoom || 100) / 100})`,
                      transformOrigin: "center",
                      display: "block",
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <input
                    value={person.name}
                    onChange={(e) => updateField(idx, "name", e.target.value)}
                    placeholder="Navn"
                    style={{ width: "100%", fontSize: 13.5, fontWeight: 700, padding: "9px 12px", border: "1.5px solid #E4E8F0", borderRadius: 8, background: "#F5F7FB", marginBottom: 8 }}
                  />
                  <input
                    value={person.title}
                    onChange={(e) => updateField(idx, "title", e.target.value)}
                    placeholder="Titel"
                    style={{ width: "100%", fontSize: 13, padding: "9px 12px", border: "1.5px solid #E4E8F0", borderRadius: 8, background: "#F5F7FB" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, marginTop: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "#5B6478", marginBottom: 4 }}>
                    <span>Lodret position</span>
                    <span>{person.position}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={person.position} onChange={(e) => updateField(idx, "position", Number(e.target.value))} style={{ width: "100%" }} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "#5B6478", marginBottom: 4 }}>
                    <span>Zoom</span>
                    <span>{person.zoom}%</span>
                  </div>
                  <input type="range" min="100" max="200" value={person.zoom} onChange={(e) => updateField(idx, "zoom", Number(e.target.value))} style={{ width: "100%" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => saveRow(idx)}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#14213D", cursor: "pointer" }}
                >
                  Gem
                </button>
                <label
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1.5px solid #E4E8F0",
                    background: "#fff",
                    color: "#14213D",
                    cursor: rowUploading === idx ? "default" : "pointer",
                    opacity: rowUploading === idx ? 0.6 : 1,
                  }}
                >
                  {rowUploading === idx ? "Uploader…" : "Skift foto"}
                  <input type="file" accept="image/*" onChange={(e) => changePhoto(idx, e)} disabled={rowUploading === idx} style={{ display: "none" }} />
                </label>
                <button
                  onClick={() => removeMember(idx)}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", cursor: "pointer" }}
                >
                  Fjern
                </button>
                {rowSaved === idx && <span style={{ fontSize: 12, fontWeight: 700, color: "#1AA37A" }}>✓ Gemt</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 700,
          padding: "10px 18px",
          borderRadius: 10,
          border: "1.5px solid #E4E8F0",
          color: "#14213D",
          cursor: uploading ? "default" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <Upload size={14} />
        {uploading ? "Uploader…" : "Tilføj medarbejder"}
        <input type="file" accept="image/*" onChange={addMember} disabled={uploading} style={{ display: "none" }} />
      </label>
      <div style={{ fontSize: 11, color: "#9AA2B1", marginTop: 8 }}>Upload et foto for at tilføje en ny medarbejder, og udfyld navn/titel bagefter.</div>
      {error && <div style={{ marginTop: 10, fontSize: 12.5, color: "#C0392B" }}>{error}</div>}
    </div>
  );
}

function HeroImagesSetting() {
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adjustSaved, setAdjustSaved] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        try {
          const parsed = JSON.parse(data.settings?.hero_images || "[]");
          if (Array.isArray(parsed)) setImages(parsed);
        } catch (err) {
          // behold tom liste, hvis noget ikke kan tolkes
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function persist(next) {
    setImages(next);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "hero_images", value: JSON.stringify(next) }),
    });
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const optimized = await optimizeImage(file);
      const blob = await upload(optimized.name, optimized, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ purpose: "image" }),
      });
      const next = [...images, { url: blob.url, position: 50, zoom: 100 }];
      await persist(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || "Kunne ikke uploade billedet. Prøv igen.");
    }
    setUploading(false);
    e.target.value = "";
  }

  function updateField(idx, field, value) {
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, [field]: value } : img)));
  }

  async function saveAdjustment(idx) {
    await persist(images);
    setAdjustSaved(idx);
    setTimeout(() => setAdjustSaved(null), 2000);
  }

  async function removeImage(idx) {
    const next = images.filter((_, i) => i !== idx);
    await persist(next);
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Billede i forsidens rubrik</div>
      <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 14 }}>
        Vises i højre side af forsidens rubrik (skjules på mobil). Tilføj flere billeder, så skifter de automatisk hvert 6. sekund.
      </div>

      {!loaded && <p style={{ color: "#5B6478", fontSize: 13.5 }}>Henter…</p>}
      {loaded && images.length === 0 && (
        <p style={{ color: "#5B6478", fontSize: 13, marginBottom: 14 }}>Der er intet billede sat op endnu - upload ét herunder.</p>
      )}

      {loaded && images.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 14 }}>
          {images.map((img, idx) => (
            <div key={img.url + idx} style={{ border: "1px solid #E4E8F0", borderRadius: 12, padding: 14 }}>
              <div style={{ width: "100%", maxWidth: 320, height: 140, borderRadius: 12, border: "1px solid #E4E8F0", overflow: "hidden", marginBottom: 12 }}>
                <img
                  src={img.url}
                  alt={`Billede ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `center ${img.position}%`,
                    transform: `scale(${img.zoom / 100})`,
                    transformOrigin: "center",
                    display: "block",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "#5B6478", marginBottom: 4 }}>
                    <span>Lodret position</span>
                    <span>{img.position}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={img.position} onChange={(e) => updateField(idx, "position", Number(e.target.value))} style={{ width: "100%" }} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "#5B6478", marginBottom: 4 }}>
                    <span>Zoom</span>
                    <span>{img.zoom}%</span>
                  </div>
                  <input type="range" min="100" max="200" value={img.zoom} onChange={(e) => updateField(idx, "zoom", Number(e.target.value))} style={{ width: "100%" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  onClick={() => saveAdjustment(idx)}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#14213D", cursor: "pointer" }}
                >
                  Gem justering
                </button>
                <button
                  onClick={() => removeImage(idx)}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", cursor: "pointer" }}
                >
                  Fjern
                </button>
                {adjustSaved === idx && <span style={{ fontSize: 12, fontWeight: 700, color: "#1AA37A" }}>✓ Gemt</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 700,
          padding: "10px 18px",
          borderRadius: 10,
          border: "1.5px solid #E4E8F0",
          color: "#14213D",
          cursor: uploading ? "default" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <Upload size={14} />
        {uploading ? "Uploader…" : "Upload nyt billede"}
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
      </label>
      <div style={{ fontSize: 11, color: "#9AA2B1", marginTop: 8 }}>Billeder skaleres og komprimeres automatisk ved upload.</div>
      {saved && <span style={{ marginLeft: 12, fontSize: 12.5, fontWeight: 700, color: "#1AA37A" }}>✓ Gemt</span>}
      {error && <div style={{ marginTop: 10, fontSize: 12.5, color: "#C0392B" }}>{error}</div>}
    </div>
  );
}

function ImageSetting({ label, settingKey, defaultUrl, hint }) {
  const [current, setCurrent] = useState(defaultUrl);
  const [position, setPosition] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adjustSaved, setAdjustSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.[settingKey]) setCurrent(data.settings[settingKey]);
        if (data.settings?.[`${settingKey}_position`]) setPosition(parseFloat(data.settings[`${settingKey}_position`]));
        if (data.settings?.[`${settingKey}_zoom`]) setZoom(parseFloat(data.settings[`${settingKey}_zoom`]));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSaved(false);
    try {
      const optimized = await optimizeImage(file);
      const blob = await upload(optimized.name, optimized, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ purpose: "image" }),
      });
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: settingKey, value: blob.url }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCurrent(blob.url);
        setPosition(50);
        setZoom(100);
        await saveAdjustment(settingKey, 50, 100);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      setError(err?.message || "Kunne ikke uploade billedet. Prøv igen.");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function saveAdjustment(key, pos, zm) {
    await Promise.all([
      fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: `${key}_position`, value: String(pos) }),
      }),
      fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: `${key}_zoom`, value: String(zm) }),
      }),
    ]);
  }

  async function handleSaveAdjustment() {
    await saveAdjustment(settingKey, position, zoom);
    setAdjustSaved(true);
    setTimeout(() => setAdjustSaved(false), 2000);
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 14 }}>{hint}</div>

      <div style={{ width: "100%", maxWidth: 480, height: 140, borderRadius: 12, border: "1px solid #E4E8F0", overflow: "hidden", marginBottom: 14 }}>
        <img
          src={current}
          alt={label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `center ${position}%`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center",
            display: "block",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480, marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "#5B6478", marginBottom: 4 }}>
            <span>Lodret position</span>
            <span>{position}%</span>
          </div>
          <input type="range" min="0" max="100" value={position} onChange={(e) => setPosition(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: "#5B6478", marginBottom: 4 }}>
            <span>Zoom</span>
            <span>{zoom}%</span>
          </div>
          <input type="range" min="100" max="200" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        <button
          onClick={handleSaveAdjustment}
          style={{ alignSelf: "flex-start", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#14213D", cursor: "pointer" }}
        >
          Gem justering
        </button>
        {adjustSaved && <span style={{ fontSize: 12, fontWeight: 700, color: "#1AA37A" }}>✓ Justering gemt</span>}
      </div>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 700,
          padding: "10px 18px",
          borderRadius: 10,
          border: "1.5px solid #E4E8F0",
          color: "#14213D",
          cursor: uploading ? "default" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <Upload size={14} />
        {uploading ? "Uploader…" : "Upload nyt billede"}
        <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} style={{ display: "none" }} />
      </label>
      <div style={{ fontSize: 11, color: "#9AA2B1", marginTop: 8 }}>Billeder skaleres og komprimeres automatisk ved upload.</div>
      {saved && <span style={{ marginLeft: 12, fontSize: 12.5, fontWeight: 700, color: "#1AA37A" }}>✓ Gemt</span>}
      {error && <div style={{ marginTop: 10, fontSize: 12.5, color: "#C0392B" }}>{error}</div>}
    </div>
  );
}

function ContactSettings() {
  const [contactEmail, setContactEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.contact_email) setContactEmail(data.settings.contact_email);
      });
  }, []);

  async function save() {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "contact_email", value: contactEmail }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Kontaktformular</div>
      <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 14 }}>Beskeder fra "Kontakt"-siden sendes til denne email.</div>
      <input
        type="email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        placeholder="support@dinvirksomhed.dk"
        style={{ width: "100%", maxWidth: 340, fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginBottom: 12 }}
      />
      <div>
        <button
          onClick={save}
          style={{ fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer" }}
        >
          Gem
        </button>
        {saved && <span style={{ marginLeft: 12, fontSize: 12.5, fontWeight: 700, color: "#1AA37A" }}>✓ Gemt</span>}
      </div>
    </div>
  );
}
