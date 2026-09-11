"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState(null); // "android" | "ios" | null
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Vis aldrig, hvis siden allerede kører som installeret app.
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isStandalone) return;

    if (localStorage.getItem("kb_install_dismissed") === "1") return;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos) {
      setPlatform("ios");
      setDismissed(false);
      return;
    }

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setDismissed(false);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("kb_install_dismissed", "1");
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setDismissed(true);
  }

  if (dismissed || !platform) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#EEF2FF",
        border: "1.5px solid #DCE4FB",
        borderRadius: 16,
        padding: "14px 18px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: "#2A55E5",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 14,
          flex: "0 0 auto",
        }}
      >
        KB
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>Installer Kontorbud som app</div>
        {platform === "ios" ? (
          <div style={{ fontSize: 12, color: "#5B6478", marginTop: 2, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            Tryk <Share size={13} style={{ display: "inline" }} /> og vælg "Føj til hjemmeskærm"
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#5B6478", marginTop: 2 }}>Hurtigere adgang direkte fra din hjemmeskærm.</div>
        )}
      </div>
      {platform === "android" && (
        <button
          onClick={install}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 700,
            padding: "9px 14px",
            borderRadius: 10,
            border: "none",
            background: "#2A55E5",
            color: "#fff",
            cursor: "pointer",
            flex: "0 0 auto",
          }}
        >
          <Download size={13} /> Installer
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Luk"
        style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "transparent", color: "#5B6478", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "0 0 auto" }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
