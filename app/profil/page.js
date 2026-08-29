"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useName } from "@/lib/NameContext";
import Stars from "@/components/Stars";

export default function ProfilePage() {
  const { name } = useName();
  const searchParams = useSearchParams();
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [level, setLevel] = useState(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripePayoutsEnabled, setStripePayoutsEnabled] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  function loadProfile() {
    fetch(`/api/profiles/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setBio(data.profile.bio || "");
          setSkills(data.profile.skills || "");
          setPortfolio(data.profile.portfolio || "");
          setStripeConnected(data.profile.stripeConnected);
          setStripePayoutsEnabled(data.profile.stripePayoutsEnabled);
        }
        setLoaded(true);
      });
  }

  useEffect(() => {
    if (!name) return;
    loadProfile();
    fetch(`/api/helpers/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => !data.error && setLevel(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (!name) return;
    const stripeParam = searchParams.get("stripe");
    if (stripeParam === "return" || stripeParam === "refresh") {
      fetch(`/api/stripe/status/${encodeURIComponent(name)}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) {
            setStripeConnected(data.connected);
            setStripePayoutsEnabled(data.payoutsEnabled);
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, searchParams]);

  async function connectStripe() {
    setConnecting(true);
    setStripeError("");
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.error) {
        setStripeError(data.error);
        setConnecting(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setStripeError("Kunne ikke starte Stripe-forbindelsen.");
      setConnecting(false);
    }
  }

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

      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Betaling</div>
        {stripePayoutsEnabled ? (
          <div style={{ fontSize: 13.5, color: "#1AA37A", fontWeight: 600 }}>
            ✓ Din Stripe-konto er forbundet og klar til at modtage udbetalinger.
          </div>
        ) : stripeConnected ? (
          <div>
            <div style={{ fontSize: 13.5, color: "#B5610E", fontWeight: 600, marginBottom: 10 }}>
              Din Stripe-konto er oprettet, men onboardingen er ikke færdig endnu.
            </div>
            <button
              onClick={connectStripe}
              disabled={connecting}
              style={{ fontSize: 13.5, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", opacity: connecting ? 0.6 : 1 }}
            >
              {connecting ? "Åbner Stripe…" : "Fortsæt opsætning"}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 12, lineHeight: 1.6 }}>
              Forbind en Stripe-konto for at kunne modtage betaling, når du vinder bud. Opgavestillere kan ikke vælge dine bud, før du har forbundet Stripe.
            </p>
            <button
              onClick={connectStripe}
              disabled={connecting}
              style={{ fontSize: 13.5, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", opacity: connecting ? 0.6 : 1 }}
            >
              {connecting ? "Åbner Stripe…" : "Forbind Stripe"}
            </button>
          </div>
        )}
        {stripeError && <div style={{ marginTop: 10, fontSize: 12.5, color: "#C0392B" }}>{stripeError}</div>}
      </div>

      {level && (
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 22, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Niveau</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.level.label}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Servicegebyr</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.level.feePercent}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Udførelsesrate</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.completionRate}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Anmeldelser</div>
            <div style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              {level.reviewCount > 0 ? (
                <>
                  <Stars value={level.avgRating} /> ({level.reviewCount})
                </>
              ) : (
                "Ingen endnu"
              )}
            </div>
          </div>
        </div>
      )}

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
