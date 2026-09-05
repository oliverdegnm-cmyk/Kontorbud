"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useName } from "@/lib/NameContext";
import { ShieldCheck, Trash2, Image as ImageIcon, Upload, MessageSquare, UserX } from "lucide-react";
import { upload } from "@vercel/blob/client";
import RequireAuth from "@/components/RequireAuth";

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

export default function AdminPage() {
  const { name, isAdmin, ready } = useName();
  const [tab, setTab] = useState("tasks");
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

  async function messageUser(userName) {
    const message = prompt(`Skriv en besked til ${userName}:`);
    if (!message?.trim()) return;
    const res = await fetch("/api/admin/message-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientName: userName, message }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    alert("Besked sendt.");
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
          onClick={() => setTab("images")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "images" ? "#2A55E5" : "transparent", color: tab === "images" ? "#fff" : "#5B6478" }}
        >
          Billeder
        </button>
        <button
          onClick={() => setTab("contact")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "contact" ? "#2A55E5" : "transparent", color: tab === "contact" ? "#fff" : "#5B6478" }}
        >
          Kontakt
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
                <Badge tone={t.status}>{t.status}</Badge>
                {t.paymentStatus !== "unpaid" && <Badge tone="matched">{t.paymentStatus}</Badge>}
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
                  onClick={() => messageUser(u.name)}
                  title="Send privat besked"
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "0 0 auto" }}
                >
                  <MessageSquare size={14} />
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

      {tab === "images" && <ImagesTab />}
      {tab === "contact" && <ContactSettings />}
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
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
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

function ImagesTab() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <ImageIcon size={16} color="#5B6478" />
        <span style={{ fontSize: 13, color: "#5B6478" }}>Skift billederne på forsiden og "Hvordan fungerer det" - ændringer er synlige for alle med det samme.</span>
      </div>
      <ImageSetting
        label="Forsidens hero-billede"
        settingKey="hero_image_url"
        defaultUrl="https://images.unsplash.com/photo-1758611972678-bc3b29b4718f?w=1400&auto=format&fit=crop&q=70"
        hint="Vises øverst på forsiden, bag det hvide kort."
      />
      <ImageSetting
        label='"Hvordan fungerer det"-billede'
        settingKey="how_it_works_image_url"
        defaultUrl="https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1400&auto=format&fit=crop&q=70"
        hint="Vises øverst på siden, der forklarer platformen."
      />
      <ImageSetting
        label='"Tryghed hele vejen"-billede'
        settingKey="trust_image_url"
        defaultUrl="https://images.unsplash.com/photo-1560264280-88b68371db39?w=1400&auto=format&fit=crop&q=70"
        hint='Vises øverst i "Tryghed hele vejen"-boksen på "Hvordan fungerer det"-siden.'
      />
    </div>
  );
}
