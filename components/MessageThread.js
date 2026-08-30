"use client";

import { useEffect, useState } from "react";
import { Send, FileText } from "lucide-react";
import FileUploader from "@/components/FileUploader";

export default function MessageThread({ taskId, bidderName, currentName }) {
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
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
    if (!text.trim() && pendingFiles.length === 0) return;
    setError("");
    try {
      const attachment = pendingFiles[0]; // én vedhæftning ad gangen pr. besked, ligesom de fleste chatapps
      const res = await fetch(`/api/tasks/${taskId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidderName,
          senderName: currentName,
          text: text.trim(),
          attachmentUrl: attachment?.url,
          attachmentName: attachment?.filename,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setText("");
      setPendingFiles([]);
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
                  {m.body && <div>{m.body}</div>}
                  {m.attachmentUrl && (
                    <a
                      href={m.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: m.body ? 6 : 0,
                        fontSize: 12,
                        fontWeight: 600,
                        color: mine ? "#fff" : "#2A55E5",
                        textDecoration: "underline",
                      }}
                    >
                      <FileText size={13} /> {m.attachmentName || "Vedhæftet fil"}
                    </a>
                  )}
                </div>
                <div style={{ fontSize: 10.5, color: "#9AA2B1", marginTop: 3, textAlign: mine ? "right" : "left" }}>
                  {mine ? "Dig" : m.senderName}
                </div>
              </div>
            );
          })}
      </div>

      {pendingFiles.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <FileUploader files={pendingFiles} setFiles={setPendingFiles} compact />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Skriv en besked…"
          style={{ flex: 1, fontSize: 13, padding: "9px 12px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#fff" }}
        />
        {pendingFiles.length === 0 && (
          <div style={{ flex: "0 0 auto" }}>
            <FileUploader files={pendingFiles} setFiles={setPendingFiles} compact />
          </div>
        )}
        <button
          onClick={send}
          aria-label="Send besked"
          style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "0 0 auto" }}
        >
          <Send size={15} />
        </button>
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: "#C0392B" }}>{error}</div>}
    </div>
  );
}
