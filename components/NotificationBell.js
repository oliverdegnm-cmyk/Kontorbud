"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Gavel, CheckCircle2, MessageSquare, XCircle, UserX, Star, ShieldCheck, Reply } from "lucide-react";

// Ikon og farve pr. notifikationstype, så listen kan skimmes uden at læse hver
// linje - i stedet for én ensfarvet tekstvæg (se skærmbillede fra brugeren).
const TYPE_STYLE = {
  new_bid: { icon: Gavel, color: "#2A55E5", bg: "#EEF2FF" },
  bid_accepted: { icon: CheckCircle2, color: "#1AA37A", bg: "#E9F9F1" },
  new_message: { icon: MessageSquare, color: "#5B6478", bg: "#F5F7FB" },
  task_completed: { icon: CheckCircle2, color: "#1AA37A", bg: "#E9F9F1" },
  task_cancelled: { icon: XCircle, color: "#C0392B", bg: "#FDECEC" },
  helper_withdrew: { icon: UserX, color: "#B5610E", bg: "#FFF1E0" },
  new_review: { icon: Star, color: "#B5610E", bg: "#FFF1E0" },
  admin_message: { icon: ShieldCheck, color: "#2A55E5", bg: "#EEF2FF" },
  support_reply: { icon: Reply, color: "#2A55E5", bg: "#EEF2FF" },
};
const DEFAULT_TYPE_STYLE = { icon: Bell, color: "#5B6478", bg: "#F5F7FB" };

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "lige nu";
  if (diff < 3600) return `${Math.floor(diff / 60)} min siden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} t siden`;
  return `${Math.floor(diff / 86400)} dage siden`;
}

// Hvor et klik på notifikationen skal føre hen. De fleste typer har en taskId
// og går til opgavens side; admin-beskeder har ingen opgave og skal i stedet
// til support-tråden i "Mine beskeder".
function destinationFor(n) {
  if (n.taskId) return `/opgave/${n.taskId}`;
  if (n.type === "admin_message") return "/beskeder/support";
  if (n.type === "support_reply") return "/admin?tab=support";
  return null;
}

export default function NotificationBell({ name }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);
  const router = useRouter();

  function load() {
    fetch(`/api/notifications?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      });
  }

  useEffect(() => {
    if (!name) return;
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }

  if (!name) return null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={toggleOpen}
        aria-label="Notifikationer"
        style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #E4E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <Bell size={16} color="#5B6478" />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              background: "#C0392B",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 999,
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            width: 340,
            maxHeight: 400,
            overflowY: "auto",
            background: "#fff",
            border: "1.5px solid #E4E8F0",
            borderRadius: 14,
            boxShadow: "0 12px 28px -12px rgba(20,33,61,0.25)",
            zIndex: 50,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {notifications.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: "#5B6478", textAlign: "center" }}>Ingen notifikationer endnu.</div>
          )}
          {notifications.map((n) => {
            const { icon: Icon, color, bg } = TYPE_STYLE[n.type] || DEFAULT_TYPE_STYLE;
            const dest = destinationFor(n);
            return (
              <div
                key={n.id}
                onClick={() => {
                  setOpen(false);
                  if (dest) router.push(dest);
                }}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 10px",
                  borderRadius: 10,
                  cursor: dest ? "pointer" : "default",
                  background: n.isRead ? "transparent" : "#F5F7FB",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F7FB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? "transparent" : "#F5F7FB")}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: bg,
                    color: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <Icon size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "#14213D", lineHeight: 1.5, fontWeight: n.isRead ? 400 : 700 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: "#9AA2B1", marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
                </div>
                {!n.isRead && (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2A55E5", flex: "0 0 auto", marginTop: 5 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
