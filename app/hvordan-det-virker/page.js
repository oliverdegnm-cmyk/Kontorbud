"use client";

import Link from "next/link";
import { FileText, Users, CreditCard, CheckCircle2, UserPlus, Search, Trophy, Wallet, ShieldCheck, MessageCircle, Star } from "lucide-react";

function StepCard({ icon: Icon, num, title, children }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 18, padding: 22, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          fontSize: 26,
          fontWeight: 800,
          color: "#EEF2FF",
        }}
      >
        {num}
      </div>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: "#EEF2FF",
          color: "#2A55E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 13, color: "#5B6478", lineHeight: 1.55, margin: 0 }}>{children}</p>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <div style={{ position: "relative", marginBottom: 44 }}>
        <img
          src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1400&auto=format&fit=crop&q=70"
          alt="Samarbejde om en opgave"
          style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 28, display: "block" }}
        />
        <div
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: 24,
            padding: "36px 40px",
            margin: "-56px 20px 0",
            textAlign: "center",
            boxShadow: "0 24px 48px -24px rgba(20,33,61,.25)",
          }}
        >
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>Sådan fungerer Kontorbud</h1>
          <p style={{ fontSize: 15, color: "#5B6478", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
            Beskriv din opgave, få tilbud, vælg den rette hjælper. Betal først, når du er tilfreds.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 52 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800 }}>Har du en opgave?</h2>
          <span style={{ fontSize: 12.5, color: "#5B6478" }}>Gratis at oprette</span>
        </div>
        <div className="kb-grid-steps4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <StepCard icon={FileText} num="1" title="Opret opgaven">
            Beskriv hvad du har brug for, sæt budget og frist. Vedhæft gerne filer, bydere skal kende til.
          </StepCard>
          <StepCard icon={Users} num="2" title="Modtag bud">
            Se hjælpernes niveau, anmeldelser og pris — og vælg den, der passer bedst.
          </StepCard>
          <StepCard icon={CreditCard} num="3" title="Betal sikkert">
            Betalingen holdes af platformen, indtil du er tilfreds — den går ikke direkte til hjælperen med det samme.
          </StepCard>
          <StepCard icon={CheckCircle2} num="4" title="Marker som udført">
            Frigiv betalingen, når opgaven er løst, og giv gerne en anmeldelse bagefter.
          </StepCard>
        </div>
      </div>

      <div style={{ marginBottom: 52 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800 }}>Vil du byde og tjene penge?</h2>
          <span style={{ fontSize: 12.5, color: "#5B6478" }}>Gebyr fra 10,2%</span>
        </div>
        <div className="kb-grid-steps4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <StepCard icon={UserPlus} num="1" title="Opret profil">
            Skriv om dine kompetencer og evt. et CV, så opgavestillere kan se, hvad du kan.
          </StepCard>
          <StepCard icon={Search} num="2" title="Byd på opgaver">
            Gennemse åbne opgaver efter kategori eller område, og send dit bud.
          </StepCard>
          <StepCard icon={Trophy} num="3" title="Bliv valgt">
            Vinder du buddet, ved du med det samme — betalingen er allerede sikret hos platformen.
          </StepCard>
          <StepCard icon={Wallet} num="4" title="Få udbetalt">
            Pengene udbetales automatisk, når opgaven er markeret udført — minus et gebyr, der falder jo mere du bruger platformen.
          </StepCard>
        </div>
      </div>

      <div style={{ background: "#F5F7FB", borderRadius: 20, padding: "32px 36px", marginBottom: 48 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 22, textAlign: "center" }}>Tryghed hele vejen</h2>
        <div className="kb-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
          <div style={{ textAlign: "center" }}>
            <ShieldCheck size={22} color="#2A55E5" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Betaling holdes sikkert</div>
            <p style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.55, margin: 0 }}>
              Pengene frigives først, når du selv markerer opgaven som udført.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <MessageCircle size={22} color="#2A55E5" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Al kontakt på siden</div>
            <p style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.55, margin: 0 }}>
              I skriver sammen direkte på opgaven — ingen grund til at bytte private numre.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Star size={22} color="#2A55E5" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Anmeldelser begge veje</div>
            <p style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.55, margin: 0 }}>
              Efter en opgave giver I hinanden stjerner, så tilliden bygges over tid.
            </p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link
          href="/opret"
          style={{ display: "inline-block", fontSize: 14.5, fontWeight: 700, padding: "13px 26px", borderRadius: 12, background: "#2A55E5", color: "#fff", marginRight: 12 }}
        >
          Opret en opgave
        </Link>
        <Link
          href="/"
          style={{ display: "inline-block", fontSize: 14.5, fontWeight: 700, padding: "13px 26px", borderRadius: 12, border: "1.5px solid #E4E8F0", color: "#14213D" }}
        >
          Se åbne opgaver
        </Link>
      </div>
    </div>
  );
}
