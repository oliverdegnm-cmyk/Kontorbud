export const metadata = {
  title: "Privatlivspolitik - Kontorbud",
  description: "Sådan behandler Kontorbud dine personoplysninger.",
  alternates: { canonical: "https://kontorbud.dk/privatliv" },
};

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: 13.5, color: "#333", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ marginTop: 24, marginBottom: 60, maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Privatlivspolitik</h1>
      <p style={{ fontSize: 12.5, color: "#5B6478", marginBottom: 8 }}>Senest opdateret: [dato]</p>
      <div style={{ background: "#FFF1E0", border: "1.5px solid #F5D9AE", borderRadius: 12, padding: "14px 18px", marginBottom: 28, fontSize: 12.5, color: "#B5610E" }}>
        <b>Bemærk:</b> Dette er et udkast, som endnu ikke er juridisk gennemgået. Felter i [firkantede parenteser] skal udfyldes med jeres konkrete virksomhedsoplysninger, før dokumentet tages i brug.
      </div>

      <Section title="1. Dataansvarlig">
        <p>
          [Firmanavn / dit fulde navn], [CVR-nummer, hvis relevant], [adresse], er dataansvarlig for behandlingen af personoplysninger på kontorbud.dk. Ved spørgsmål kan du kontakte os via <a href="/kontakt" style={{ color: "#2A55E5", fontWeight: 700 }}>kontaktformularen</a>.
        </p>
      </Section>

      <Section title="2. Hvilke oplysninger indsamler vi">
        <p>
          Vi indsamler de oplysninger, du selv angiver ved oprettelse af en konto og brug af platformen: navn, email, telefonnummer (valgfrit), profiloplysninger (bio, kompetencer, evt. hjemmeside og CV), oplysninger om oprettede Opgaver og afgivne Bud, samt beskeder sendt via platformens beskedfunktion. Vi indsamler ikke selv dine betalingskortoplysninger - de håndteres direkte af Stripe, se punkt 4.
        </p>
      </Section>

      <Section title="3. Formål med behandlingen">
        <p>
          Vi behandler dine oplysninger for at kunne levere platformens funktioner: oprette og administrere din konto, formidle kontakt mellem Opgavestillere og Hjælpere, håndtere betaling og udbetaling, sende relevante notifikationer (kan slås fra under Indstillinger), og yde kundeservice.
        </p>
      </Section>

      <Section title="4. Videregivelse af oplysninger til tredjeparter">
        <p>Vi bruger følgende databehandlere til at drive platformen:</p>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li><b>Stripe</b> - behandler betalinger og udbetalinger. Stripe modtager de oplysninger, der er nødvendige for at gennemføre en betaling, herunder betalingskortoplysninger, som Kontorbud ikke selv har adgang til.</li>
          <li><b>Google Maps</b> - bruges til at vise Opgavers omtrentlige placering på et kort, baseret på det område, du selv angiver.</li>
          <li><b>Resend</b> - sender transaktionelle emails (f.eks. bekræftelse af konto, nulstilling af adgangskode, notifikationer).</li>
          <li><b>Vercel</b> - hoster platformen og den tilhørende database.</li>
        </ul>
      </Section>

      <Section title="5. Opbevaring">
        <p>
          Vi opbevarer dine oplysninger, så længe du har en aktiv konto. Ved sletning af din konto sletter eller anonymiserer vi dine personoplysninger, medmindre vi er forpligtet til at opbevare visse oplysninger længere af hensyn til bogføringslovgivningen eller anden lovgivning.
        </p>
      </Section>

      <Section title="6. Dine rettigheder">
        <p>
          Du har efter databeskyttelsesforordningen (GDPR) ret til at få indsigt i, berigtiget, slettet eller udleveret (dataportabilitet) dine personoplysninger, samt ret til at gøre indsigelse mod behandlingen. Kontakt os via <a href="/kontakt" style={{ color: "#2A55E5", fontWeight: 700 }}>kontaktformularen</a> for at gøre brug af dine rettigheder. Du kan også klage til Datatilsynet (datatilsynet.dk).
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          Platformen bruger én nødvendig cookie til at holde dig logget ind (en session-cookie). Denne cookie er teknisk nødvendig for platformens funktion og kræver ikke samtykke efter cookiebekendtgørelsen.
        </p>
      </Section>

      <Section title="8. Sikkerhed">
        <p>Vi anvender tekniske og organisatoriske foranstaltninger for at beskytte dine oplysninger, herunder kryptering af adgangskoder og sikker overførsel af data (HTTPS).</p>
      </Section>

      <Section title="9. Ændringer">
        <p>Vi kan opdatere denne privatlivspolitik løbende. Væsentlige ændringer vil blive meddelt via email eller på platformen.</p>
      </Section>
    </div>
  );
}
