export const FAQ_SECTIONS = [
  {
    title: "Kom i gang",
    items: [
      {
        q: "Er det gratis at bruge AIbud?",
        a: "Ja, det er helt gratis at oprette en opgave og modtage bud. Som opgavestiller betaler du kun den pris, du selv accepterer fra en hjælper. Som hjælper betaler du et gebyr af det, du tjener - se mere under \"Betaling\" nedenfor.",
      },
      {
        q: "Skal jeg oprette en konto for at se opgaver?",
        a: "Nej, du kan browse åbne opgaver og kategorier uden at oprette dig. Du skal først oprette en konto, når du vil oprette en opgave, byde, eller sende en besked.",
      },
      {
        q: "Kan jeg logge ind med Google eller Facebook?",
        a: "Ja, du kan oprette og logge ind på din konto med enten Google eller Facebook, i stedet for at oprette en adgangskode manuelt.",
      },
      {
        q: "Kan jeg både oprette opgaver og byde på opgaver med samme konto?",
        a: "Ja. Der er ingen adskillelse mellem \"opgavestiller\" og \"hjælper\" som kontotype - du kan gøre begge dele med samme profil, alt efter hvad du har brug for fra gang til gang.",
      },
      {
        q: "Skal jeg selv have erfaring med AI for at oprette en opgave?",
        a: "Nej, slet ikke. Du skal blot beskrive, hvad du gerne vil have løst - f.eks. \"jeg vil gerne have en chatbot til min hjemmeside\". Det er hjælperne, der har den tekniske AI-erfaring, ikke dig.",
      },
      {
        q: "Hvilken slags AI-opgaver kan jeg få hjælp til?",
        a: "Alt fra prompt-engineering og automatisering til chatbots, AI-genereret tekst og billeder, dataanalyse, machine learning og AI-strategi. Se de fulde kategorier på forsiden for et overblik.",
      },
      {
        q: "Kan jeg bruge AIbud, hvis jeg bare vil lære at bruge AI - ikke få lavet noget konkret?",
        a: "Ja, det er lige så meget formålet med AIbud som at få løst en konkret opgave. Under kategorien \"Undervisning i AI-værktøjer\" kan du oprette en opgave, hvor du beder om at blive undervist eller sat ind i AI's muligheder - individuelt eller for et helt team - og modtage bud fra hjælpere, der kan lære dig det.",
      },
    ],
  },
  {
    title: "Opret en opgave",
    items: [
      {
        q: "Hvordan opretter jeg en opgave?",
        a: "Skriv en kort titel i feltet på forsiden, eller gå til \"Opret opgave\". Vi finder automatisk den rette kategori ud fra titlen, men du kan altid ændre den selv. Udfyld budget, frist og en beskrivelse, og opgaven er straks synlig for hjælpere.",
      },
      {
        q: "Skal jeg selv kende prisen på forhånd?",
        a: "Nej. Du kan angive et vejledende budget, men det er helt op til hjælperne at byde det, de mener, opgaven er værd - du vælger frit blandt de bud, du modtager.",
      },
      {
        q: "Kan jeg redigere en opgave, efter jeg har oprettet den?",
        a: "Ja, så længe opgaven stadig er åben og ikke har fået et bud accepteret. Har du allerede valgt en hjælper, kan opgaven ikke længere redigeres.",
      },
      {
        q: "Skal opgaven løses eksternt, eller kan jeg kræve personligt fremmøde?",
        a: "Begge dele er muligt. Ved oprettelse vælger du \"Eksternt\" eller \"Personligt fremmøde\". Vælger du personligt fremmøde, angiver du en adresse - den vises dog kun til den hjælper, hvis bud du rent faktisk vælger, ikke offentligt.",
      },
      {
        q: "Kan jeg annullere en opgave?",
        a: "Ja, så længe den ikke er markeret som udført. Har du allerede valgt et bud og betalt, bliver beløbet automatisk refunderet ved annullering.",
      },
    ],
  },
  {
    title: "Byd på en opgave",
    items: [
      {
        q: "Koster det noget at byde på en opgave?",
        a: "Nej, det er gratis at afgive bud. Du betaler først et gebyr, hvis dit bud bliver valgt, og du rent faktisk får udbetalt penge for opgaven.",
      },
      {
        q: "Hvad er niveauer, og hvorfor betyder de noget?",
        a: "Jo flere opgaver du gennemfører, og jo bedre din gennemførelsesrate er, jo lavere bliver dit gebyr - fra Standard (20%) op til Platin (10,2%). Niveauet vises på din profil, så opgavestillere kan se det, når de vælger mellem bud.",
      },
      {
        q: "Kan jeg fortryde, hvis jeg har fået tildelt en opgave, der viser sig at være større end forventet?",
        a: "Ja. Du kan trække dig fra en tildelt opgave, før den er markeret udført. Opgavestilleren får automatisk sit beløb refunderet, og opgaven bliver åben for nye bud igen.",
      },
      {
        q: "Hvordan ser en opgavestiller, om jeg er en seriøs hjælper?",
        a: "Din profil viser dit niveau, dine anmeldelser, din gennemførelsesrate, og om din identitet er bekræftet via Stripe. Du kan også tilføje CV, kompetencer, tidligere erfaring og uddannelse - vi kan endda hjælpe med at udfylde det automatisk ud fra et CV, du uploader.",
      },
    ],
  },
  {
    title: "Betaling & sikkerhed",
    items: [
      {
        q: "Hvordan foregår betalingen?",
        a: "Når du accepterer et bud, betaler du med det samme via Stripe. Pengene holdes sikkert af platformen - de bliver ikke sendt videre til hjælperen, før du selv markerer opgaven som udført.",
      },
      {
        q: "Hvad hvis jeg ikke er tilfreds med arbejdet?",
        a: "Du markerer først opgaven som udført, når du er tilfreds. Er der problemer undervejs, kan I altid skrive sammen i beskederne på opgaven, og du kan altid kontakte kundeservice, hvis I ikke kan blive enige.",
      },
      {
        q: "Hvor hurtigt får jeg udbetalt penge som hjælper?",
        a: "Så snart opgaven er markeret udført, sendes beløbet (minus dit gebyr) med det samme til din tilknyttede Stripe-konto, og udbetales derfra hurtigst muligt til din bankkonto.",
      },
      {
        q: "Er mine kortoplysninger sikre?",
        a: "Ja. Betalingen håndteres af Stripe, som lever op til de højeste standarder for datasikkerhed (PCI DSS niveau 1). Dine kortoplysninger går aldrig gennem AIbuds egne servere.",
      },
      {
        q: "Hvad gør jeg, hvis jeg oplever noget mistænkeligt eller føler mig snydt?",
        a: "Kontakt kundeservice med det samme - der er en direkte \"Rapportér mistænkelig aktivitet\"-mulighed på hver opgaveside. Vi tager alle henvendelser om mistanke om svindel alvorligt.",
      },
    ],
  },
  {
    title: "Konto & profil",
    items: [
      {
        q: "Hvordan skifter jeg adgangskode?",
        a: "Gå til Indstillinger, mens du er logget ind, og brug feltet \"Skift adgangskode\". Har du oprettet dig via Google eller Facebook, har du ikke en adgangskode at skifte - log ind via samme knap som altid.",
      },
      {
        q: "Kan virksomheder oprette opgaver?",
        a: "Ja. Vælg \"Virksomhed\" ved oprettelse af opgaven, og angiv jeres CVR-nummer - vi slår det automatisk op i det officielle register og bekræfter firmanavnet.",
      },
      {
        q: "Hvordan sletter jeg min konto?",
        a: "Kontakt kundeservice, så hjælper vi dig med at slette din konto og tilhørende data.",
      },
    ],
  },
];
