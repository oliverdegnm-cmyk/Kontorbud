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

### 5. Eget domæne (valgfrit)

Køb et domæne (f.eks. kontorbud.dk) hos simply.com eller one.com, og tilføj det under dit projekts "Domains" i Vercel. Vercel guider dig igennem DNS-opsætningen.

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
