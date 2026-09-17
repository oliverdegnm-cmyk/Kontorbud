"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Sat til true, den dag der er lagt et Google Analytics-måler-ID ind i
// miljøvariablen NEXT_PUBLIC_GA_ID (se components/GoogleAnalytics.js). Indtil
// da opfører banneret sig som før: kun én nødvendig cookie, ingen valgmulighed
// nødvendig. Så snart GA er sat op, skifter banneret automatisk til et rigtigt
// accepter/afvis-valg for analytics-cookien, som cookiebekendtgørelsen kræver.
const GA_ENABLED = !!process.env.NEXT_PUBLIC_GA_ID;

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = GA_ENABLED ? "kb_cookie_consent" : "kb_cookie_ack";
    if (!localStorage.getItem(key)) setVisible(true);
  }, []);

  function acceptOnly() {
    localStorage.setItem("kb_cookie_ack", "1");
    setVisible(false);
  }

  function setConsent(value) {
    localStorage.setItem("kb_cookie_consent", value);
    // Lader GoogleAnalytics-komponenten vide med det samme, at valget er
    // truffet, uden at siden skal genindlæses.
    window.dispatchEvent(new Event("cookie-consent-changed"));
    setVisible(false);
  }

  if (!visible) return null;

  const primaryBtn = { fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", flex: "0 0 auto" };
  const secondaryBtn = { fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", cursor: "pointer", flex: "0 0 auto" };

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 100,
        maxWidth: 560,
        margin: "0 auto",
        background: "#14213D",
        color: "#fff",
        borderRadius: 16,
        padding: "16px 20px",
        boxShadow: "0 12px 32px rgba(0,0,0,.25)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <p style={{ fontSize: 12.5, lineHeight: 1.55, margin: 0, flex: "1 1 260px", color: "#D6DCEC" }}>
        {GA_ENABLED
          ? "Kontorbud bruger én nødvendig cookie til at holde dig logget ind. Med dit samtykke bruger vi desuden Google Analytics til at måle besøg på siden."
          : "Kontorbud bruger kun én nødvendig cookie til at holde dig logget ind - ingen sporing eller reklamer."}{" "}
        Læs mere i vores{" "}
        <Link href="/privatliv" style={{ color: "#fff", textDecoration: "underline" }}>
          privatlivspolitik
        </Link>
        .
      </p>
      {GA_ENABLED ? (
        <div style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
          <button onClick={() => setConsent("declined")} style={secondaryBtn}>
            Kun nødvendige
          </button>
          <button onClick={() => setConsent("accepted")} style={primaryBtn}>
            Accepter
          </button>
        </div>
      ) : (
        <button onClick={acceptOnly} style={primaryBtn}>
          Forstået
        </button>
      )}
    </div>
  );
}
