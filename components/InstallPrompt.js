"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone, Share, X } from "lucide-react";

// 1/10 (opfølgning på PWA-gennemgangen tidligere samme dag): gør det nemmere
// for besøgende selv at opdage "tilføj til hjemmeskærm", i stedet for at de
// skal vide det findes. To meget forskellige platforme, derfor to grene:
// - Android/Chrome understøtter faktisk et rigtigt, programmatisk install-flow
//   (browseren affyrer et "beforeinstallprompt"-event, som vi kan gemme og
//   selv udløse via et knaptryk, der viser browserens EGEN install-dialog).
// - iOS Safari tillader IKKE dette (Apples egen begrænsning, ingen kode kan
//   omgå det - se status-dokumentet) - der viser vi i stedet en tydelig,
//   visuel vejledning til det manuelle Del-ikon-flow, så brugeren ikke selv
//   skal vide/huske at det findes.
// Banneret er bevidst tilbageholdent: kun mobil, kun hvis sitet ikke allerede
// kører som installeret app, venter på at cookie-banneret er afgjort (så de
// to ikke kolliderer forneden på skærmen), og husker et "ikke nu"/"forstået"
// i 14 dage via localStorage i stedet for at vise sig hver gang.

const DISMISS_KEY = "kb_install_dismissed_at";
const DISMISS_DAYS = 14;

function isStandaloneDisplay() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isDismissedRecently() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const days = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
    return days < DISMISS_DAYS;
  } catch {
    return false;
  }
}

function cookieBannerAcknowledged() {
  try {
    return !!(localStorage.getItem("kb_cookie_ack") || localStorage.getItem("kb_cookie_consent"));
  } catch {
    return true;
  }
}

export default function InstallPrompt({ siteName }) {
  const [platform, setPlatform] = useState(null); // "android" | "ios"
  const [visible, setVisible] = useState(false);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    if (isStandaloneDisplay() || isDismissedRecently()) return;
    if (window.innerWidth > 760) return;

    let revealTimer = null;
    function reveal(nextPlatform) {
      let tries = 0;
      const check = () => {
        if (cookieBannerAcknowledged() || tries > 20) {
          setPlatform(nextPlatform);
          setVisible(true);
        } else {
          tries += 1;
          revealTimer = setTimeout(check, 1000);
        }
      };
      check();
    }

    function onBeforeInstall(e) {
      e.preventDefault();
      deferredPromptRef.current = e;
      reveal("android");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    function onInstalled() {
      setVisible(false);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // ignorer - localStorage kan være utilgængelig (privat browsing m.m.)
      }
    }
    window.addEventListener("appinstalled", onInstalled);

    const ua = window.navigator.userAgent || "";
    const isIOS = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
    if (isIOS && isSafari) reveal("ios");

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignorer
    }
  }

  async function installNow() {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) return;
    promptEvent.prompt();
    try {
      await promptEvent.userChoice;
    } catch {
      // ignorer - brugeren lukkede evt. dialogen uden at vælge
    }
    deferredPromptRef.current = null;
    setVisible(false);
  }

  if (!visible) return null;

  const primaryBtn = { fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, border: "none", background: "#2A55E5", color: "#fff", cursor: "pointer", flex: "0 0 auto" };
  const secondaryBtn = { fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", cursor: "pointer", flex: "0 0 auto" };

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 99,
        maxWidth: 420,
        margin: "0 auto",
        background: "#14213D",
        color: "#fff",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 12px 32px rgba(0,0,0,.25)",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Smartphone size={18} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>Føj {siteName} til din hjemmeskærm</p>
        {platform === "ios" ? (
          <p style={{ margin: "4px 0 10px", fontSize: 12, lineHeight: 1.55, color: "#D6DCEC" }}>
            Tryk på <Share size={12} style={{ verticalAlign: "-1px", margin: "0 2px" }} /> Del-ikonet nederst i Safari, og vælg "Føj til hjemmeskærm".
          </p>
        ) : (
          <p style={{ margin: "4px 0 10px", fontSize: 12, lineHeight: 1.55, color: "#D6DCEC" }}>
            Få hurtig adgang direkte fra din hjemmeskærm, uden at skulle åbne browseren først.
          </p>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {platform === "android" && (
            <button onClick={installNow} style={primaryBtn}>
              Installer
            </button>
          )}
          <button onClick={dismiss} style={platform === "android" ? secondaryBtn : primaryBtn}>
            {platform === "android" ? "Ikke nu" : "Forstået"}
          </button>
        </div>
      </div>
      <button onClick={dismiss} aria-label="Luk" style={{ background: "none", border: "none", color: "#9AA2B1", cursor: "pointer", padding: 2, flexShrink: 0 }}>
        <X size={16} />
      </button>
    </div>
  );
}
