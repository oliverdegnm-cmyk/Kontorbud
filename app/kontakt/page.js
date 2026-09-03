"use client";

import { useState } from "react";
import { useName } from "@/lib/NameContext";
import { Mail, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const { name, email: accountEmail } = useName();
  const [contactName, setContactName] = useState(name || "");
  const [contactEmail, setContactEmail] = useState(accountEmail || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!contactName.trim() || !contactEmail.trim() || !message.trim()) {
      setError("Udfyld navn, email og en besked.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: contactName, email: contactEmail, message }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.error) {
      setError(data.error);
      return;
    }
    setDone(true);
  }

  return (
    <div style={{ marginTop: 24, maxWidth: 560, marginBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Mail size={20} color="#2A55E5" />
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Kontakt kundeservice</h2>
      </div>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 6 }}>
        Har du et spørgsmål, et problem med en opgave, eller brug for hjælp til noget andet? Skriv til os herunder.
      </p>
      <p style={{ color: "#5B6478", fontSize: 13, marginBottom: 24 }}>🇩🇰 Dansk kundeservice — vi svarer på dansk, hurtigst muligt.</p>

      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 30 }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={36} color="#1AA37A" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Tak for din besked</div>
            <p style={{ fontSize: 13.5, color: "#5B6478" }}>Vi vender tilbage til dig hurtigst muligt.</p>
          </div>
        ) : (
          <>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Navn</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginBottom: 16 }}
            />
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginBottom: 16 }}
            />
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Besked</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Beskriv hvad vi kan hjælpe med."
              style={{ width: "100%", minHeight: 130, fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", resize: "vertical" }}
            />
            <button
              onClick={submit}
              disabled={submitting}
              style={{ marginTop: 18, fontSize: 14.5, fontWeight: 700, padding: "12px 24px", borderRadius: 12, border: "none", background: "#2A55E5", color: "#fff", cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Sender…" : "Send besked"}
            </button>
            {error && (
              <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
