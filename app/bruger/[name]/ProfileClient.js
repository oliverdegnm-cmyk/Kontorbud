"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Stars from "@/components/Stars";
import { formatKr } from "@/lib/fees";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
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

  return (
    <div style={{ marginTop: 24, maxWidth: 660 }}>
      <div
        onClick={() => router.back()}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#5B6478", cursor: "pointer", marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Tilbage
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#EEF2FF",
            color: "#1B3AA6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          {initials(decoded)}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{decoded}</div>
            {profile && profile.stripePayoutsEnabled && (
              <span
                title="Identitet bekræftet via Stripe"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#1AA37A", background: "#E9F9F1", padding: "3px 10px", borderRadius: 999 }}
              >
                <ShieldCheck size={12} /> Verificeret
              </span>
            )}
          </div>
          {level && level.reviewCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5B6478", marginTop: 3 }}>
              <Stars value={level.avgRating} /> {level.avgRating.toFixed(1)} ({level.reviewCount} anmeldelser)
            </div>
          )}
        </div>
      </div>

      {level && (
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 22, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Niveau</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.level.label}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Udførelsesrate</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.completionRate}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Fuldførte opgaver</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.completedCount}</div>
          </div>
        </div>
      )}

      {profile && (profile.bio || profile.skills || profile.portfolio || profile.websiteUrl || profile.cvUrl) ? (
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 26, marginBottom: 22 }}>
          {profile.bio && (
            <>
              <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Om</div>
              <p style={{ fontSize: 14, color: "#14213D", lineHeight: 1.65, marginBottom: 18 }}>{profile.bio}</p>
            </>
          )}
          {profile.skills && (
            <>
              <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Kompetencer</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {profile.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s, i) => (
                  <span key={i} style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: 999, background: "#EEF2FF", color: "#1B3AA6" }}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
          {profile.portfolio && (
            <>
              <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Portfolio / CV</div>
              <p style={{ fontSize: 14, color: "#14213D", lineHeight: 1.65, whiteSpace: "pre-wrap", marginBottom: (profile.websiteUrl || profile.cvUrl) ? 18 : 0 }}>{profile.portfolio}</p>
            </>
          )}
          {(profile.websiteUrl || profile.cvUrl) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl.startsWith("http") ? profile.websiteUrl : `https://${profile.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #E4E8F0", color: "#2A55E5" }}
                >
                  🌐 Besøg hjemmeside
                </a>
              )}
              {profile.cvUrl && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #E4E8F0", color: "#2A55E5" }}
                >
                  📄 {profile.cvFilename || "Se dokument"}
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        profile && <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 22 }}>{decoded} har ikke udfyldt en profil endnu.</p>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Anmeldelser</div>
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
