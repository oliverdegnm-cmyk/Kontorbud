"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useName } from "@/lib/NameContext";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "lige nu";
  if (diff < 3600) return `${Math.floor(diff / 60)} min siden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} t siden`;
  return `${Math.floor(diff / 86400)} dage siden`;
}

export default function MessagesInboxPage() {
  const { name } = useName();
  const [threads, setThreads] = useState(null);

  useEffect(() => {
    if (!name) return;
    fetch(`/api/messages?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => setThreads(data.threads || []));
  }, [name]);

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 4 }}>Beskeder</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>Alle dine samtaler om opgaver, samlet ét sted.</p>

      {threads === null && <div style={{ color: "#5B6478", fontSize: 13.5 }}>Henter beskeder…</div>}
      {threads && threads.length === 0 && (
        <div style={{ padding: "50px 10px", textAlign: "center", color: "#5B6478" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#14213D", marginBottom: 6 }}>Ingen beskeder endnu</div>
          <div style={{ fontSize: 13.5 }}>
            Send en besked fra en opgaves detaljeside for at starte en samtale.
          </div>
        </div>
      )}
      {threads &&
        threads.map((t) => (
          <Link
            key={`${t.taskId}-${t.bidderName}`}
            href={`/opgave/${t.taskId}`}
            style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: "14px 18px", marginBottom: 10 }}
          >
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
                fontWeight: 800,
                fontSize: 13,
                flex: "0 0 auto",
              }}
            >
              {initials(t.counterpart)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{t.counterpart}</span>
                <span style={{ fontSize: 11.5, color: "#9AA2B1", whiteSpace: "nowrap" }}>{timeAgo(t.lastAt)}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#5B6478", marginTop: 2 }}>om "{t.taskTitle}"</div>
              <div
                style={{
                  fontSize: 13,
                  color: "#14213D",
                  marginTop: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {t.lastSender === name ? "Dig: " : ""}
                {t.lastBody}
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}
