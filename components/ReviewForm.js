"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewForm({ taskId, currentName, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    if (rating === 0) {
      setError("Vælg et antal stjerner.");
      return;
    }
    setError("");
    const res = await fetch(`/api/tasks/${taskId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerName: currentName, rating, comment: comment.trim() }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return;
    }
    setDone(true);
    onSubmitted && onSubmitted();
  }

  if (done) {
    return <div style={{ fontSize: 13, color: "#1AA37A", fontWeight: 700 }}>✓ Tak for din anmeldelse.</div>;
  }

  return (
    <div style={{ background: "#F5F7FB", borderRadius: 12, padding: 14, marginTop: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 8 }}>Giv en anmeldelse</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${i} stjerner`}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
          >
            <Star size={22} fill={i <= (hover || rating) ? "#FFB400" : "none"} stroke="#FFB400" />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Skriv gerne et par ord om samarbejdet (valgfrit)."
        style={{ width: "100%", minHeight: 60, fontSize: 13, padding: "9px 12px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#fff", resize: "vertical" }}
      />
      <button
        onClick={submit}
        style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, padding: "9px 16px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer" }}
      >
        Send anmeldelse
      </button>
      {error && <div style={{ marginTop: 8, fontSize: 12, color: "#C0392B" }}>{error}</div>}
    </div>
  );
}
