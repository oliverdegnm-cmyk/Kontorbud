"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (password.length < 6) {
      setError("Adgangskoden skal være mindst 6 tegn.");
      return;
    }
    if (password !== confirm) {
      setError("De to adgangskoder er ikke ens.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.error) {
      setError(data.error);
      return;
    }
    setDone(true);
    setTimeout(() => (window.location.href = "/"), 1200);
  }

  if (!token) {
    return (
      <div style={{ marginTop: 60, textAlign: "center", color: "#5B6478", fontSize: 14 }}>
        Linket mangler et token. Bed om et nyt nulstillingslink fra login-siden.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 60, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
      {done ? (
        <div style={{ textAlign: "center" }}>
          <CheckCircle2 size={40} color="#1AA37A" style={{ marginBottom: 14 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Adgangskode nulstillet</h2>
          <p style={{ color: "#5B6478", fontSize: 14 }}>Du sendes videre om et øjeblik…</p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Vælg en ny adgangskode</h2>
          <p style={{ color: "#5B6478", fontSize: 13.5, marginBottom: 22, textAlign: "center" }}>Mindst 6 tegn.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ny adgangskode"
            style={{ width: "100%", fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, marginBottom: 10 }}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Gentag adgangskode"
            onKeyDown={(e) => e.key === "Enter" && !submitting && submit()}
            style={{ width: "100%", fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, marginBottom: 14 }}
          />
          <button
            onClick={submit}
            disabled={submitting}
            style={{ width: "100%", fontSize: 14, fontWeight: 700, padding: "11px 20px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Et øjeblik…" : "Skift adgangskode"}
          </button>
          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, background: "#FDECEC", color: "#C0392B" }}>
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}
