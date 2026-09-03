"use client";

import { useEffect, useState } from "react";
import { useName } from "@/lib/NameContext";

export default function ProfilePage() {
  const { name, emailVerified } = useName();
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!name) return;
    fetch(`/api/profiles/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setBio(data.profile.bio || "");
          setSkills(data.profile.skills || "");
          setPortfolio(data.profile.portfolio || "");
        }
        setLoaded(true);
      });
  }, [name]);

  async function save() {
    setSaved(false);
    await fetch(`/api/profiles/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, skills, portfolio }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!loaded) return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Henter profil…</div>;

  return (
    <div style={{ marginTop: 24, maxWidth: 660 }}>
      <h2 style={{ fontSize: 24, marginBottom: 4 }}>Din profil</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>
        Vises for andre, når de ser dine bud eller opgaver — ligesom en hjælperprofil på Handyhand.
      </p>

      {!emailVerified && <EmailVerifyBanner />}

      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 26 }}>
        <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Om dig</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Kort om dig selv — baggrund, erfaring, hvad du er god til."
          style={{ width: "100%", minHeight: 90, fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", resize: "vertical" }}
        />

        <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", margin: "18px 0 6px" }}>Kompetencer</label>
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="f.eks. Bogføring, Excel, kundeservice, dansk/engelsk oversættelse"
          style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
        />
        <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>Adskil gerne med komma.</div>

        <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", margin: "18px 0 6px" }}>Portfolio / CV</label>
        <textarea
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          placeholder="Tidligere opgaver, uddannelse, link til CV eller LinkedIn."
          style={{ width: "100%", minHeight: 90, fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", resize: "vertical" }}
        />

        <button
          onClick={save}
          style={{ marginTop: 20, fontSize: 14.5, fontWeight: 700, padding: "12px 22px", borderRadius: 12, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer" }}
        >
          Gem profil
        </button>
        {saved && (
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A" }}>
            ✓ Profil gemt.
          </div>
        )}
      </div>
    </div>
  );
}

function EmailVerifyBanner() {
  const { name } = useName();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function resend() {
    setError("");
    const res = await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return;
    }
    setSent(true);
  }

  return (
    <div style={{ background: "#FFF1E0", border: "1.5px solid #F5D9AE", borderRadius: 14, padding: "14px 18px", marginBottom: 22, fontSize: 13.5, color: "#B5610E" }}>
      <b>Din email er ikke bekræftet endnu.</b> Tjek din indbakke for et bekræftelseslink.
      {!sent ? (
        <button
          onClick={resend}
          style={{ marginLeft: 8, fontSize: 12.5, fontWeight: 700, color: "#B5610E", background: "none", border: "none", textDecoration: "underline", cursor: "pointer", padding: 0 }}
        >
          Send igen
        </button>
      ) : (
        <span style={{ marginLeft: 8, fontWeight: 700 }}>✓ Sendt igen</span>
      )}
      {error && <div style={{ marginTop: 6 }}>{error}</div>}
    </div>
  );
}
