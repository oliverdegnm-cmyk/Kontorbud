"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useName } from "@/lib/NameContext";
import NotificationBell from "@/components/NotificationBell";
import UserMenu from "@/components/UserMenu";
import MobileMenu from "@/components/MobileMenu";

export default function TopBar() {
  const pathname = usePathname();
  const { name } = useName();

  const links = [
    { href: "/opgaver", label: "Opgaver" },
    { href: "/hvordan-det-virker", label: "Hvordan fungerer det?" },
    { href: "/kontakt", label: "Kontakt" },
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
      <div className="kb-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Link
          href="/opret"
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13.5,
            fontWeight: 700,
            background: "#2A55E5",
            color: "#fff",
            marginRight: 4,
          }}
        >
          Opret opgave
        </Link>
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
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {name && <NotificationBell name={name} />}
        {name && (
          <div className="kb-desktop-usermenu">
            <UserMenu />
          </div>
        )}
        {!name && (
          <Link
            href="/login"
            className="kb-desktop-usermenu"
            style={{ padding: "9px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, border: "1.5px solid #E4E8F0", color: "#14213D" }}
          >
            Log ind
          </Link>
        )}
        <MobileMenu />
      </div>
    </div>
  );
}
