"use client";

import Link from "next/link";
import { FileText, Users, CreditCard, CheckCircle2, UserPlus, Search, Trophy, Wallet, ShieldCheck, MessageCircle, Star } from "lucide-react";

function Step({ icon: Icon, num, title, children }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#EEF2FF",
            color: "#2A55E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={19} />
        </div>
      </div>
      <div style={{ paddingBottom: 28 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#2A55E5", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
          Trin {num}
        </div>
        <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 6 }}>{title}</div>
        <p style={{ fontSize: 13.5, color: "#5B6478", lineHeight: 1.65, margin: 0, maxWidth: 440 }}>{children}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <div
        style={{
          background: "linear-gradient(180deg, #EEF2FF 0%, #fff 100%)",
          borderRadius: 28,
          padding: "44px 40px",
          marginBottom: 48,
        }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, maxWidth: 560 }}>Sådan fungerer Kontorbud</h1>
        <p style={{ fontSize: 15, color: "#5B6478", lineHeight: 1.65, maxWidth: 560, margin: 0 }}>
          Uanset om du skal have løst en administrativ opgave, eller du selv vil byde og tjene penge på dine kompetencer, er hele forløbet designet til at foregå trygt og gennemsigtigt — fra opslag til udbetaling.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 56 }}>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 24 }}>Hvis du skal have løst en opgave</h2>
          <Step icon={FileText} num="1" title="Opret din opgave">
            Beskriv hvad du har brug for hjælp til, sæt et budget og en frist. Du kan vedhæfte filer, f.eks. et regneark eller et dokument, bydere skal kende til.
          </Step>
          <Step icon={Users} num="2" title="Modtag bud">
            Kvalificerede hjælpere byder på opgaven med deres pris og et par ord om sig selv. Du kan se deres niveau, anmeldelser og tidligere opgaver, før du vælger.
          </Step>
          <Step icon={CreditCard} num="3" title="Vælg og betal">
            Når du vælger et bud, betaler du med det samme — men pengene holdes af platformen, ikke udbetalt til hjælperen endnu.
          </Step>
          <Step icon={CheckCircle2} num="4" title="Marker som udført">
            Når opgaven er løst til din tilfredshed, markerer du den som udført. Først da frigives betalingen til hjælperen. I kan aftale detaljer undervejs i beskeder direkte på opgaven.
          </Step>
        </div>

        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 24 }}>Hvis du vil byde og tjene penge</h2>
          <Step icon={UserPlus} num="1" title="Opret din profil">
            Skriv om dig selv, dine kompetencer og evt. et CV eller portfolio, så opgavestillere kan se, hvad du kan.
          </Step>
          <Step icon={Search} num="2" title="Find en opgave">
            Gennemse åbne opgaver efter kategori, område eller søgning, og byd med din pris og en kort besked.
          </Step>
          <Step icon={Trophy} num="3" title="Bliv valgt">
            Vinder du buddet, får du besked med det samme. Betalingen er allerede sikret hos platformen, så du ved, pengene er der.
          </Step>
          <Step icon={Wallet} num="4" title="Få udbetalt">
            Når opgaven er markeret som udført, udbetales pengene automatisk til din konto — minus et servicegebyr, der falder jo mere du bruger platformen.
          </Step>
        </div>
      </div>

      <div style={{ background: "#F5F7FB", borderRadius: 20, padding: 32, marginBottom: 48 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 20 }}>Tryghed undervejs</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          <div>
            <ShieldCheck size={20} color="#2A55E5" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Betaling holdes sikkert</div>
            <p style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.55, margin: 0 }}>
              Pengene frigives først, når du selv markerer opgaven som udført.
            </p>
          </div>
          <div>
            <MessageCircle size={20} color="#2A55E5" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Al kontakt på siden</div>
            <p style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.55, margin: 0 }}>
              I skriver sammen direkte på opgaven — ingen grund til at bytte private numre.
            </p>
          </div>
          <div>
            <Star size={20} color="#2A55E5" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Anmeldelser begge veje</div>
            <p style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.55, margin: 0 }}>
              Efter en opgave kan begge parter give hinanden stjerner, så tilliden bygges over tid.
            </p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link
          href="/opret"
          style={{
            display: "inline-block",
            fontSize: 14.5,
            fontWeight: 700,
            padding: "13px 26px",
            borderRadius: 12,
            background: "#2A55E5",
            color: "#fff",
            marginRight: 12,
          }}
        >
          Opret en opgave
        </Link>
        <Link
          href="/"
          style={{
            display: "inline-block",
            fontSize: 14.5,
            fontWeight: 700,
            padding: "13px 26px",
            borderRadius: 12,
            border: "1.5px solid #E4E8F0",
            color: "#14213D",
          }}
        >
          Se åbne opgaver
        </Link>
      </div>
    </div>
  );
}
