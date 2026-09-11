"use client";

import { useState } from "react";
import Link from "next/link";
import { useName } from "@/lib/NameContext";
import { Briefcase, Wallet } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.5 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5c-2 1.5-4.6 2.4-7.6 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 36 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export default function AuthForm({ title, subtitle }) {
  const { login, signup, authError, setAuthError } = useName();
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [goal, setGoal] = useState("tasks"); // "tasks" | "earn"
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function submit() {
    if (mode === "signup" && !acceptedTerms) {
      setAuthError("Du skal acceptere vilkår og betingelser for at oprette en konto.");
      return;
    }
    setSubmitting(true);
    if (mode === "login") {
      await login(inputEmail, inputPassword);
    } else if (mode === "signup") {
      await signup(inputName, inputEmail, inputPassword, { goal, marketingConsent, acceptedTerms });
    } else if (mode === "forgot") {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail }),
      });
      setForgotSent(true);
    }
    setSubmitting(false);
  }

  function switchMode(next) {
    setMode(next);
    setAuthError("");
    setForgotSent(false);
  }

  return (
    <div style={{ background: "#EEF2FF", borderRadius: 20, padding: 32, maxWidth: 420 }}>
      {mode !== "forgot" && (
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
      )}

      <h2 style={{ fontSize: 19, marginBottom: 6, fontWeight: 800 }}>
        {title || (mode === "login" ? "Log ind på Kontorbud" : mode === "signup" ? "Opret en konto" : "Nulstil adgangskode")}
      </h2>
      <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 18, lineHeight: 1.6 }}>
        {subtitle ||
          (mode === "login"
            ? "Log ind med din email og adgangskode."
            : mode === "signup"
            ? "Dit navn vises på opgaver, du opretter, og bud, du afgiver."
            : "Angiv din email, så sender vi et link til at vælge en ny adgangskode.")}
      </p>

      {mode !== "forgot" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <a
              href="/api/auth/google"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 13.5,
                fontWeight: 700,
                padding: "11px 14px",
                borderRadius: 10,
                border: "1.5px solid #E4E8F0",
                background: "#fff",
                color: "#14213D",
              }}
            >
              <GoogleIcon /> Fortsæt med Google
            </a>
            <a
              href="/api/auth/facebook"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 13.5,
                fontWeight: 700,
                padding: "11px 14px",
                borderRadius: 10,
                border: "none",
                background: "#1877F2",
                color: "#fff",
              }}
            >
              <FacebookIcon /> Fortsæt med Facebook
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "#DCE4FB" }} />
            <span style={{ fontSize: 11.5, color: "#9AA2B1" }}>eller</span>
            <div style={{ flex: 1, height: 1, background: "#DCE4FB" }} />
          </div>
        </>
      )}

      {mode === "forgot" && forgotSent ? (
        <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#E9F9F1", color: "#1AA37A" }}>
          ✓ Hvis emailen findes hos os, er der sendt et nulstillingslink. Tjek din indbakke.
        </div>
      ) : (
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
            onKeyDown={(e) => e.key === "Enter" && mode === "forgot" && !submitting && submit()}
            style={{ fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10 }}
          />
          {mode !== "forgot" && (
            <input
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder={mode === "signup" ? "Adgangskode (mindst 6 tegn)" : "Adgangskode"}
              type="password"
              onKeyDown={(e) => e.key === "Enter" && !submitting && submit()}
              style={{ fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10 }}
            />
          )}

          {mode === "signup" && (
            <>
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 8 }}>Hvad er dit mål med Kontorbud?</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setGoal("tasks")}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "10px 0",
                      borderRadius: 10,
                      border: goal === "tasks" ? "1.5px solid #2A55E5" : "1.5px solid #E4E8F0",
                      background: goal === "tasks" ? "#fff" : "#F5F7FB",
                      color: goal === "tasks" ? "#1B3AA6" : "#5B6478",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Briefcase size={14} /> Få ting gjort
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoal("earn")}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "10px 0",
                      borderRadius: 10,
                      border: goal === "earn" ? "1.5px solid #2A55E5" : "1.5px solid #E4E8F0",
                      background: goal === "earn" ? "#fff" : "#F5F7FB",
                      color: goal === "earn" ? "#1B3AA6" : "#5B6478",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Wallet size={14} /> Tjene penge
                  </button>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <span style={{ fontSize: 12, color: "#5B6478", lineHeight: 1.5 }}>
                  Jeg accepterer{" "}
                  <Link href="/vilkaar" target="_blank" style={{ color: "#2A55E5", fontWeight: 700 }}>
                    vilkår og betingelser
                  </Link>{" "}
                  og{" "}
                  <Link href="/privatliv" target="_blank" style={{ color: "#2A55E5", fontWeight: 700 }}>
                    privatlivspolitikken
                  </Link>
                  .
                </span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <span style={{ fontSize: 12, color: "#5B6478", lineHeight: 1.5 }}>
                  Få relevante tips og kampagner. Du kan altid afmelde dig igen.
                </span>
              </label>
            </>
          )}

          {mode === "login" && (
            <button
              onClick={() => switchMode("forgot")}
              style={{ alignSelf: "flex-end", fontSize: 12.5, fontWeight: 600, color: "#2A55E5", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Glemt adgangskode?
            </button>
          )}
          <button
            onClick={submit}
            disabled={submitting || (mode === "signup" && !acceptedTerms)}
            style={{
              fontSize: 14,
              fontWeight: 700,
              padding: "11px 20px",
              borderRadius: 10,
              border: "none",
              background: "#2A55E5",
              color: "#fff",
              cursor: submitting || (mode === "signup" && !acceptedTerms) ? "default" : "pointer",
              opacity: submitting || (mode === "signup" && !acceptedTerms) ? 0.5 : 1,
            }}
          >
            {submitting ? "Et øjeblik…" : mode === "login" ? "Log ind" : mode === "signup" ? "Opret konto" : "Send nulstillingslink"}
          </button>
          {mode === "forgot" && (
            <button
              onClick={() => switchMode("login")}
              style={{ fontSize: 12.5, fontWeight: 600, color: "#5B6478", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
            >
              ← Tilbage til login
            </button>
          )}
        </div>
      )}

      {authError && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, background: "#FDECEC", color: "#C0392B" }}>
          {authError}
        </div>
      )}
    </div>
  );
}
