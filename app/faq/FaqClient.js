"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQ_SECTIONS } from "@/lib/faqData";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #E4E8F0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "18px 4px",
          background: "none",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14213D" }}>{q}</span>
        <ChevronDown
          size={18}
          color="#5B6478"
          style={{ flex: "0 0 auto", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
        />
      </button>
      {open && (
        <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.65, margin: "0 0 18px", paddingRight: 30 }}>{a}</p>
      )}
    </div>
  );
}

export default function FaqClient() {
  return (
    <div style={{ marginTop: 24, marginBottom: 60, maxWidth: 700 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <HelpCircle size={22} color="#2A55E5" />
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Ofte stillede spørgsmål</h1>
      </div>
      <p style={{ fontSize: 14, color: "#5B6478", marginBottom: 32 }}>
        Finder du ikke svar på dit spørgsmål her?{" "}
        <Link href="/kontakt" style={{ color: "#2A55E5", fontWeight: 700 }}>
          Kontakt kundeservice
        </Link>
        .
      </p>

      {FAQ_SECTIONS.map((section) => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{section.title}</h2>
          <div>
            {section.items.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
