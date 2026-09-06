"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useName } from "@/lib/NameContext";
import RequireAuth from "@/components/RequireAuth";
import Stars from "@/components/Stars";
import { FileText, Upload, X, Globe, Linkedin, ShieldCheck, User, Briefcase, CheckCircle2 } from "lucide-react";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 18, padding: 24, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "#EEF2FF", color: "#2A55E5", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <Icon size={15} />
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 800 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" };
const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 };

function ProfilePage() {
  const { name, emailVerified } = useName();
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [cvUrl, setCvUrl] = useState(null);
  const [cvFilename, setCvFilename] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState("");

  const [level, setLevel] = useState(null);

  useEffect(() => {
    if (!name) return;
    fetch(`/api/profiles/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setBio(data.profile.bio || "");
          setSkills(data.profile.skills || "");
          setPortfolio(data.profile.portfolio || "");
          setWebsiteUrl(data.profile.websiteUrl || "");
          setLinkedinUrl(data.profile.linkedinUrl || "");
          setCvUrl(data.profile.cvUrl || null);
          setCvFilename(data.profile.cvFilename || null);
        }
        setLoaded(true);
      });
    fetch(`/api/helpers/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => !data.error && setLevel(data));
  }, [name]);

  async function save() {
    setSaved(false);
    await fetch(`/api/profiles/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, skills, portfolio, websiteUrl, linkedinUrl }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleCvChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setCvError("Kun PDF-filer er understøttet.");
      e.target.value = "";
      return;
    }
    setCvUploading(true);
    setCvError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ purpose: "cv" }),
      });
      await fetch(`/api/profiles/${encodeURIComponent(name)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvUrl: blob.url, cvFilename: file.name }),
      });
      setCvUrl(blob.url);
      setCvFilename(file.name);
    } catch (err) {
      setCvError(err?.message || "Kunne ikke uploade filen. Prøv igen.");
    }
    setCvUploading(false);
    e.target.value = "";
  }

  async function removeCv() {
    if (!confirm("Fjern det vedhæftede dokument fra din profil?")) return;
    await fetch(`/api/profiles/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvUrl: null, cvFilename: null }),
    });
    setCvUrl(null);
    setCvFilename(null);
  }

  if (!loaded) return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Henter profil…</div>;

  // Hvor meget af profilen er udfyldt, til fremdrifts-påmindelsen nedenfor.
  const fields = [bio, skills, portfolio, websiteUrl || linkedinUrl, cvUrl];
  const filledCount = fields.filter((f) => f && f.toString().trim()).length;
  const completeness = Math.round((filledCount / fields.length) * 100);

  return (
    <div style={{ marginTop: 24, maxWidth: 680, marginBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2A55E5, #6D8CF0)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 22,
            flex: "0 0 auto",
          }}
        >
          {initials(name)}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{name}</h2>
            {level?.stripePayoutsEnabled && (
              <span
                title="Identitet bekræftet via Stripe"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: "#1AA37A", background: "#E9F9F1", padding: "3px 9px", borderRadius: 999 }}
              >
                <ShieldCheck size={11} /> Verificeret
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#5B6478", margin: "3px 0 0" }}>Vises for andre, når de ser dine bud eller opgaver.</p>
        </div>
      </div>

      {!emailVerified && <EmailVerifyBanner />}

      {completeness < 100 && (
        <div style={{ background: "#EEF2FF", border: "1.5px solid #DCE4FB", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Din profil er {completeness}% udfyldt</div>
            <div style={{ fontSize: 12, color: "#5B6478" }}>En komplet profil får flere bud valgt</div>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "#fff", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completeness}%`, background: "#2A55E5", borderRadius: 999, transition: "width .3s ease" }} />
          </div>
        </div>
      )}

      {/* Stats */}
      {level && (
        <div style={{ display: "flex", background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: "18px 8px", marginBottom: 20 }}>
          <StatBlock label="Niveau" value={level.level.label} border />
          <StatBlock label="Udførelsesrate" value={`${level.completionRate}%`} border />
          <StatBlock
            label="Anmeldelser"
            value={
              level.reviewCount > 0 ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Stars value={level.avgRating} /> ({level.reviewCount})
                </span>
              ) : (
                "Ingen endnu"
              )
            }
          />
        </div>
      )}

      <SectionCard icon={User} title="Om dig">
        <label style={labelStyle}>Beskrivelse</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Kort om dig selv - baggrund, erfaring, hvad du er god til."
          style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
        />

        <label style={{ ...labelStyle, marginTop: 16 }}>Kompetencer</label>
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="f.eks. Bogføring, Excel, kundeservice, dansk/engelsk oversættelse"
          style={inputStyle}
        />
        <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>Adskil gerne med komma.</div>
      </SectionCard>

      <SectionCard icon={Briefcase} title="Erfaring">
        <label style={labelStyle}>Portfolio / CV (tekst)</label>
        <textarea
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          placeholder="Tidligere opgaver, uddannelse, konkrete resultater."
          style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
        />
      </SectionCard>

      <SectionCard icon={Globe} title="Links">
        <label style={labelStyle}>LinkedIn</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Linkedin size={15} color="#9AA2B1" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/dit-navn"
            style={{ ...inputStyle, paddingLeft: 38 }}
          />
        </div>

        <label style={labelStyle}>Egen hjemmeside</label>
        <div style={{ position: "relative" }}>
          <Globe size={15} color="#9AA2B1" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://dinhjemmeside.dk"
            style={{ ...inputStyle, paddingLeft: 38 }}
          />
        </div>
        <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>Vises som klikbare links på din offentlige profil - godt til at vise et portfolio.</div>
      </SectionCard>

      <button
        onClick={save}
        style={{ fontSize: 14.5, fontWeight: 700, padding: "12px 24px", borderRadius: 12, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", marginBottom: 18 }}
      >
        Gem profil
      </button>
      {saved && (
        <div style={{ marginTop: -8, marginBottom: 18, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A", display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle2 size={14} /> Profil gemt.
        </div>
      )}

      <SectionCard icon={FileText} title="Vedhæftet dokument (PDF)">
        <p style={{ fontSize: 12.5, color: "#5B6478", marginBottom: 14 }}>
          Upload et CV eller andet materiale, andre kan se og downloade fra din profil. Kun PDF accepteres, af hensyn til sikkerhed - maks. 10 MB.
        </p>

        {cvUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#F5F7FB", borderRadius: 12 }}>
            <FileText size={18} color="#2A55E5" />
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: "#2A55E5" }}>
              {cvFilename || "Dokument.pdf"}
            </a>
            <button
              onClick={removeCv}
              title="Fjern dokument"
              style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={13} />
            </button>
          </div>
        ) : (
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
              cursor: cvUploading ? "default" : "pointer",
              opacity: cvUploading ? 0.6 : 1,
            }}
          >
            <Upload size={14} />
            {cvUploading ? "Uploader…" : "Upload PDF"}
            <input type="file" accept="application/pdf" onChange={handleCvChange} disabled={cvUploading} style={{ display: "none" }} />
          </label>
        )}
        {cvError && <div style={{ marginTop: 10, fontSize: 12.5, color: "#C0392B" }}>{cvError}</div>}
      </SectionCard>
    </div>
  );
}

function StatBlock({ label, value, border }) {
  return (
    <div style={{ flex: 1, textAlign: "center", borderRight: border ? "1px solid #F0F1F5" : "none" }}>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#5B6478", marginTop: 2 }}>{label}</div>
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
    <div style={{ background: "#FFF1E0", border: "1.5px solid #F5D9AE", borderRadius: 14, padding: "14px 18px", marginBottom: 20, fontSize: 13.5, color: "#B5610E" }}>
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

export default function ProfilePageWrapper() {
  return (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  );
}
