"use client";

import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import { useName } from "@/lib/NameContext";
import { Copy, Check, Mail } from "lucide-react";

function InviterPage() {
  const { id } = useName();
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const origin = window.location.origin;
    setLink(`${origin}/?ref=${id.toString(36)}`);
  }, [id]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ingen adgang til udklipsholder - ignorer roligt
    }
  }

  const shareText = "Kom og prøv Kontorbud - Danmarks platform for kontoropgaver.";
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent("Prøv Kontorbud")}&body=${encodeURIComponent(`${shareText}\n\n${link}`)}`;

  return (
    <div style={{ marginTop: 24, maxWidth: 560, marginBottom: 60 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Inviter venner</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>Del dit personlige link, så andre nemt kan finde vej til Kontorbud.</p>

      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
          Dit invitationslink
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              flex: "1 1 260px",
              fontSize: 13.5,
              padding: "12px 14px",
              border: "1.5px dashed #E4E8F0",
              borderRadius: 10,
              background: "#F5F7FB",
              color: "#5B6478",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {link || "Henter…"}
          </div>
          <button
            onClick={copyLink}
            disabled={!link}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13.5,
              fontWeight: 700,
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: "#14213D",
              color: "#fff",
              cursor: link ? "pointer" : "default",
              flex: "0 0 auto",
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Kopieret" : "Kopiér"}
          </button>
        </div>

        <div style={{ borderTop: "1px solid #E4E8F0", margin: "20px 0 16px" }} />

        <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", marginBottom: 12 }}>Del via</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13.5,
              fontWeight: 700,
              padding: "11px 20px",
              borderRadius: 10,
              border: "none",
              background: "#1877F2",
              color: "#fff",
            }}
          >
            Facebook
          </a>
          <a
            href={mailUrl}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13.5,
              fontWeight: 700,
              padding: "11px 20px",
              borderRadius: 10,
              border: "1.5px solid #E4E8F0",
              color: "#14213D",
            }}
          >
            <Mail size={15} /> Email
          </a>
        </div>
      </div>
    </div>
  );
}

export default function InviterPageWrapper() {
  return (
    <RequireAuth>
      <InviterPage />
    </RequireAuth>
  );
}
