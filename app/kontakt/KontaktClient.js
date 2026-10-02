"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useName } from "@/lib/NameContext";
import { Mail, CheckCircle2, ShieldAlert } from "lucide-react";
import MessageThread from "@/components/MessageThread";

// 3/10: to kundeservicemedarbejdere vises nu under kontaktfotoet (tidligere kun
// Josefine). Ingen af dem er længere markeret som "Ansvarlig" - begge har
// samme titel, efter ønske fra Oliver. Navn/titel er bevidst hardcoded her
// (ligesom før for Josefine), mens selve fotoet pr. person kan
// uploades/justeres uafhængigt i admin-panelet (se ImagesTab i app/admin/page.js).
const STAFF = [
  {
    key: "foto1",
    name: "Josefine Mortensen",
    title: "Kundeservice Medarbejder",
    alt: "Josefine Mortensen, Kundeservice Medarbejder hos Kontorbud",
  },
  {
    key: "foto2",
    name: "Anna Minaei",
    title: "Kundeservice Medarbejder",
    alt: "Anna Minaei, Kundeservice Medarbejder hos Kontorbud",
  },
];

export default function ContactClient({ initialKontaktFotos }) {
  const { name, email: accountEmail } = useName();
  const searchParams = useSearchParams();
  const isReport = searchParams.get("type") === "report";
  const [contactName, setContactName] = useState(name || "");
  const [contactEmail, setContactEmail] = useState(accountEmail || "");
  const [message, setMessage] = useState(searchParams.get("message") || "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  // Kommer allerede fra serveren via page.js (ingen client-side fetch), så
  // billederne er korrekte fra første render - undgår at de først viser
  // standardbillederne og derefter "blinker" til de rigtige, uploadede fotos.
  const [kontaktFotos] = useState(
    initialKontaktFotos || {
      foto1: { url: "/kontakt-foto.jpg", position: 50, zoom: 100 },
      foto2: { url: "/kontakt-foto-anna.jpg", position: 50, zoom: 100 },
    }
  );

  async function submit() {
    if (!contactName.trim() || !contactEmail.trim() || !message.trim()) {
      setError("Udfyld navn, email og en besked.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: contactName, email: contactEmail, message }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.error) {
      setError(data.error);
      return;
    }
    setDone(true);
  }

  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <div style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {isReport ? <ShieldAlert size={20} color="#C0392B" /> : <Mail size={20} color="#2A55E5" />}
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>{isReport ? "Rapportér mistænkelig aktivitet" : "Kontakt kundeservice"}</h2>
        </div>
        {isReport && (
          <div style={{ background: "#FDECEC", border: "1.5px solid #F5C6C6", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#8A2E2E", lineHeight: 1.55 }}>
            Føler du dig snydt, eller virker noget mistænkeligt ved en opgave eller en bruger? Beskriv det herunder - vi tager alle henvendelser om mistanke om svindel alvorligt og kigger på dem hurtigst muligt.
          </div>
        )}
        <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 6 }}>
          Har du et spørgsmål, et problem med en opgave, eller brug for hjælp til noget andet? Skriv til os herunder.
        </p>
        <p style={{ color: "#5B6478", fontSize: 13, marginBottom: 24 }}>🇩🇰 Dansk kundeservice - vi svarer på dansk, hurtigst muligt.</p>
      </div>

      <div className="kb-grid-detail" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 32, alignItems: "start" }}>
        <div style={{ maxWidth: 560, background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 30 }}>
          {name ? (
            // Logget ind: beskeden går direkte ind i den rigtige support-samtale
            // (samme tråd/endpoint som app/beskeder/support/page.js og admin-panelets
            // Support-fane) - fremfor kun at sende en email. Det betyder beskeden med
            // det samme dukker op under "Beskeder" i menuen, at alle administratorer får
            // en almindelig in-app-notifikation, og at administratoren kan svare direkte
            // her (samtalen opdaterer sig selv), i stedet for kun at kunne besvare en email.
            // Rettet 28/9, se status-dokumentet: den gamle rene email-formular gav ikke
            // brugeren nogen synlig tråd og gav ikke administratorer nogen notifikation.
            <MessageThread endpoint="/api/messages/support" bidderName={name} currentName={name} placeholder="Skriv til support…" maxHeight={380} />
          ) : done ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle2 size={36} color="#1AA37A" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Tak for din besked</div>
              <p style={{ fontSize: 13.5, color: "#5B6478" }}>Vi vender tilbage til dig hurtigst muligt.</p>
            </div>
          ) : (
            <>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Navn</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginBottom: 16 }}
              />
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginBottom: 16 }}
              />
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Besked</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Beskriv hvad vi kan hjælpe med."
                style={{ width: "100%", minHeight: 130, fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", resize: "vertical" }}
              />
              <button
                onClick={submit}
                disabled={submitting}
                style={{ marginTop: 18, fontSize: 14.5, fontWeight: 700, padding: "12px 24px", borderRadius: 12, border: "none", background: "#2A55E5", color: "#fff", cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "Sender…" : "Send besked"}
              </button>
              {error && (
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>
                  {error}
                </div>
              )}
              <p style={{ marginTop: 16, fontSize: 12, color: "#9AA2B1" }}>
                <Link href="/login" style={{ color: "#2A55E5", fontWeight: 700 }}>Log ind</Link> for at skrive direkte til support og se svaret her på siden, i stedet for kun via email.
              </p>
            </>
          )}
        </div>

        {!isReport && (
          // 3/10: to medarbejdere side om side i stedet for én - boksen er stadig i alt
          // 230px bred (110 + 10 gap + 110), så den samlede kolonne fylder det samme som før.
          <div className="kb-hide-mobile" style={{ display: "flex", gap: 10, width: 230 }}>
            {STAFF.map((person) => {
              const foto = kontaktFotos[person.key] || { url: "/kontakt-foto.jpg", position: 50, zoom: 100 };
              return (
                <div key={person.key} style={{ width: 110 }}>
                  <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#F5F7FB", width: 110, height: 210 }}>
                    <Image
                      src={foto.url}
                      alt={person.alt}
                      fill
                      quality={90}
                      // Samme grund som i HomeClient.js: boksen er 110px, men zoom-funktionen i
                      // admin-panelet kan forstørre billedet op til 200% via CSS - "sizes" skal
                      // afspejle den maksimale forstørrelse, ellers henter next/image en for lille
                      // kilde og opskalerer den selv, hvilket giver et sløret/pixeleret resultat.
                      sizes="220px"
                      style={{
                        objectFit: "cover",
                        objectPosition: `center ${foto.position}%`,
                        transform: `scale(${foto.zoom / 100})`,
                        transformOrigin: "center",
                      }}
                    />
                  </div>
                  {/* 2/10 (nu 3/10): navn + titel under kontaktfotoet, efter ønske fra Oliver. */}
                  <div style={{ marginTop: 10, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#14213D" }}>{person.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#5B6478" }}>{person.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
