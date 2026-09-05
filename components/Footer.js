import Link from "next/link";
import { CATS } from "@/lib/categories";

const POPULAR = ["Bogføring & regnskab", "Kundeservice & support", "Grafisk design", "AI-opgaver", "Hjemmeside & IT"];

export default function Footer() {
  return (
    <footer style={{ background: "#14213D", borderRadius: 24, padding: "40px 36px", margin: "60px 0 24px", color: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 32 }} className="kb-grid-3">
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Kontorbud</div>
          <p style={{ fontSize: 13, color: "#B7C0DA", lineHeight: 1.65, maxWidth: 320 }}>
            Kontorbud er en dansk platform, hvor du kan finde hjælp til kontoropgaver af enhver slags, eller selv byde og tjene penge på det, du er god til.
          </p>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B7C0DA", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>
            Udforsk
          </div>
          <FooterLink href="/opgaver">Opgaver</FooterLink>
          <FooterLink href="/opret">Opret opgave</FooterLink>
          <FooterLink href="/hvordan-det-virker">Hvordan fungerer det?</FooterLink>
          <FooterLink href="/kontakt">Kontakt</FooterLink>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B7C0DA", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>
            Populære kategorier
          </div>
          {POPULAR.map((name) => (
            <FooterLink key={name} href={`/opret?category=${encodeURIComponent(name)}`}>
              {name}
            </FooterLink>
          ))}
          <FooterLink href="/opgaver">Alle kategorier</FooterLink>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 32, paddingTop: 20, fontSize: 12, color: "#8A93B0", textAlign: "center" }}>
        © {new Date().getFullYear()} Kontorbud
      </div>
    </footer>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} style={{ display: "block", fontSize: 13, color: "#D6DCEC", marginBottom: 10 }}>
      {children}
    </Link>
  );
}
