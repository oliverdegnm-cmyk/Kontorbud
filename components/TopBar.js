"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useName } from "@/lib/NameContext";
import { LogOut } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function TopBar() {
  const pathname = usePathname();
  const { name, logOut } = useName();

  function handleLogOut() {
    if (confirm("Log ud af Kontorbud?")) {
      logOut().then(() => {
        window.location.href = "/";
      });
    }
  }

  const links = [
    { href: "/", label: "Opgaver" },
    { href: "/opret", label: "Opret opgave" },
    { href: "/mine", label: "Mine sager" },
    { href: "/beskeder", label: "Beskeder" },
    { href: "/profil", label: "Profil" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 4px",
        flexWrap: "wrap",
        gap: 12,
        maxWidth: 1080,
        margin: "0 auto",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "#2A55E5",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          KB
        </div>
        <div style={{ fontSize: 19, fontWeight: 800 }}>Kontorbud</div>
      </Link>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 600,
              background: pathname === l.href ? "#EEF2FF" : "transparent",
              color: pathname === l.href ? "#1B3AA6" : "#5B6478",
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
      {name && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <NotificationBell name={name} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#5B6478" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#EEF2FF",
                color: "#1B3AA6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {initials(name)}
            </div>
            {name}
          </div>
          <button
            onClick={handleLogOut}
            title="Log ud"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", cursor: "pointer" }}
          >
            <LogOut size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
