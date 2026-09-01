"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => setStatus(data.error ? "error" : "ok"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div style={{ marginTop: 60, textAlign: "center", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
      {status === "loading" && <p style={{ color: "#5B6478", fontSize: 14 }}>Bekræfter din email…</p>}
      {status === "ok" && (
        <>
          <CheckCircle2 size={40} color="#1AA37A" style={{ marginBottom: 14 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Email bekræftet</h2>
          <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 20 }}>Din konto er nu fuldt aktiveret.</p>
          <Link href="/" style={{ display: "inline-block", fontSize: 14, fontWeight: 700, padding: "11px 22px", borderRadius: 10, background: "#2A55E5", color: "#fff" }}>
            Gå til Kontorbud
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle size={40} color="#C0392B" style={{ marginBottom: 14 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Linket virkede ikke</h2>
          <p style={{ color: "#5B6478", fontSize: 14 }}>Det kan være udløbet eller allerede brugt. Log ind, og bed om et nyt fra din profil.</p>
        </>
      )}
    </div>
  );
}
