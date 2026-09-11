"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("kb_cookie_ack") !== "1") setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("kb_cookie_ack", "1");
    setVisible(false);
  }

  if (!visible) return null;

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
        AIbud bruger kun én nødvendig cookie til at holde dig logget ind - ingen sporing eller reklamer. Læs mere i vores{" "}
        <Link href="/privatliv" style={{ color: "#fff", textDecoration: "underline" }}>
          privatlivspolitik
        </Link>
        .
      </p>
      <button
        onClick={accept}
        style={{ fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", cursor: "pointer", flex: "0 0 auto" }}
      >
        Forstået
      </button>
    </div>
  );
}
