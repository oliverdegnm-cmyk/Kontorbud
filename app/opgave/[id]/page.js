"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, ShieldCheck } from "lucide-react";
import Badge from "@/components/Badge";
import { useName } from "@/lib/NameContext";

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

  return (
    <div>
      <div
        onClick={() => router.push("/")}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#5B6478", cursor: "pointer", marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Tilbage til opgaver
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 26, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 26 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: "#F5F7FB", color: "#5B6478" }}>
              {task.category}
            </span>
            {task.bids.length === 0 ? <Badge tone="open">Ledig</Badge> : <Badge tone="bids">{task.bids.length} bud</Badge>}
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
            {task.bids.map((b, i) => (
              <div key={b.id} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: i < task.bids.length - 1 ? "1px solid #E4E8F0" : "none" }}>
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
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>
                    {b.bidderName}
                    {b.bidderName === name ? " (dig)" : ""}
                  </span>
                  <div style={{ fontSize: 13, color: "#5B6478", marginTop: 5, lineHeight: 1.55 }}>{b.message}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: "nowrap", color: b.bidderName === name ? "#2A55E5" : "#14213D" }}>
                  {b.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 22 }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Budget: {task.budget}</h3>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Dit bud (kr)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="f.eks. 1.200 kr"
            style={{ width: "100%", fontSize: 14, padding: "11px 13px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
          />
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
        </div>
      </div>
    </div>
  );
}
