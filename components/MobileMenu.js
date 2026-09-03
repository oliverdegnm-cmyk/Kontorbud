"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useName } from "@/lib/NameContext";

export default function MobileMenu() {
  const { name, logOut, isAdmin } = useName();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/opret", label: "Opret opgave", cta: true },
    { href: "/opgaver", label: "Opgaver" },
    { href: "/hvordan-det-virker", label: "Hvordan fungerer det?" },
    { href: "/kontakt", label: "Kontakt" },
    ...(name
      ? [
          { href: "/mine", label: "Mine sager" },
          { href: "/beskeder", label: "Beskeder" },
          { href: "/profil", label: "Profil" },
          { href: "/indstillinger", label: "Indstillinger" },
          { href: "/betalinger", label: "Betalinger" },
        ]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  function handleLogOut() {
    if (confirm("Log ud af Kontorbud?")) {
      logOut().then(() => {
        window.location.href = "/";
      });
    }
  }

  return (
    <>
      <button
        className="kb-mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Åbn menu"
        style={{ alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10, border: "1.5px solid #E4E8F0", background: "#fff", color: "#14213D", cursor: "pointer" }}
      >
        <Menu size={19} />
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 100, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #E4E8F0" }}>
            <button onClick={() => setOpen(false)} aria-label="Luk menu" style={{ background: "none", border: "none", cursor: "pointer", color: "#14213D" }}>
              <X size={22} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "#2A55E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
                KB
              </div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Kontorbud</div>
            </div>
            <div style={{ width: 22 }} />
          </div>

          <div style={{ padding: "8px 24px" }}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "18px 0",
                  fontSize: 17,
                  fontWeight: l.cta ? 800 : 600,
                  color: l.cta ? "#2A55E5" : "#14213D",
                  borderBottom: "1px solid #F0F1F5",
                }}
              >
                {l.label}
              </Link>
            ))}
            {name ? (
              <button
                onClick={handleLogOut}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "18px 0", fontSize: 17, fontWeight: 600, color: "#C0392B", background: "none", border: "none", borderBottom: "1px solid #F0F1F5", cursor: "pointer" }}
              >
                Log ud
              </button>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
