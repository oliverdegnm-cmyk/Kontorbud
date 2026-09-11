"use client";

import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import { useName } from "@/lib/NameContext";
import { Copy, Check, Share2 } from "lucide-react";

function InviterPage() {
  const { id, name } = useName();
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (!id) return;
    const origin = window.location.origin;
    setLink(`${origin}/?ref=${id.toString(36)}`);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [id]);

  const shareText = `Hej! ${name ? name + " her - " : ""}jeg synes du skal tjekke AIbud.dk ud. Det er en dansk platform, hvor man nemt kan få hjælp til AI-opgaver, eller selv byde og tjene penge.`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ingen adgang til udklipsholder - ignorer roligt
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "AIbud", text: shareText, url: link });
    } catch (e) {
      // brugeren annullerede - ingen grund til at vise en fejl
    }
  }

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(shareText)}`;

  return (
    <div style={{ marginTop: 24, maxWidth: 560, marginBottom: 60 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Inviter venner</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>Del dit personlige link, så andre nemt kan finde vej til AIbud.</p>

      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
          Din besked, klar til at dele
        </div>
        <div style={{ background: "#F5F7FB", border: "1.5px dashed #E4E8F0", borderRadius: 10, padding: "14px 16px", fontSize: 13.5, color: "#14213D", lineHeight: 1.6, marginBottom: 20 }}>
          {shareText}
          <br />
          <span style={{ color: "#7C3AED", fontWeight: 700 }}>{link || "Henter…"}</span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {canNativeShare && (
            <button
              onClick={nativeShare}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13.5,
                fontWeight: 700,
                padding: "12px 20px",
                borderRadius: 10,
                border: "none",
                background: "#7C3AED",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <Share2 size={15} /> Del
            </button>
          )}
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
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: "#1877F2",
              color: "#fff",
            }}
          >
            Facebook
          </a>
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
              border: "1.5px solid #E4E8F0",
              background: "#fff",
              color: "#14213D",
              cursor: link ? "pointer" : "default",
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Kopieret" : "Kopiér besked"}
          </button>
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
