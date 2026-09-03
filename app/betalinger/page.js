"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, ShieldCheck, Lock, Trash2, Plus } from "lucide-react";

const BRAND_LABELS = { visa: "Visa", mastercard: "Mastercard", amex: "American Express" };

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState("");

  function loadCards() {
    fetch("/api/stripe/payment-methods")
      .then((r) => r.json())
      .then((data) => (data.error ? setError(data.error) : setCards(data.cards)));
  }

  useEffect(() => {
    loadCards();
    const saved = searchParams.get("saved");
    if (saved === "success") setBanner("✓ Kortet er gemt og klar til brug.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addCard() {
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/save-card", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setAdding(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setError("Kunne ikke starte opsætning af kort.");
      setAdding(false);
    }
  }

  async function removeCard(id) {
    if (!confirm("Fjern dette kort?")) return;
    await fetch(`/api/stripe/payment-methods/${id}`, { method: "DELETE" });
    loadCards();
  }

  return (
    <div style={{ marginTop: 24, maxWidth: 560, marginBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <CreditCard size={20} color="#2A55E5" />
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Betalinger</h2>
      </div>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>Administrer dine gemte betalingskort, så du ikke skal indtaste dem hver gang.</p>

      {banner && (
        <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A" }}>
          {banner}
        </div>
      )}

      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>
          Gemte betalingskort
        </div>

        {cards === null && !error && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Henter…</p>}
        {error && <p style={{ fontSize: 13.5, color: "#C0392B" }}>{error}</p>}
        {cards && cards.length === 0 && <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 16 }}>Du har ingen gemte kort endnu.</p>}

        {cards && cards.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {cards.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#F5F7FB", borderRadius: 12 }}>
                <CreditCard size={18} color="#5B6478" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {BRAND_LABELS[c.brand] || c.brand} •••• {c.last4}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9AA2B1" }}>
                    Udløber {String(c.expMonth).padStart(2, "0")}/{c.expYear}
                  </div>
                </div>
                <button
                  onClick={() => removeCard(c.id)}
                  title="Fjern kort"
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={addCard}
          disabled={adding}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "#2A55E5",
            color: "#fff",
            cursor: adding ? "default" : "pointer",
            opacity: adding ? 0.6 : 1,
          }}
        >
          <Plus size={14} />
          {adding ? "Åbner…" : "Tilføj betalingskort"}
        </button>
      </div>

      <div style={{ background: "#EEF2FF", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <ShieldCheck size={18} color="#2A55E5" style={{ flex: "0 0 auto", marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Krypteret betaling</div>
            <div style={{ fontSize: 12.5, color: "#5B6478" }}>Dine kortoplysninger håndteres sikkert af Stripe — de går aldrig gennem Kontorbuds egne servere.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Lock size={18} color="#2A55E5" style={{ flex: "0 0 auto", marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Du bestemmer over pengene</div>
            <div style={{ fontSize: 12.5, color: "#5B6478" }}>Beløbet holdes, indtil du selv markerer opgaven som udført — det udbetales aldrig automatisk.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
