"use client";

import { useState } from "react";
import { useName } from "@/lib/NameContext";

export default function NameGate({ children }) {
  const { name, ready, login, signup, authError, setAuthError } = useName();
  const [mode, setMode] = useState("login");
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!ready) return null;

  if (!name) {
    async function submit() {
      setSubmitting(true);
      if (mode === "login") {
        await login(inputEmail, inputPassword);
      } else {
        await signup(inputName, inputEmail, inputPassword);
      }
      setSubmitting(false);
    }

    function switchMode(next) {
      setMode(next);
      setAuthError("");
    }

    return (
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ background: "#EEF2FF", borderRadius: 20, padding: 32, marginTop: 8, maxWidth: 420 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#fff", borderRadius: 10, padding: 4 }}>
            <button
              onClick={() => switchMode("login")}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                background: mode === "login" ? "#2A55E5" : "transparent",
                color: mode === "login" ? "#fff" : "#5B6478",
              }}
            >
              Log ind
            </button>
            <button
              onClick={() => switchMode("signup")}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                background: mode === "signup" ? "#2A55E5" : "transparent",
                color: mode === "signup" ? "#fff" : "#5B6478",
              }}
            >
              Opret konto
            </button>
          </div>

          <h2 style={{ fontSize: 19, marginBottom: 6, fontWeight: 800 }}>
            {mode === "login" ? "Log ind på Kontorbud" : "Opret en konto"}
          </h2>
          <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 18, lineHeight: 1.6 }}>
            {mode === "login"
              ? "Log ind med din email og adgangskode."
              : "Dit navn vises på opgaver, du opretter, og bud, du afgiver."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mode === "signup" && (
              <input
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Dit navn, f.eks. Mette"
                style={{ fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10 }}
              />
            )}
            <input
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Email"
              type="email"
              style={{ fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10 }}
            />
            <input
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder={mode === "signup" ? "Adgangskode (mindst 6 tegn)" : "Adgangskode"}
              type="password"
              onKeyDown={(e) => e.key === "Enter" && !submitting && submit()}
              style={{ fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10 }}
            />
            <button
              onClick={submit}
              disabled={submitting}
              style={{
                fontSize: 14,
                fontWeight: 700,
                padding: "11px 20px",
                borderRadius: 10,
                border: "none",
                background: "#2A55E5",
                color: "#fff",
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Et øjeblik…" : mode === "login" ? "Log ind" : "Opret konto"}
            </button>
          </div>

          {authError && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, background: "#FDECEC", color: "#C0392B" }}>
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return children;
}
