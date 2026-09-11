"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, Briefcase, MessageCircle, ShieldCheck, Settings, CreditCard } from "lucide-react";
import { Share2 } from "lucide-react";
import { useName } from "@/lib/NameContext";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function UserMenu() {
  const { name, logOut, isAdmin } = useName();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogOut() {
    if (confirm("Log ud af Kontorbud?")) {
      logOut().then(() => {
        window.location.href = "/";
      });
    }
  }

  if (!name) return null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13.5,
          fontWeight: 600,
          color: "#5B6478",
          background: open ? "#F5F7FB" : "transparent",
          border: "1.5px solid #E4E8F0",
          borderRadius: 999,
          padding: "4px 12px 4px 4px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#EEF2FF",
            color: "#1B3AA6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11.5,
            fontWeight: 800,
            flex: "0 0 auto",
          }}
        >
          {initials(name)}
        </div>
        {name}
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .12s ease" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            width: 200,
            background: "#fff",
            border: "1.5px solid #E4E8F0",
            borderRadius: 14,
            boxShadow: "0 12px 28px -12px rgba(20,33,61,0.25)",
            zIndex: 50,
            padding: 6,
          }}
        >
          <Link
            href="/mine"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#14213D" }}
          >
            <Briefcase size={15} color="#5B6478" /> Mine sager
          </Link>
          <Link
            href="/beskeder"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#14213D" }}
          >
            <MessageCircle size={15} color="#5B6478" /> Beskeder
          </Link>
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#14213D" }}
          >
            <User size={15} color="#5B6478" /> Profil
          </Link>
          <Link
            href="/indstillinger"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#14213D" }}
          >
            <Settings size={15} color="#5B6478" /> Indstillinger
          </Link>
          <Link
            href="/betalinger"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#14213D" }}
          >
            <CreditCard size={15} color="#5B6478" /> Betalinger
          </Link>
          <Link
            href="/inviter"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#14213D" }}
          >
            <Share2 size={15} color="#5B6478" /> Inviter venner
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#14213D" }}
            >
              <ShieldCheck size={15} color="#5B6478" /> Admin
            </Link>
          )}
          <div style={{ borderTop: "1px solid #E4E8F0", margin: "6px 0" }} />
          <button
            onClick={handleLogOut}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: "#C0392B", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <LogOut size={15} /> Log ud
          </button>
        </div>
      )}
    </div>
  );
}
