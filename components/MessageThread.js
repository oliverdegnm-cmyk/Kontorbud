"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";

export default function MessageThread({ taskId, bidderName, currentName }) {
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetch(`/api/tasks/${taskId}/messages?bidderName=${encodeURIComponent(bidderName)}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => setError("Kunne ikke hente beskeder."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, bidderName]);

  async function send() {
    if (!text.trim()) return;
    setError("");
    try {
      const res = await fetch(`/api/tasks/${taskId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidderName, senderName: currentName, text: text.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setText("");
      load();
    } catch (e) {
      setError("Kunne ikke sende besked.");
    }
  }

  return (
    <div style={{ background: "#F5F7FB", borderRadius: 12, padding: 14, marginTop: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", marginBottom: 10 }}>
        {messages === null && <div style={{ fontSize: 12.5, color: "#5B6478" }}>Henter beskeder…</div>}
        {messages && messages.length === 0 && <div style={{ fontSize: 12.5, color: "#5B6478" }}>Ingen beskeder endnu. Sig hej.</div>}
        {messages &&
          messages.map((m) => {
            const mine = m.senderName === currentName;
            return (
              <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div
                  style={{
                    background: mine ? "#2A55E5" : "#fff",
                    color: mine ? "#fff" : "#14213D",
                    border: mine ? "none" : "1px solid #E4E8F0",
                    borderRadius: 12,
                    padding: "8px 12px",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {m.body}
                </div>
                <div style={{ fontSize: 10.5, color: "#9AA2B1", marginTop: 3, textAlign: mine ? "right" : "left" }}>
                  {mine ? "Dig" : m.senderName}
                </div>
              </div>
            );
          })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Skriv en besked…"
          style={{ flex: 1, fontSize: 13, padding: "9px 12px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#fff" }}
        />
        <button
          onClick={send}
          aria-label="Send besked"
          style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <Send size={15} />
        </button>
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: "#C0392B" }}>{error}</div>}
    </div>
  );
}
