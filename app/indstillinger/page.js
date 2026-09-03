"use client";

import { useState } from "react";
import { useName } from "@/lib/NameContext";

export default function SettingsPage() {
  const { name, email, phone, emailNotifications, smsNotifications, refresh } = useName();

  const [newEmail, setNewEmail] = useState(email);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");

  const [newPhone, setNewPhone] = useState(phone);
  const [notifOn, setNotifOn] = useState(emailNotifications);
  const [smsOn, setSmsOn] = useState(smsNotifications);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState(false);

  async function saveEmail() {
    if (!newEmail.trim() || newEmail.trim().toLowerCase() === email) return;
    setEmailSaving(true);
    setEmailErr("");
    setEmailMsg("");
    const res = await fetch("/api/auth/change-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail }),
    });
    const data = await res.json();
    setEmailSaving(false);
    if (data.error) {
      setEmailErr(data.error);
      return;
    }
    await refresh();
    setEmailMsg("✓ Email opdateret. Vi har sendt et nyt bekræftelseslink til den.");
  }

  async function saveSettings() {
    setSettingsSaving(true);
    setSettingsMsg(false);
    await fetch("/api/auth/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: newPhone, emailNotifications: notifOn, smsNotifications: smsOn }),
    });
    await refresh();
    setSettingsSaving(false);
    setSettingsMsg(true);
    setTimeout(() => setSettingsMsg(false), 2500);
  }

  return (
    <div style={{ marginTop: 24, maxWidth: 620, marginBottom: 60 }}>
      <h2 style={{ fontSize: 24, marginBottom: 4 }}>Indstillinger</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 28 }}>Administrer din konto — kontaktoplysninger og notifikationer.</p>

      {/* Email */}
      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>E-mailadresse</div>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          style={{ width: "100%", fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
        />
        <button
          onClick={saveEmail}
          disabled={emailSaving || newEmail.trim().toLowerCase() === email}
          style={{ marginTop: 12, fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", opacity: emailSaving || newEmail.trim().toLowerCase() === email ? 0.5 : 1 }}
        >
          {emailSaving ? "Gemmer…" : "Opdater email"}
        </button>
        {emailMsg && <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: "#1AA37A" }}>{emailMsg}</div>}
        {emailErr && <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: "#C0392B" }}>{emailErr}</div>}
      </div>

      {/* Telefon + notifikationer */}
      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 16, padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>Mobilnummer</div>
        <input
          type="tel"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="Ikke angivet"
          style={{ width: "100%", fontSize: 14, padding: "11px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginBottom: 20 }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 18, borderTop: "1px solid #E4E8F0" }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Email-notifikationer</div>
            <div style={{ fontSize: 12, color: "#5B6478", marginTop: 2 }}>Få besked på mail om nye bud, beskeder og opdateringer.</div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 44, height: 26, flex: "0 0 auto" }}>
            <input type="checkbox" checked={notifOn} onChange={(e) => setNotifOn(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span
              onClick={() => setNotifOn(!notifOn)}
              style={{
                position: "absolute",
                inset: 0,
                background: notifOn ? "#2A55E5" : "#E4E8F0",
                borderRadius: 999,
                cursor: "pointer",
                transition: "background .15s ease",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: notifOn ? 21 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .15s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                }}
              />
            </span>
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 18, borderTop: "1px solid #E4E8F0" }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>SMS-notifikationer</div>
            <div style={{ fontSize: 12, color: "#5B6478", marginTop: 2 }}>Få besked som SMS om nye bud, beskeder og opdateringer.</div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 44, height: 26, flex: "0 0 auto" }}>
            <input type="checkbox" checked={smsOn} onChange={(e) => setSmsOn(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span
              onClick={() => setSmsOn(!smsOn)}
              style={{
                position: "absolute",
                inset: 0,
                background: smsOn ? "#2A55E5" : "#E4E8F0",
                borderRadius: 999,
                cursor: "pointer",
                transition: "background .15s ease",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: smsOn ? 21 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .15s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                }}
              />
            </span>
          </label>
        </div>

        <button
          onClick={saveSettings}
          disabled={settingsSaving}
          style={{ marginTop: 20, fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", opacity: settingsSaving ? 0.6 : 1 }}
        >
          {settingsSaving ? "Gemmer…" : "Gem indstillinger"}
        </button>
        {settingsMsg && <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: "#1AA37A" }}>✓ Gemt.</div>}
      </div>
    </div>
  );
}
