"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export default function InviteButton({ style, iconOnly = false }) {
  const [copied, setCopied] = useState(false);

  async function invite() {
    const url = typeof window !== "undefined" ? window.location.origin : "https://kontorbud.vercel.app";
    const text = "Kom og prøv Kontorbud — Danmarks platform for kontoropgaver.";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Kontorbud", text, url });
        return;
      } catch (e) {
        // brugeren annullerede - ingen grund til at vise en fejl
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ingen adgang til udklipsholder - ignorer roligt
    }
  }

  return (
    <button
      onClick={invite}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: iconOnly ? 0 : "10px 12px",
        borderRadius: 10,
        fontSize: 13.5,
        fontWeight: 600,
        color: "#14213D",
        background: "none",
        border: "none",
        cursor: "pointer",
        width: iconOnly ? "auto" : "100%",
        textAlign: "left",
        ...style,
      }}
    >
      <Share2 size={15} color="#5B6478" />
      {copied ? "✓ Link kopieret" : "Inviter venner"}
    </button>
  );
}
