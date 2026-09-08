"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, FileText, Linkedin, Globe, Briefcase, GraduationCap, User } from "lucide-react";
import Stars from "@/components/Stars";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// Genkender formatet "2021-2022: Titel hos Firma - beskrivelse" og viser det
// som en overskuelig tidslinje. Linjer der ikke matcher det format, vises
// stadig pænt som almindelig tekst i stedet for at fejle.
function ExperienceTimeline({ text }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div>
      {lines.map((line, i) => {
        const match = line.match(/^(\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*(nu|i dag))\s*:\s*(.+)/i);
        const isLast = i === lines.length - 1;

        if (match) {
          const years = match[1];
          const rest = match[3];
          const dashIndex = rest.indexOf(" - ");
          const titlePart = dashIndex > -1 ? rest.slice(0, dashIndex) : rest;
          const description = dashIndex > -1 ? rest.slice(dashIndex + 3) : null;

          return (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: isLast ? 0 : 20 }}>
              <div style={{ flex: "0 0 auto", width: 84, paddingTop: 1 }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#2A55E5",
                    background: "#EEF2FF",
                    padding: "4px 9px",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  {years}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0, borderLeft: "2px solid #EEF2FF", paddingLeft: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#14213D", marginBottom: description ? 4 : 0 }}>{titlePart}</div>
                {description && <div style={{ fontSize: 13, color: "#5B6478", lineHeight: 1.55 }}>{description}</div>}
              </div>
            </div>
          );
        }

        return (
          <p key={i} style={{ fontSize: 14, color: "#14213D", lineHeight: 1.65, margin: isLast ? 0 : "0 0 12px" }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

const LEVEL_STYLES = {
  platin: { bg: "#EEF1F5", color: "#4B5768", ring: "#C7CDD6" },
  guld: { bg: "#FFF6E0", color: "#9A6B00", ring: "#F0D488" },
  solv: { bg: "#F2F4F7", color: "#5B6478", ring: "#D8DEE7" },
  standard: null, // vises ikke - ingen opnået status endnu
};

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 18, padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEF2FF", color: "#2A55E5", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <Icon size={14} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em", color: "#5B6478" }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

export default function ProfileClient() {
  const { name } = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(name);

  const [profile, setProfile] = useState(null);
  const [level, setLevel] = useState(null);
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    fetch(`/api/profiles/${encodeURIComponent(decoded)}`)
      .then((r) => r.json())
      .then((data) => setProfile(data.profile));
    fetch(`/api/helpers/${encodeURIComponent(decoded)}`)
      .then((r) => r.json())
      .then((data) => !data.error && setLevel(data));
    fetch(`/api/profiles/${encodeURIComponent(decoded)}/reviews`)
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []));
  }, [decoded]);

  const levelStyle = level ? LEVEL_STYLES[level.level.key] : null;
  const hasAboutContent = profile && (profile.bio || profile.skills || profile.job || profile.education);
  const hasLinksOrDocs = profile && (profile.websiteUrl || profile.linkedinUrl || profile.cvUrl || profile.portfolioUrl);

  return (
    <div style={{ marginTop: 24, maxWidth: 660, marginBottom: 60 }}>
      <div
        onClick={() => router.back()}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#5B6478", cursor: "pointer", marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Tilbage
      </div>

      {/* Header-kort med gradient, gør profilen hurtigere at genkende og skabe tillid til på et øjekast */}
      <div style={{ borderRadius: 22, overflow: "hidden", border: "1.5px solid #E4E8F0", marginBottom: 16 }}>
        <div style={{ height: 64, background: "linear-gradient(120deg, #2A55E5, #6D8CF0)" }} />
        <div style={{ background: "#fff", padding: "0 24px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: -32, marginBottom: 14 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2A55E5, #6D8CF0)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 24,
                border: "4px solid #fff",
                flex: "0 0 auto",
              }}
            >
              {initials(decoded)}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <div style={{ fontSize: 21, fontWeight: 800 }}>{decoded}</div>
            {profile && profile.stripePayoutsEnabled && (
              <span
                title="Identitet bekræftet via Stripe"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#1AA37A", background: "#E9F9F1", padding: "3px 10px", borderRadius: 999 }}
              >
                <ShieldCheck size={12} /> Verificeret
              </span>
            )}
            {levelStyle && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: levelStyle.color,
                  background: levelStyle.bg,
                  border: `1px solid ${levelStyle.ring}`,
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                {level.level.label}
              </span>
            )}
          </div>

          {level && level.reviewCount > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5B6478" }}>
              <Stars value={level.avgRating} /> <b style={{ color: "#14213D" }}>{level.avgRating.toFixed(1)}</b> ({level.reviewCount} anmeldelser)
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#9AA2B1" }}>Ingen anmeldelser endnu</div>
          )}
        </div>
      </div>

      {/* Statistik-r\u00e6kke - det f\u00f8rste, en virksomhed typisk kigger p\u00e5 for hurtigt at vurdere n\u00e5r p\u00e5lidelig nogen er */}
      {level && (
        <div style={{ display: "flex", background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: "16px 8px", marginBottom: 16 }}>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #F0F1F5" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{level.completionRate}%</div>
            <div style={{ fontSize: 11, color: "#5B6478", marginTop: 2 }}>Udførelsesrate</div>
          </div>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #F0F1F5" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{level.completedCount}</div>
            <div style={{ fontSize: 11, color: "#5B6478", marginTop: 2 }}>Fuldførte opgaver</div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{level.reviewCount}</div>
            <div style={{ fontSize: 11, color: "#5B6478", marginTop: 2 }}>Anmeldelser</div>
          </div>
        </div>
      )}

      {/* Kompetencer flyttet helt op - det hurtigste en virksomhed scanner efter */}
      {profile?.skills && (
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 10 }}>Kompetencer</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {profile.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s, i) => (
              <span key={i} style={{ fontSize: 12.5, fontWeight: 700, padding: "6px 13px", borderRadius: 999, background: "#EEF2FF", color: "#1B3AA6" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasLinksOrDocs && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          {profile.cvUrl && (
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, padding: "11px 18px", borderRadius: 12, background: "#14213D", color: "#fff" }}
            >
              <FileText size={15} /> Se CV
            </a>
          )}
          {profile.portfolioUrl && (
            <a
              href={profile.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, padding: "11px 18px", borderRadius: 12, border: "1.5px solid #E4E8F0", color: "#14213D" }}
            >
              <FileText size={15} /> Se portfolio
            </a>
          )}
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, padding: "11px 18px", borderRadius: 12, border: "1.5px solid #E4E8F0", color: "#14213D" }}
            >
              <Linkedin size={15} /> LinkedIn
            </a>
          )}
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl.startsWith("http") ? profile.websiteUrl : `https://${profile.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, padding: "11px 18px", borderRadius: 12, border: "1.5px solid #E4E8F0", color: "#14213D" }}
            >
              <Globe size={15} /> Hjemmeside
            </a>
          )}
        </div>
      )}

      {profile?.bio && (
        <SectionCard icon={User} title="Om">
          <p style={{ fontSize: 14, color: "#14213D", lineHeight: 1.65, margin: 0 }}>{profile.bio}</p>
        </SectionCard>
      )}

      {profile?.job && (
        <SectionCard icon={Briefcase} title="Job / erhvervserfaring">
          <ExperienceTimeline text={profile.job} />
        </SectionCard>
      )}

      {profile?.education && (
        <SectionCard icon={GraduationCap} title="Uddannelse">
          <ExperienceTimeline text={profile.education} />
        </SectionCard>
      )}

      {!hasAboutContent && !hasLinksOrDocs && (
        <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 16 }}>{decoded} har ikke udfyldt en profil endnu.</p>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12, marginTop: 8 }}>Anmeldelser</div>
      {reviews === null && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Henter…</p>}
      {reviews && reviews.length === 0 && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Ingen anmeldelser endnu.</p>}
      {reviews &&
        reviews.map((r) => (
          <div key={r.id} style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.reviewerName}</span>
              <Stars value={r.rating} />
            </div>
            <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 6 }}>om "{r.taskTitle}"</div>
            {r.comment && <div style={{ fontSize: 13, color: "#14213D", lineHeight: 1.55 }}>{r.comment}</div>}
          </div>
        ))}
    </div>
  );
}
