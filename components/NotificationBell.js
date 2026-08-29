"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

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
            width: 320,
            maxHeight: 360,
            overflowY: "auto",
            background: "#fff",
            border: "1.5px solid #E4E8F0",
            borderRadius: 14,
            boxShadow: "0 12px 28px -12px rgba(20,33,61,0.25)",
            zIndex: 50,
            padding: 8,
          }}
        >
          {notifications.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: "#5B6478", textAlign: "center" }}>Ingen notifikationer endnu.</div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                setOpen(false);
                if (n.taskId) router.push(`/opgave/${n.taskId}`);
              }}
              style={{ padding: "10px 12px", borderRadius: 10, cursor: n.taskId ? "pointer" : "default", fontSize: 13, color: "#14213D", lineHeight: 1.5 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F7FB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {n.body}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
