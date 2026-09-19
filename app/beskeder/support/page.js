"use client";

import RequireAuth from "@/components/RequireAuth";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useName } from "@/lib/NameContext";
import MessageThread from "@/components/MessageThread";

function SupportThreadPage() {
  const { name } = useName();
  if (!name) return null;

  return (
    <div style={{ marginTop: 24, maxWidth: 560, marginBottom: 60 }}>
      <Link href="/beskeder" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#5B6478", marginBottom: 18 }}>
        <ArrowLeft size={14} /> Tilbage til beskeder
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#EEF2FF",
            color: "#1B3AA6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Kontorbud support</h2>
      </div>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 20 }}>
        Beskeder fra Kontorbuds supportteam om din konto eller dine opgaver - og dine egne svar til dem.
      </p>

      <MessageThread endpoint="/api/messages/support" bidderName={name} currentName={name} placeholder="Skriv til support…" maxHeight={440} />
    </div>
  );
}

export default function SupportThreadPageWrapper() {
  return (
    <RequireAuth>
      <SupportThreadPage />
    </RequireAuth>
  );
}
