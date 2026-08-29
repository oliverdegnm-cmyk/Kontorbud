"use client";

import { useState } from "react";
import { useName } from "@/lib/NameContext";

export default function NameGate({ children }) {
  const { name, setName, ready } = useName();
  const [input, setInput] = useState("");

  if (!ready) return null;

  if (!name) {
    return (
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ background: "#EEF2FF", borderRadius: 20, padding: 32, marginTop: 8, maxWidth: 420 }}>
          <h2 style={{ fontSize: 19, marginBottom: 6, fontWeight: 800 }}>Hvad skal du hedde på Kontorbud?</h2>
          <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 18, lineHeight: 1.6 }}>
            Dit navn vises på opgaver, du opretter, og bud, du afgiver.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="f.eks. Mette"
              onKeyDown={(e) => e.key === "Enter" && input.trim() && setName(input.trim())}
              style={{ flex: 1, fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10 }}
            />
            <button
              onClick={() => input.trim() && setName(input.trim())}
              style={{ fontSize: 14, fontWeight: 700, padding: "11px 20px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer" }}
            >
              Fortsæt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
