"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, FileText } from "lucide-react";
import Badge from "@/components/Badge";
import MessageThread from "@/components/MessageThread";
import ReviewForm from "@/components/ReviewForm";
import { useName } from "@/lib/NameContext";
import { feeBreakdown, formatKr } from "@/lib/fees";
import { statusInfo } from "@/lib/status";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { name } = useName();
  const [checkoutBanner, setCheckoutBanner] = useState(null);

  const [task, setTask] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [actionError, setActionError] = useState("");
  const [openThread, setOpenThread] = useState(null);
  const [myLevel, setMyLevel] = useState(null);
  const [reviews, setReviews] = useState([]);

  function load() {
    fetch(`/api/tasks/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setNotFound(true);
        else setTask(data.task);
      })
      .catch(() => setNotFound(true));
    fetch(`/api/tasks/${id}/reviews`)
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setCheckoutBanner("Betaling gennemført. Vi venter på bekræftelse fra Stripe — opdaterer om lidt…");
      let attempts = 0;
      const interval = setInterval(() => {
        attempts += 1;
        load();
        if (attempts >= 6) clearInterval(interval);
      }, 2000);
      return () => clearInterval(interval);
    } else if (checkout === "cancelled") {
      setCheckoutBanner("Betalingen blev annulleret. Buddet er ikke valgt.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!name) return;
    fetch(`/api/helpers/${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => !data.error && setMyLevel(data))
      .catch(() => {});
  }, [name]);

  async function submitBid() {
    if (!amount.trim()) {
      setError("Angiv et beløb, før du afgiver dit bud.");
      return;
    }
    setError("");
    const res = await fetch(`/api/tasks/${id}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidderName: name, amount: amount.trim(), message: msg.trim() }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return;
    }
    setOk(true);
    setAmount("");
    setMsg("");
    load();
  }

  const [checkingOut, setCheckingOut] = useState(null);

  async function acceptBid(bidId) {
    setActionError("");
    setCheckingOut(bidId);
    try {
      const res = await fetch(`/api/tasks/${id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId, requesterName: name }),
      });
      const data = await res.json();
      if (data.error) {
        setActionError(data.error);
        setCheckingOut(null);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setActionError("Kunne ikke starte betalingen. Prøv igen.");
      setCheckingOut(null);
    }
  }

  async function completeTask() {
    setActionError("");
    const res = await fetch(`/api/tasks/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterName: name }),
    });
    const data = await res.json();
    if (data.error) return setActionError(data.error);
    load();
  }

  async function cancelTask() {
    if (!confirm("Er du sikker på at du vil annullere denne opgave?")) return;
    setActionError("");
    const res = await fetch(`/api/tasks/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterName: name }),
    });
    const data = await res.json();
    if (data.error) return setActionError(data.error);
    load();
  }

  async function deleteTask() {
    if (!confirm("Slet denne opgave permanent? Det kan ikke fortrydes.")) return;
    setActionError("");
    const res = await fetch(`/api/tasks/${id}?requesterName=${encodeURIComponent(name)}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) return setActionError(data.error);
    router.push("/");
  }

  async function withdrawBid(bidId) {
    if (!confirm("Træk dit bud tilbage?")) return;
    setActionError("");
    const res = await fetch(`/api/tasks/${id}/bids/${bidId}?requesterName=${encodeURIComponent(name)}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) return setActionError(data.error);
    load();
  }

  if (notFound) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>
        Sagen findes ikke. <Link href="/" style={{ color: "#2A55E5", fontWeight: 700 }}>Tilbage til opgaver</Link>
      </div>
    );
  }
  if (!task) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Henter opgave…</div>;
  }

  const isOwner = task.postedBy === name;
  const isMatched = task.status === "matched";
  const isCompleted = task.status === "completed";
  const isCancelled = task.status === "cancelled";
  const acceptedBid = isMatched || isCompleted ? task.bids.find((b) => b.id === task.acceptedBidId) : null;
  const isAcceptedBidder = acceptedBid && acceptedBid.bidderName === name;
  const myFee = isAcceptedBidder && myLevel && acceptedBid.amountValue ? feeBreakdown(acceptedBid.amountValue, myLevel.earnings30d, myLevel.completionRate) : null;
  const status = statusInfo(task);

  const myReview = reviews.find((r) => r.reviewerName === name);
  const canReview = isCompleted && (isOwner || isAcceptedBidder) && !myReview;

  return (
    <div>
      <div
        onClick={() => router.push("/")}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#5B6478", cursor: "pointer", marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Tilbage til opgaver
      </div>

      {actionError && (
        <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>
          {actionError}
        </div>
      )}

      {checkoutBanner && (
        <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#EEF2FF", color: "#1B3AA6" }}>
          {checkoutBanner}
        </div>
      )}

      {isCancelled && (
        <div style={{ background: "#F5F7FB", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: "16px 20px", marginBottom: 20, fontSize: 13.5, color: "#5B6478" }}>
          Denne opgave blev annulleret af opgavestilleren.
        </div>
      )}

      {(isMatched || isCompleted) && acceptedBid && (isOwner || isAcceptedBidder) && (
        <div style={{ background: "#E9F9F1", border: "1.5px solid #1AA37A", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: "#146B4E", marginBottom: 6 }}>
              {isCompleted ? "✓ Opgaven er udført" : `✓ Opgaven er tildelt ${isOwner ? acceptedBid.bidderName : "dig"}`}
            </div>
            {isOwner && isMatched && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={completeTask}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: "none", background: "#1AA37A", color: "#fff", cursor: "pointer" }}
                >
                  Marker som udført
                </button>
                <button
                  onClick={cancelTask}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", cursor: "pointer" }}
                >
                  Annullér
                </button>
              </div>
            )}
          </div>
          {isAcceptedBidder && myFee && (
            <div style={{ fontSize: 13, color: "#146B4E", lineHeight: 1.6 }}>
              Buddet var på {formatKr(acceptedBid.amountValue)}. Som <b>{myFee.level.label}</b>-hjælper ({myFee.level.feePercent}% servicegebyr) {isCompleted ? "modtog" : "modtager"} du ca. <b>{formatKr(myFee.net)}</b>.
            </div>
          )}
          {task.paymentStatus === "held" && (
            <div style={{ fontSize: 12.5, color: "#146B4E", marginTop: 4 }}>
              💳 Betalingen er modtaget og holdes af platformen, indtil opgaven markeres som udført.
            </div>
          )}
          {task.paymentStatus === "released" && (
            <div style={{ fontSize: 12.5, color: "#146B4E", marginTop: 4 }}>
              💳 Betalingen er frigivet til hjælperen.
            </div>
          )}
          {!isCompleted && (
            <div style={{ fontSize: 13, color: "#146B4E", marginTop: 6 }}>
              Aftal de sidste detaljer i beskederne nedenfor — al kontakt foregår her på siden.
            </div>
          )}
          <MessageThread taskId={task.id} bidderName={acceptedBid.bidderName} currentName={name} />

          {canReview && <ReviewForm taskId={task.id} currentName={name} onSubmitted={load} />}
          {isCompleted && myReview && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: "#146B4E" }}>Du har allerede anmeldt denne opgave.</div>
          )}
        </div>
      )}

      {isCompleted && reviews.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Anmeldelser af denne opgave</div>
          {reviews.map((r) => (
            <div key={r.id} style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: 14, marginBottom: 8, fontSize: 13 }}>
              <b>{r.reviewerName}</b> gav <b>{r.revieweeName}</b> {r.rating} ★{r.comment ? ` — ${r.comment}` : ""}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 26, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 26 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: "#F5F7FB", color: "#5B6478" }}>
              {task.category}
            </span>
            {task.area && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: "#F5F7FB", color: "#5B6478" }}>
                📍 {task.area}
              </span>
            )}
            <Badge tone={status.tone}>{status.label}</Badge>
            {isOwner && task.status === "open" && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <Link
                  href={`/opgave/${task.id}/rediger`}
                  style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478" }}
                >
                  Redigér
                </Link>
                {task.bids.length === 0 ? (
                  <button
                    onClick={deleteTask}
                    style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", cursor: "pointer" }}
                  >
                    Slet opgave
                  </button>
                ) : (
                  <button
                    onClick={cancelTask}
                    style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", cursor: "pointer" }}
                  >
                    Annullér opgave
                  </button>
                )}
              </div>
            )}
          </div>
          <h2 style={{ fontSize: 22, lineHeight: 1.25, marginBottom: 12 }}>{task.title}</h2>
          <p style={{ fontSize: 14, color: "#5B6478", lineHeight: 1.7 }}>{task.description}</p>
          {task.attachments && task.attachments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              {task.attachments.map((a) => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#2A55E5", background: "#F5F7FB", padding: "8px 12px", borderRadius: 10, width: "fit-content" }}
                >
                  <FileText size={14} /> {a.filename}
                </a>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20, paddingTop: 20, borderTop: "1px solid #E4E8F0" }}>
            <div>
              <div style={{ fontSize: 11, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Oprettet af</div>
              <Link href={`/bruger/${encodeURIComponent(task.postedBy)}`} style={{ fontSize: 14.5, fontWeight: 700, color: "#2A55E5" }}>
                {task.postedBy}
              </Link>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Frist</div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{task.deadline}</div>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Bud ({task.bids.length})</h3>
            {task.bids.length === 0 && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Ingen bud endnu. Vær den første.</p>}
            {task.bids.map((b, i) => {
              const canChat = isOwner || b.bidderName === name;
              const isTheAcceptedOne = (isMatched || isCompleted) && task.acceptedBidId === b.id;
              return (
                <div key={b.id} style={{ padding: "14px 0", borderBottom: i < task.bids.length - 1 ? "1px solid #E4E8F0" : "none" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Link href={`/bruger/${encodeURIComponent(b.bidderName)}`}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
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
                        {initials(b.bidderName)}
                      </div>
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Link href={`/bruger/${encodeURIComponent(b.bidderName)}`} style={{ fontWeight: 700, fontSize: 13.5, color: "#14213D" }}>
                          {b.bidderName}
                          {b.bidderName === name ? " (dig)" : ""}
                        </Link>
                        {isTheAcceptedOne && <Badge tone="matched">Valgt</Badge>}
                      </div>
                      <div style={{ fontSize: 13, color: "#5B6478", marginTop: 5, lineHeight: 1.55 }}>{b.message}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        {isOwner && task.status === "open" && (
                          <button
                            onClick={() => acceptBid(b.id)}
                            disabled={checkingOut === b.id}
                            style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: "1.5px solid #2A55E5", background: "#fff", color: "#2A55E5", cursor: checkingOut === b.id ? "default" : "pointer", opacity: checkingOut === b.id ? 0.6 : 1 }}
                          >
                            {checkingOut === b.id ? "Åbner betaling…" : "Vælg og betal for dette bud"}
                          </button>
                        )}
                        {canChat && !isTheAcceptedOne && (
                          <button
                            onClick={() => setOpenThread(openThread === b.bidderName ? null : b.bidderName)}
                            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", cursor: "pointer" }}
                          >
                            <MessageCircle size={13} /> {openThread === b.bidderName ? "Skjul besked" : "Send besked"}
                          </button>
                        )}
                        {b.bidderName === name && task.status === "open" && (
                          <button
                            onClick={() => withdrawBid(b.id)}
                            style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", cursor: "pointer" }}
                          >
                            Træk bud tilbage
                          </button>
                        )}
                      </div>
                      {canChat && openThread === b.bidderName && !isTheAcceptedOne && (
                        <MessageThread taskId={task.id} bidderName={b.bidderName} currentName={name} />
                      )}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: "nowrap", color: b.bidderName === name ? "#2A55E5" : "#14213D" }}>
                      {b.amount}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 22 }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Budget: {task.budget}</h3>
          {task.status !== "open" ? (
            <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.6 }}>
              Denne opgave modtager ikke flere bud.
            </p>
          ) : (
            <>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Dit bud (kr)</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="f.eks. 1200"
                style={{ width: "100%", fontSize: 14, padding: "11px 13px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
              />
              {myLevel && amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                <div style={{ fontSize: 12, color: "#5B6478", marginTop: 6 }}>
                  Som {myLevel.level.label}-hjælper ({myLevel.level.feePercent}% gebyr) modtager du ca.{" "}
                  <b>{formatKr(feeBreakdown(Number(amount), myLevel.earnings30d, myLevel.completionRate).net)}</b> hvis buddet vælges.
                </div>
              )}
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5B6478", margin: "14px 0 6px" }}>Besked til opgavestiller</label>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Beskriv kort din erfaring og hvornår du kan gå i gang."
                style={{ width: "100%", minHeight: 76, fontSize: 14, padding: "11px 13px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", resize: "vertical" }}
              />
              <button
                onClick={submitBid}
                style={{ width: "100%", marginTop: 16, fontSize: 14.5, fontWeight: 700, padding: "12px 22px", borderRadius: 12, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer" }}
              >
                Afgiv bud
              </button>
              {error && (
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>
                  {error}
                </div>
              )}
              {ok && (
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A" }}>
                  ✓ Bud afgivet og gemt.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
