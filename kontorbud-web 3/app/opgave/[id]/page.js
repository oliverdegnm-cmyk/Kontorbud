"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Badge from "@/components/Badge";
import MessageThread from "@/components/MessageThread";
import { useName } from "@/lib/NameContext";
import { feeBreakdown, formatKr } from "@/lib/fees";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { name } = useName();

  const [task, setTask] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [acceptError, setAcceptError] = useState("");
  const [openThread, setOpenThread] = useState(null);
  const [myLevel, setMyLevel] = useState(null);

  function load() {
    fetch(`/api/tasks/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setNotFound(true);
        else setTask(data.task);
      })
      .catch(() => setNotFound(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    try {
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
    } catch (e) {
      setError("Kunne ikke afgive bud. Prøv igen.");
    }
  }

  async function acceptBid(bidId) {
    setAcceptError("");
    try {
      const res = await fetch(`/api/tasks/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId, requesterName: name }),
      });
      const data = await res.json();
      if (data.error) {
        setAcceptError(data.error);
        return;
      }
      load();
    } catch (e) {
      setAcceptError("Kunne ikke vælge buddet. Prøv igen.");
    }
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
  const acceptedBid = isMatched ? task.bids.find((b) => b.id === task.acceptedBidId) : null;
  const isAcceptedBidder = acceptedBid && acceptedBid.bidderName === name;
  const myFee = isAcceptedBidder && myLevel && acceptedBid.amountValue ? feeBreakdown(acceptedBid.amountValue, myLevel.earnings30d) : null;

  return (
    <div>
      <div
        onClick={() => router.push("/")}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#5B6478", cursor: "pointer", marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Tilbage til opgaver
      </div>

      {isMatched && acceptedBid && (isOwner || isAcceptedBidder) && (
        <div style={{ background: "#E9F9F1", border: "1.5px solid #1AA37A", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: "#146B4E", marginBottom: 6 }}>
            ✓ Opgaven er tildelt {isOwner ? acceptedBid.bidderName : "dig"}
          </div>
          {isAcceptedBidder && myFee && (
            <div style={{ fontSize: 13, color: "#146B4E", lineHeight: 1.6 }}>
              Buddet var på {formatKr(acceptedBid.amountValue)}. Som <b>{myFee.level.label}</b>-hjælper ({myFee.level.feePercent}% servicegebyr) modtager du ca. <b>{formatKr(myFee.net)}</b> efter gebyr.
            </div>
          )}
          <div style={{ fontSize: 13, color: "#146B4E", marginTop: 6 }}>
            Aftal de sidste detaljer i beskederne nedenfor — al kontakt foregår her på siden.
          </div>
          <MessageThread taskId={task.id} bidderName={acceptedBid.bidderName} currentName={name} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 26, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 26 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: "#F5F7FB", color: "#5B6478" }}>
              {task.category}
            </span>
            {isMatched ? (
              <Badge tone="matched">Tildelt</Badge>
            ) : task.bids.length === 0 ? (
              <Badge tone="open">Ledig</Badge>
            ) : (
              <Badge tone="bids">{task.bids.length} bud</Badge>
            )}
          </div>
          <h2 style={{ fontSize: 22, lineHeight: 1.25, marginBottom: 12 }}>{task.title}</h2>
          <p style={{ fontSize: 14, color: "#5B6478", lineHeight: 1.7 }}>{task.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20, paddingTop: 20, borderTop: "1px solid #E4E8F0" }}>
            <div>
              <div style={{ fontSize: 11, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Oprettet af</div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{task.postedBy}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#5B6478", fontWeight: 600, marginBottom: 4 }}>Frist</div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{task.deadline}</div>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Bud ({task.bids.length})</h3>
            {task.bids.length === 0 && <p style={{ fontSize: 13.5, color: "#5B6478" }}>Ingen bud endnu. Vær den første.</p>}
            {acceptError && (
              <div style={{ marginBottom: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>
                {acceptError}
              </div>
            )}
            {task.bids.map((b, i) => {
              const canChat = isOwner || b.bidderName === name;
              return (
                <div key={b.id} style={{ padding: "14px 0", borderBottom: i < task.bids.length - 1 ? "1px solid #E4E8F0" : "none" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>
                          {b.bidderName}
                          {b.bidderName === name ? " (dig)" : ""}
                        </span>
                        {isMatched && task.acceptedBidId === b.id && <Badge tone="matched">Valgt</Badge>}
                      </div>
                      <div style={{ fontSize: 13, color: "#5B6478", marginTop: 5, lineHeight: 1.55 }}>{b.message}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        {isOwner && task.status === "open" && (
                          <button
                            onClick={() => acceptBid(b.id)}
                            style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: "1.5px solid #2A55E5", background: "#fff", color: "#2A55E5", cursor: "pointer" }}
                          >
                            Vælg dette bud
                          </button>
                        )}
                        {canChat && !(isMatched && task.acceptedBidId === b.id) && (
                          <button
                            onClick={() => setOpenThread(openThread === b.bidderName ? null : b.bidderName)}
                            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: "1.5px solid #E4E8F0", background: "#fff", color: "#5B6478", cursor: "pointer" }}
                          >
                            <MessageCircle size={13} /> {openThread === b.bidderName ? "Skjul besked" : "Send besked"}
                          </button>
                        )}
                      </div>
                      {canChat && openThread === b.bidderName && !(isMatched && task.acceptedBidId === b.id) && (
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
              Denne opgave er allerede tildelt og modtager ikke flere bud.
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
                  <b>{formatKr(feeBreakdown(Number(amount), myLevel.earnings30d).net)}</b> hvis buddet vælges.
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
