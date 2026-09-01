# Kontorbud

En rigtig, delt budplatform for administrative opgaver — bygget med Next.js og Postgres.

## Hvad er dette?

En komplet webapp, du kan gøre live på internettet. Alle opgaver og bud gemmes permanent i en rigtig database, og alle der besøger sitet ser samme data.

Der er ikke rigtigt login endnu — man skriver bare et navn, man optræder under. Der er heller ikke betaling indbygget. Se "Næste skridt" nederst for hvordan I bygger det videre.

## Sådan gør du den live (ca. 15-20 minutter, ingen kodning krævet)

### 1. Opret en gratis database hos Neon

1. Gå til [neon.tech](https://neon.tech) og opret en gratis konto.
2. Opret et nyt projekt. Vælg en region tæt på Danmark (f.eks. Frankfurt).
3. Kopiér "Connection string" — den ligner `postgresql://bruger:kodeord@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`.

### 2. Læg koden på GitHub

1. Opret et gratis GitHub-repo (f.eks. `kontorbud`).
2. Upload alle filerne fra denne mappe til repoet (træk-og-slip virker fint på github.com, eller brug `git push` hvis du er vant til det).

### 3. Deploy på Vercel

1. Gå til [vercel.com](https://vercel.com) og log ind med din GitHub-konto.
2. Klik "Add New Project" og vælg dit `kontorbud`-repo.
3. Under "Environment Variables", tilføj:
   - **Name**: `DATABASE_URL`
   - **Value**: connection string'en fra Neon (trin 1)
4. Klik "Deploy". Efter et par minutter får du et live link som `kontorbud.vercel.app`.

### 4. Det er det

Appen opretter selv sine databasetabeller (`tasks` og `bids`), første gang nogen besøger sitet eller kalder et API-endepunkt. Der er ikke flere manuelle trin — åbn bare dit `kontorbud.vercel.app`-link.

(Foretrækker du at oprette tabellerne manuelt på forhånd, ligger `npm run db:init` stadig i projektet og gør præcis det samme.)

### 5. Login (påkrævet variabel)

Kontorbud bruger rigtige konti med email og adgangskode. For at det virker, skal du tilføje en hemmelig nøgle, appen bruger til at signere login-sessioner:

- **Name**: `JWT_SECRET`
- **Value**: en lang, tilfældig streng — mindst 32 tegn. Du kan generere en med f.eks. [1password.com/password-generator](https://1password.com/password-generator) (vælg "Random" og 40+ tegn), eller køre `openssl rand -hex 32` i en terminal, hvis du har det installeret.

Tilføj den under **Environment Variables** i Vercel, ligesom `DATABASE_URL`.

### 6. Eget domæne (valgfrit)

Køb et domæne (f.eks. kontorbud.dk) hos simply.com eller one.com, og tilføj det under dit projekts "Domains" i Vercel. Vercel guider dig igennem DNS-opsætningen.

## Sådan forbinder du email-bekræftelse (Resend)

Kontorbud sender en bekræftelsesmail, når nogen opretter en konto. Det kræver Resend, en mailudbyder med en gratis kvote (100 mails/dag).

1. Gå til [resend.com](https://resend.com) og opret en gratis konto
2. Under "API Keys", opret en ny nøgle og kopiér den
3. Tilføj den i Vercel som `RESEND_API_KEY`

Til at starte med sender Resend automatisk fra `onboarding@resend.dev` — det virker med det samme, uden yderligere opsætning, men mails kan ende i spam hos nogle modtagere. For et mere troværdigt afsenderdomæne (f.eks. `noreply@kontorbud.dk`), skal I under "Domains" hos Resend verificere jeres eget domæne (tilføje et par DNS-poster), og derefter sætte `RESEND_FROM_EMAIL` i Vercel til den nye adresse.

## Sådan forbinder du vedhæftede filer (Vercel Blob)

Kontorbud bruger Vercel Blob til at gemme filer, folk vedhæfter til opgaver og beskeder. Det er markant nemmere end de andre integrationer, fordi det foregår direkte i Vercel:

1. Gå til dit projekt på vercel.com → fanen **"Storage"**
2. Klik **"Create Database"** → vælg **"Blob"**
3. Giv den et navn (f.eks. "kontorbud-filer") og klik **"Create"**
4. Vercel spørger, om den skal forbindes til dit projekt — sig ja

Det er det. Vercel tilføjer selv en `BLOB_READ_WRITE_TOKEN`-miljøvariabel til projektet — du skal ikke kopiere eller indsætte noget nøgle manuelt. Redeploy projektet én gang, så er filuploads aktive.

## Sådan forbinder du kortet (Google Maps)

Kontorbud viser opgavernes placering på et Google Maps-kort med klynge-tal, ligesom Handyhand. Det kræver en Google Cloud-konto med faktureringsoplysninger tilknyttet (også selvom I bliver inden for den gratis kvote).

### 1. Opret et Google Cloud-projekt

Gå til [console.cloud.google.com](https://console.cloud.google.com), opret et nyt projekt (f.eks. "Kontorbud"), og tilknyt en faktureringskonto under "Billing" — det er obligatorisk, men I betaler kun, hvis I overstiger de gratis 10.000 kald om måneden pr. tjeneste.

### 2. Aktivér de nødvendige API'er

Under "APIs & Services" → "Library", søg efter og aktivér:
- **Maps JavaScript API**
- **Geocoding API**

### 3. Opret to nøgler

Under "APIs & Services" → "Credentials" → "Create Credentials" → "API key", opret **to separate nøgler**:

- **Browser-nøgle**: begræns den under "Application restrictions" til "Websites", og tilføj jeres Vercel-domæne (f.eks. `kontorbud-xxxx.vercel.app/*` og evt. jeres eget domæne). Begræns den under "API restrictions" til kun **Maps JavaScript API**.
- **Server-nøgle**: begræns den under "API restrictions" til kun **Geocoding API**. Denne skal ikke have en website-begrænsning, da den kaldes fra serveren, ikke browseren.

### 4. Tilføj nøglerne i Vercel

Under **Environment Variables**, tilføj begge:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — browser-nøglen fra trin 3
- `GOOGLE_MAPS_API_KEY` — server-nøglen fra trin 3

Redeploy projektet bagefter.

## Sådan forbinder du rigtig betaling (Stripe Connect)

Kontorbud bruger Stripe Connect til at holde betalingen, når et bud vælges, og frigive den til hjælperen (minus servicegebyr) når opgaven markeres som udført — præcis som Handyhands "HandyhandPay".

### 1. Opret en Stripe-konto

Gå til [dashboard.stripe.com/register](https://dashboard.stripe.com/register) og opret en konto. Du starter automatisk i **testtilstand** — det er fint til at afprøve hele flowet, uden at rigtige penge bevæger sig.

### 2. Find din hemmelige nøgle

I Stripe Dashboard: **Developers → API keys**. Kopiér **Secret key** (starter med `sk_test_...` i testtilstand).

### 3. Opret en webhook

Kontorbud skal vide, når en betaling er gennemført. Gå til **Developers → Webhooks → Add endpoint**:

- **Endpoint URL**: `https://dit-projekt.vercel.app/api/stripe/webhook`
- **Events to send**: vælg `checkout.session.completed`

Efter oprettelse, kopiér **Signing secret** (starter med `whsec_...`).

### 4. Tilføj nøglerne i Vercel

Under dit projekts **Settings → Environment Variables** i Vercel, tilføj:

- `STRIPE_SECRET_KEY` — din secret key fra trin 2
- `STRIPE_WEBHOOK_SECRET` — din signing secret fra trin 3

Redeploy projektet (Vercel gør det automatisk ved næste push, eller klik "Redeploy" manuelt), så de nye variabler tages i brug.

### 5. Sådan tester du uden rigtige penge

I Stripe testtilstand kan alle hjælpere gennemføre Stripe-onboarding med testdata (Stripe udfylder ofte automatisk). Til selve betalingen, brug Stripes testkort:

- Kortnummer: `4242 4242 4242 4242`
- Udløbsdato: enhver fremtidig dato
- CVC: enhver 3-cifret kode

### 6. Gå live med rigtige betalinger

Når I er klar til rigtige penge: aktivér din Stripe-konto til **Live mode** (kræver virksomhedsoplysninger, CVR-nummer osv.), og udskift de to nøgler i Vercel med jeres live-nøgler (`sk_live_...` og en ny live-webhook med `whsec_...`).

**Vigtigt om ansvar:** Stripe Connect gør jer teknisk set til en betalingsformidler for jeres brugere. Læs Stripes vilkår for platforme/marketplaces, og overvej at få gennemgået jeres egne forretningsbetingelser af en, der kan rådgive juridisk om det — det er uden for hvad jeg kan hjælpe med.

## Kør det lokalt (til udvikling)

```bash
npm install
cp .env.example .env.local
# indsæt din Neon connection string i .env.local
npm run db:init
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000).

## Teknisk opbygning

- **Next.js 14** (App Router) — frontend og API-routes i samme projekt
- **Postgres** via `pg` — al data (opgaver, bud) gemmes permanent
- Ingen ORM — rå SQL-forespørgsler i `app/api/**/route.js`, nemt at læse og ændre
- Navn gemmes i browserens `localStorage` som en simpel identitet (ikke rigtigt login)

## Næste skridt, hvis I vil gøre det til en rigtig platform

- **Rigtigt login**: tilføj f.eks. [Auth.js](https://authjs.dev) med email eller MitID-lignende verificering
- **Betaling**: integrér Stripe eller MobilePay, så penge holdes i "escrow" til opgaven er løst
- **Notifikationer**: send email, når nogen byder på en opgave (f.eks. via Resend)
- **Anmeldelser**: udvid `bids`-tabellen med en `rating`-kolonne, brugerne udfylder efter opgaven er løst

Sig til, hvis du vil have hjælp til at bygge nogen af disse dele.
