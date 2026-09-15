"use client";

import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useName } from "@/lib/NameContext";
import Stars from "@/components/Stars";
import { CreditCard, ShieldCheck, Lock, Trash2, Plus, Wallet, Info } from "lucide-react";

const BRAND_LABELS = { visa: "Visa", mastercard: "Mastercard", amex: "American Express" };

// Gør et evt. link inde i en fejlbesked fra Stripe klikbart, i stedet for at
// vise det som rå, ikke-klikbar tekst.
function LinkifiedText({ text }) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#C0392B", textDecoration: "underline", fontWeight: 700 }}>
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function PaymentsPage() {
  const { name } = useName();
  const searchParams = useSearchParams();

  // Kort du betaler med
  const [cards, setCards] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState("");

  // Konto du modtager penge på
  const [level, setLevel] = useState(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripePayoutsEnabled, setStripePayoutsEnabled] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [stripeError, setStripeError] = useState("");

  // Instant Payout - hjælperen beder selv om at få sin saldo udbetalt med det
  // samme, i stedet for at vente på Stripes normale udbetalingsplan.
  const [instantPayoutBusy, setInstantPayoutBusy] = useState(false);
  const [instantPayoutMsg, setInstantPayoutMsg] = useState(null); // { type: "success" | "info" | "error", text }

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

  useEffect(() => {
    if (!name) return;
    fetch(`/api/profiles/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setStripeConnected(data.profile.stripeConnected);
          setStripePayoutsEnabled(data.profile.stripePayoutsEnabled);
        }
      });
    fetch(`/api/helpers/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => !data.error && setLevel(data));
  }, [name]);

  useEffect(() => {
    if (!name) return;
    // Tjekker altid den friske status hos Stripe, når siden besøges - ikke kun
    // lige efter man vender tilbage fra onboarding - så en forbindelse, der er
    // blevet ugyldig i baggrunden (f.eks. efter et skift til Live mode), bliver
    // opdaget og vist tydeligt, i stedet for først at fejle ved en udbetaling.
    fetch(`/api/stripe/status/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setStripeConnected(data.connected);
          setStripePayoutsEnabled(data.payoutsEnabled);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, searchParams]);

  async function connectStripe() {
    setConnecting(true);
    setStripeError("");
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.error) {
        setStripeError(data.error);
        setConnecting(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setStripeError("Kunne ikke starte Stripe-forbindelsen.");
      setConnecting(false);
    }
  }

  async function requestInstantPayout() {
    setInstantPayoutBusy(true);
    setInstantPayoutMsg(null);
    try {
      const res = await fetch("/api/stripe/instant-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.error) {
        setInstantPayoutMsg({ type: "error", text: data.error });
        return;
      }
      if (data.paid) {
        setInstantPayoutMsg({ type: "success", text: `${data.amount.toLocaleString("da-DK")} kr er sendt til din bank med det samme.` });
      } else {
        setInstantPayoutMsg({ type: "info", text: data.message });
      }
    } catch (e) {
      setInstantPayoutMsg({ type: "error", text: "Kunne ikke gennemføre Instant Payout. Prøv igen." });
    } finally {
      setInstantPayoutBusy(false);
    }
  }

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
        <Wallet size={20} color="#2A55E5" />
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Betalingsmetoder</h2>
      </div>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>Både dine gemte kort og kontoen, du modtager penge på, samlet ét sted.</p>

      {banner && (
        <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A" }}>
          {banner}
        </div>
      )}

      {/* Udbetaling */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, marginTop: 4 }}>
        Udbetaling - når du vinder et bud
      </div>

      <div style={{ background: "#EEF2FF", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <Info size={18} color="#2A55E5" style={{ flex: "0 0 auto", marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Hvorfor bruger vi Stripe?</div>
            <div style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.5 }}>Stripe er en af verdens største og mest sikre betalingsudbydere, og bruges af millioner af virksomheder til at håndtere betalinger trygt for begge parter.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <ShieldCheck size={18} color="#2A55E5" style={{ flex: "0 0 auto", marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Sikkert og krypteret</div>
            <div style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.5 }}>Dine bank- og kortoplysninger går aldrig gennem vores egne servere.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Lock size={18} color="#2A55E5" style={{ flex: "0 0 auto", marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Du bestemmer over pengene</div>
            <div style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.5 }}>Beløbet holdes, indtil opgaven markeres som udført. For at modtage det skal Stripe bekræfte din identitet og dit IBAN (et lovkrav) - det finder du i din netbank.</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        {stripePayoutsEnabled ? (
          <div>
            <div style={{ fontSize: 13.5, color: "#1AA37A", fontWeight: 600, marginBottom: 14 }}>
              ✓ Din Stripe-konto er forbundet og klar til at modtage udbetalinger.
            </div>

            {level && level.completedCount >= 3 ? (
              <div style={{ paddingTop: 14, borderTop: "1.5px solid #E4E8F0" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>Instant Payout</div>
                <p style={{ fontSize: 12.5, color: "#5B6478", marginBottom: 10, lineHeight: 1.6 }}>
                  Har du penge, der stadig venter hos Stripe efter en udført opgave? Du kan bede om at få det, der allerede er frigivet til udbetaling, sendt til din bank med det samme (mod et lille Stripe-gebyr), i stedet for at vente på den normale udbetalingsplan.
                </p>
                <button
                  onClick={requestInstantPayout}
                  disabled={instantPayoutBusy}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: "9px 16px", borderRadius: 10, border: "none", background: "#1AA37A", color: "#fff", cursor: instantPayoutBusy ? "default" : "pointer", opacity: instantPayoutBusy ? 0.6 : 1 }}
                >
                  {instantPayoutBusy ? "Sender…" : "Udbetal med det samme"}
                </button>
                {instantPayoutMsg && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: instantPayoutMsg.type === "error" ? "#C0392B" : instantPayoutMsg.type === "success" ? "#1AA37A" : "#5B6478",
                    }}
                  >
                    {instantPayoutMsg.text}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ paddingTop: 14, borderTop: "1.5px solid #E4E8F0", fontSize: 12.5, color: "#9AA2B1" }}>
                Instant Payout (udbetal med det samme mod et lille gebyr) låses op, når du har {3 - (level?.completedCount || 0)} flere gennemførte {3 - (level?.completedCount || 0) === 1 ? "opgave" : "opgaver"}.
              </div>
            )}
          </div>
        ) : stripeConnected ? (
          <div>
            <div style={{ fontSize: 13.5, color: "#B5610E", fontWeight: 600, marginBottom: 14 }}>
              Din Stripe-konto er oprettet, men onboardingen er ikke færdig endnu.
            </div>
            <button
              onClick={connectStripe}
              disabled={connecting}
              style={{ fontSize: 13.5, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", opacity: connecting ? 0.6 : 1 }}
            >
              {connecting ? "Åbner Stripe…" : "Fortsæt opsætning"}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 14, lineHeight: 1.6 }}>
              Forbind en Stripe-konto for at kunne modtage betaling, når du vinder bud. Opgavestillere kan ikke vælge dine bud, før du har forbundet Stripe.
            </p>
            <button
              onClick={connectStripe}
              disabled={connecting}
              style={{ fontSize: 13.5, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", opacity: connecting ? 0.6 : 1 }}
            >
              {connecting ? "Åbner Stripe…" : "Forbind Stripe"}
            </button>
          </div>
        )}
        {stripeError && (
          <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "#FDECEC", fontSize: 12.5, color: "#C0392B", lineHeight: 1.6 }}>
            <LinkifiedText text={stripeError} />
          </div>
        )}
      </div>

      {level && (
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 20, marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Niveau</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.level.label}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Servicegebyr</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.level.feePercent}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Udførelsesrate</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{level.completionRate}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Anmeldelser</div>
            <div style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              {level.reviewCount > 0 ? (
                <>
                  <Stars value={level.avgRating} /> ({level.reviewCount})
                </>
              ) : (
                "Ingen endnu"
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indbetaling */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, marginTop: 28 }}>
        Kort - når du betaler for en opgave
      </div>
      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 22, marginBottom: 20 }}>
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

    </div>
  );
}

export default function PaymentsPageWrapper() {
  return (
    <RequireAuth>
      <PaymentsPage />
    </RequireAuth>
  );
}
