"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useName } from "@/lib/NameContext";
import { ShieldCheck, Trash2 } from "lucide-react";

function Badge({ children, tone }) {
  const tones = {
    open: { bg: "#FFF1E0", color: "#B5610E" },
    matched: { bg: "#EEF2FF", color: "#1B3AA6" },
    completed: { bg: "#E9F9F1", color: "#146B4E" },
    cancelled: { bg: "#F5F7FB", color: "#5B6478" },
  };
  const t = tones[tone] || tones.open;
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: t.bg, color: t.color, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export default function AdminPage() {
  const { name, isAdmin, ready } = useName();
  const router = useRouter();
  const [tab, setTab] = useState("tasks");
  const [tasks, setTasks] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && name && !isAdmin) router.push("/");
  }, [ready, name, isAdmin, router]);

  function loadTasks() {
    fetch("/api/admin/tasks")
      .then((r) => r.json())
      .then((data) => (data.error ? setError(data.error) : setTasks(data.tasks)));
  }
  function loadUsers() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => (data.error ? setError(data.error) : setUsers(data.users)));
  }

  useEffect(() => {
    if (!isAdmin) return;
    loadTasks();
    loadUsers();
  }, [isAdmin]);

  async function deleteTask(id, title) {
    if (!confirm(`Slet "${title}" permanent? Eventuel holdt betaling refunderes automatisk. Kan ikke fortrydes.`)) return;
    const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    loadTasks();
  }

  if (!ready || (name && !isAdmin)) return null;
  if (!isAdmin) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Log ind som administrator for at se denne side.</div>;
  }

  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <ShieldCheck size={20} color="#2A55E5" />
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Admin</h2>
      </div>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>Overblik til kundeservice — alle opgaver og brugere, uanset status.</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 22, background: "#F5F7FB", borderRadius: 10, padding: 4, width: "fit-content" }}>
        <button
          onClick={() => setTab("tasks")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "tasks" ? "#2A55E5" : "transparent", color: tab === "tasks" ? "#fff" : "#5B6478" }}
        >
          Opgaver
        </button>
        <button
          onClick={() => setTab("users")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", background: tab === "users" ? "#2A55E5" : "transparent", color: tab === "users" ? "#fff" : "#5B6478" }}
        >
          Brugere
        </button>
      </div>

      {error && <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>{error}</div>}

      {tab === "tasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks === null && <p style={{ color: "#5B6478", fontSize: 13.5 }}>Henter…</p>}
          {tasks && tasks.length === 0 && <p style={{ color: "#5B6478", fontSize: 13.5 }}>Ingen opgaver endnu.</p>}
          {tasks &&
            tasks.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: "14px 18px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/opgave/${t.id}`} style={{ fontWeight: 700, fontSize: 13.5, color: "#14213D" }}>
                    {t.title}
                  </Link>
                  <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 2 }}>
                    {t.caseNo} · {t.category} · oprettet af {t.postedBy} · {t.bidCount} bud
                  </div>
                </div>
                <Badge tone={t.status}>{t.status}</Badge>
                {t.paymentStatus !== "unpaid" && <Badge tone="matched">{t.paymentStatus}</Badge>}
                <button
                  onClick={() => deleteTask(t.id, t.title)}
                  title="Slet permanent"
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #FDECEC", background: "#fff", color: "#C0392B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "0 0 auto" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>
      )}

      {tab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users === null && <p style={{ color: "#5B6478", fontSize: 13.5 }}>Henter…</p>}
          {users &&
            users.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 14, padding: "14px 18px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/bruger/${encodeURIComponent(u.name)}`} style={{ fontWeight: 700, fontSize: 13.5, color: "#14213D" }}>
                    {u.name}
                  </Link>
                  <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 2 }}>{u.email}</div>
                </div>
                {u.isAdmin && <Badge tone="matched">Admin</Badge>}
                {u.emailVerified ? <Badge tone="completed">Email bekræftet</Badge> : <Badge tone="open">Email ikke bekræftet</Badge>}
                {u.stripeConnected ? <Badge tone="completed">Stripe forbundet</Badge> : <Badge tone="cancelled">Ingen Stripe</Badge>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
