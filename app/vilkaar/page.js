export const metadata = {
  title: "Vilkår og betingelser - Kontorbud",
  description: "Vilkår og betingelser for brug af Kontorbud.",
  alternates: { canonical: "https://kontorbud.dk/vilkaar" },
};

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: 13.5, color: "#333", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div style={{ marginTop: 24, marginBottom: 60, maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Vilkår og betingelser</h1>
      <p style={{ fontSize: 12.5, color: "#5B6478", marginBottom: 8 }}>Senest opdateret: [dato]</p>
      <div style={{ background: "#FFF1E0", border: "1.5px solid #F5D9AE", borderRadius: 12, padding: "14px 18px", marginBottom: 28, fontSize: 12.5, color: "#B5610E" }}>
        <b>Bemærk:</b> Dette er et udkast, som endnu ikke er juridisk gennemgået. Felter i [firkantede parenteser] skal udfyldes med jeres konkrete virksomhedsoplysninger, før dokumentet tages i brug.
      </div>

      <Section title="1. Om Kontorbud">
        <p>
          Kontorbud er en dansk platform, der formidler kontakt mellem brugere, der har behov for hjælp til kontoropgaver ("Opgavestillere"), og brugere, der tilbyder at udføre sådanne opgaver mod betaling ("Hjælpere"). Platformen drives af [firmanavn / dit fulde navn], [CVR-nummer, hvis relevant], [adresse].
        </p>
      </Section>

      <Section title="2. Definitioner">
        <p>
          "Opgave" betyder en arbejdsopgave oprettet af en Opgavestiller på platformen. "Bud" betyder et tilbud fra en Hjælper om at udføre en Opgave til en angivet pris. "Platformen" betyder hjemmesiden kontorbud.dk og de tilhørende funktioner.
        </p>
      </Section>

      <Section title="3. Oprettelse af konto">
        <p>
          Du skal være mindst 18 år for at oprette en konto. Du er ansvarlig for, at de oplysninger, du angiver, er korrekte, og for at holde din adgangskode fortrolig. Du er ansvarlig for al aktivitet, der sker via din konto.
        </p>
      </Section>

      <Section title="4. Sådan fungerer platformen">
        <p>
          En Opgavestiller opretter en Opgave med en beskrivelse, et budget og en frist. Hjælpere kan afgive Bud på åbne Opgaver. Opgavestilleren vælger et Bud og gennemfører betaling via platformens betalingsløsning (Stripe). Betalingen holdes af platformen, indtil Opgavestilleren markerer Opgaven som udført, hvorefter beløbet - fratrukket platformens gebyr - udbetales til Hjælperen.
        </p>
      </Section>

      <Section title="5. Betaling og gebyrer">
        <p>
          Betalinger håndteres af Stripe. Platformen opkræver et gebyr af Hjælperens indtjening, der afhænger af Hjælperens niveau: Standard (20%), Sølv (16%), Guld (12,8%) og Platin (10,2%). Niveauet fastsættes ud fra Hjælperens aktivitet og udførelsesrate på platformen. Det er gratis for Opgavestillere at oprette Opgaver og afgive Bud koster ikke noget for Hjælpere.
        </p>
      </Section>

      <Section title="6. Platformens rolle og ansvarsbegrænsning">
        <p>
          Kontorbud er alene en formidler af kontakt mellem Opgavestillere og Hjælpere. Aftalen om udførelse af en Opgave indgås direkte mellem disse to parter. Kontorbud er ikke part i denne aftale og påtager sig intet ansvar for kvaliteten, lovligheden eller udførelsen af en Opgave. Kontorbud fører ikke kontrol med Hjælperes kvalifikationer ud over det, der fremgår af deres profil og eventuelle anmeldelser.
        </p>
      </Section>

      <Section title="7. Annullering og tvister">
        <p>
          En Opgave kan annulleres, før den er markeret som udført, hvorved en eventuel holdt betaling refunderes til Opgavestilleren. Opstår der uenighed mellem en Opgavestiller og en Hjælper, opfordres parterne til først at søge at løse denne indbyrdes. Kontorbud kan i særlige tilfælde bistå via kundeservice, men er ikke forpligtet til at afgøre tvister mellem brugere.
        </p>
      </Section>

      <Section title="8. Brugerens forpligtelser">
        <p>
          Du må ikke bruge platformen til ulovlige formål, til at omgå platformens gebyrer ved at aftale betaling uden for platformen for en Opgave oprettet på platformen, eller til at chikanere andre brugere. Kontorbud forbeholder sig retten til at lukke konti, der overtræder disse vilkår.
        </p>
      </Section>

      <Section title="9. Opsigelse">
        <p>Du kan til enhver tid lukke din konto ved at kontakte kundeservice. Kontorbud kan opsige eller suspendere en konto ved overtrædelse af disse vilkår.</p>
      </Section>

      <Section title="10. Ændringer af vilkårene">
        <p>Kontorbud kan opdatere disse vilkår løbende. Væsentlige ændringer vil blive meddelt brugere, f.eks. via email.</p>
      </Section>

      <Section title="11. Lovvalg og værneting">
        <p>Disse vilkår er underlagt dansk ret. Eventuelle tvister afgøres ved de danske domstole.</p>
      </Section>

      <Section title="12. Kontakt">
        <p>
          Spørgsmål til disse vilkår kan rettes via <a href="/kontakt" style={{ color: "#2A55E5", fontWeight: 700 }}>kontaktformularen</a>.
        </p>
      </Section>
    </div>
  );
}
