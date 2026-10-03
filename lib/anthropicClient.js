// Bruger Anthropics API til at læse et CV (PDF) og finde de oplysninger, der
// kan bruges til at foreslå udfyldning af profilen. Kræver ANTHROPIC_API_KEY
// som miljøvariabel i Vercel - en ny, selvstændig nøgle, adskilt fra selve
// byggeprocessen her.
export async function extractCvData(pdfBase64) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY mangler i miljøvariablerne - automatisk udfyldning kan ikke bruges endnu.");
  }

  const prompt = `Du får vedhæftet et CV som PDF. Læs det, og svar UDELUKKENDE med et JSON-objekt (ingen forklaring, ingen markdown-kodeblok omkring), i præcis dette format:
{
  "bio": "en kort, professionel præsentation på 2-3 sætninger baseret på CV'et, skrevet på dansk, i jeg-form",
  "job": "hver enkelt stilling på sin egen linje (adskilt med \\n), i formatet 'Årstal-årstal: Titel hos Virksomhed - kort om ansvarsområder', nyeste øverst, skrevet på dansk",
  "education": "hver enkelt formel uddannelse (universitet/skole) på sin egen linje (adskilt med \\n), i formatet 'Årstal-årstal: Uddannelse, sted', nyeste øverst, skrevet på dansk",
  "certifications": "hvert enkelt kursus eller certificering (IKKE formel uddannelse) på sin egen linje (adskilt med \\n), i formatet 'Årstal: Kursus/certificering, udbyder', nyeste øverst, skrevet på dansk",
  "skills": "en kommasepareret liste af de vigtigste faglige kompetencer, maks. 8 stykker"
}
Hvis en oplysning ikke tydeligt fremgår af CV'et, brug en tom streng "" for det pågældende felt. Opfind aldrig oplysninger, der ikke står i dokumentet. Brug ALTID et linjeskift (\\n) mellem hver selvstændig post i "job", "education" og "certifications" - skriv dem aldrig i forlængelse af hinanden på samme linje. Adskil formel uddannelse (education) klart fra kurser/certificeringer (certifications) - de skal ikke stå i samme felt.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "Kunne ikke analysere CV'et.");
  }

  const text = (data.content || []).map((c) => c.text || "").join("");
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Kunne ikke tolke svaret fra AI-analysen.");
  }
}

// 2/10: dagens dato på dansk (Europe/Copenhagen), til AI-prompten nedenfor.
// Modellen kender ikke selv dagens dato - uden denne linje gætter den, og
// det er netop det, der tidligere gjorde at en frist som "om 2 uger" eller
// "1. november" kunne blive udregnet til en forkert dag/forkert år.
function todayInCopenhagenForPrompt() {
  const now = new Date();
  const isoDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(now); // YYYY-MM-DD
  const danishLong = new Intl.DateTimeFormat("da-DK", {
    timeZone: "Europe/Copenhagen",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  return { isoDate, danishLong };
}

// 3/10: structured-output-skema til analyzeTaskDraft() nedenfor. Erstatter
// den tidligere extractTaskFromDescription() (envejs-autofill, 2/10), som nu
// er fjernet - det intelligente "Opret en opgave"-flow (se
// app/opret/PostTaskClient.js) er ikke en engangs-autofill, men et løbende
// AI-lag, der både laver den første analyse OG genvurderer titel/kategori,
// når kunden selv redigerer beskrivelsen bagefter. Begge brug kalder samme
// funktion/skema - kun hvilke felter kaldstedet selv vælger at bruge, varierer.
// Tvungen tool-use (i stedet for at bede modellen skrive JSON i fri tekst og
// selv parse det bagefter, som den gamle funktion gjorde) gør svaret
// maskinlæsbart og garanteret skema-gyldigt fra Anthropics side.
const TASK_ANALYSIS_TOOL = {
  name: "opgave_analyse",
  description: "Strukturerede felter udtrukket fra en kundes fritekst-beskrivelse af en opgave på Kontorbud.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Kort, konkret titel (maks. ca. 8 ord), dansk." },
      category: { type: ["string", "null"], description: "Den bedst matchende kategori fra listen nedenfor, eller null hvis det reelt er uklart mellem flere kategorier." },
      categoryCandidates: {
        type: ["array", "null"],
        items: { type: "string" },
        description: "2-3 kategorier fra listen nedenfor, KUN udfyldt hvis \"category\" er null.",
      },
      description: { type: "string", description: "Renskrevet, professionel udgave af kundens egen beskrivelse - samme fakta, bedre sprog, opfind intet nyt." },
      budget: { type: "string", description: "Beløb i kr. som tekst (f.eks. \"2000\" eller \"2000-3000\"), KUN hvis kunden selv har nævnt et beløb/interval - ellers tom streng." },
      deadlineDate: { type: "string", description: "Dato i formatet YYYY-MM-DD, KUN hvis kunden selv nævner et konkret tidspunkt/frist - ellers tom streng." },
      deadlineFlexible: { type: "boolean", description: "True KUN hvis kunden selv tydeligt siger, at der IKKE er nogen fast frist." },
      isUrgent: { type: "boolean", description: "True KUN hvis kunden tydeligt signalerer, at opgaven haster/skal løses hurtigst muligt." },
      isUrgentUncertain: { type: "boolean", description: "True hvis det reelt er uklart om opgaven haster, og det er værd at spørge kunden direkte." },
      locationType: {
        type: ["string", "null"],
        enum: ["remote", "in_person", null],
        description: "\"in_person\" KUN hvis kunden tydeligt kræver fysisk fremmøde, \"remote\" hvis tydeligt IKKE, ellers null hvis det reelt er uklart og værd at spørge om.",
      },
      area: { type: "string", description: "By/område, KUN hvis fysisk fremmøde er nævnt - ellers tom streng." },
      posterType: {
        type: ["string", "null"],
        enum: ["private", "business", null],
        description: "\"business\" KUN hvis kunden tydeligt skriver på vegne af en virksomhed, \"private\" hvis tydeligt privat, ellers null hvis uklart.",
      },
      clarifyingQuestion: {
        type: ["object", "null"],
        description: "ÉT kort, fagligt opklarende spørgsmål om selve opgavens EMNE/OMFANG (fx hvilken del af et fagområde), KUN hvis en kategori er fundet, men selve opgaven er så vag, at bydere ikke vil forstå den - ellers null. Stil det IKKE ved enhver lille uklarhed, kun når svaret væsentligt forbedrer opgaven. Må ALDRIG handle om arbejdsform (fjernarbejde/fysisk fremmøde), budget, tidspunkt/frist eller privat/virksomhed - de spørges altid separat af systemet selv, og et spørgsmål om dem her vil blive vist som et dobbelt spørgsmål for kunden.",
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            description: "2-5 korte svarmuligheder, hver knyttet til en kategori fra listen nedenfor.",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                category: { type: "string", description: "Den kategori fra listen nedenfor, dette svar hører til." },
              },
              required: ["label", "category"],
            },
          },
        },
      },
    },
    required: [
      "title", "category", "categoryCandidates", "description", "budget",
      "deadlineDate", "deadlineFlexible", "isUrgent", "isUrgentUncertain",
      "locationType", "area", "posterType", "clarifyingQuestion",
    ],
  },
};

export async function analyzeTaskDraft(text, categoryNames) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY mangler i miljøvariablerne - AI-analysen kan ikke bruges endnu.");
  }

  const { isoDate, danishLong } = todayInCopenhagenForPrompt();

  const prompt = `Du hjælper en kunde med at oprette en opgave på Kontorbud, en dansk markedsplads for kontoropgaver. Du får kundens egen fritekst-beskrivelse. Udtræk oplysninger til opgavens felter ved at kalde funktionen "opgave_analyse" - svar UDELUKKENDE via funktionskaldet, ingen fri tekst udenom.

Dagens dato er ${isoDate} (${danishLong}) - brug den til at udregne relative frister korrekt (f.eks. "om 2 uger", "på fredag", eller "1. november" uden årstal - brug næste forekomst, hvis datoen allerede er passeret i år). Udregn ALDRIG en dato, der ligger før dagens dato.

Kategorier at vælge mellem: ${categoryNames.join(", ")}.

Vigtige regler:
- Opfind ALDRIG oplysninger, kunden ikke selv har skrevet - især ikke budget, frist, fysisk/eksternt fremmøde, privat/virksomhed, systemer kunden bruger, virksomhedsstørrelse eller arbejdsomfang. Brug tom streng/false/null, hvis noget ikke er tydeligt angivet i teksten.
- "description" skal være en renskrevet, professionel udgave af det, kunden faktisk skrev - samme fakta, bedre sprog, intet tilføjet.
- Brug "clarifyingQuestion" kun, hvis opgaven er så vag, at en byder ikke vil forstå den, og ÉT spørgsmål væsentligt forbedrer den. "clarifyingQuestion" må ALDRIG handle om arbejdsform (fjernarbejde/fysisk fremmøde), budget, tidspunkt/frist eller privat/virksomhed - systemet spørger altid selv om de ting separat, så et spørgsmål om dem her ville blive vist dobbelt for kunden. Brug den udelukkende til at afklare opgavens FAGLIGE emne/omfang (fx "Hvad skal du primært have hjælp til?" med delemner inden for den valgte kategori).
- Brug "categoryCandidates" kun, hvis "category" er null, fordi det reelt er uklart mellem 2-3 kategorier.

Kundens tekst: "${text}"`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      tools: [TASK_ANALYSIS_TOOL],
      tool_choice: { type: "tool", name: "opgave_analyse" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "Kunne ikke analysere opgaven.");
  }

  const toolUse = (data.content || []).find((c) => c.type === "tool_use");
  if (!toolUse?.input) {
    throw new Error("Kunne ikke tolke AI-analysen.");
  }
  return toolUse.input;
}

// Bruges som sikkerhedsnet, når ordlisten i lib/categories.js ikke selv kan
// finde en matchende kategori ud fra brugerens fritekst.
export async function matchCategoryWithAI(text, categoryNames) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY mangler i miljøvariablerne.");
  }

  const prompt = `Her er kategorierne på en dansk platform for kontoropgaver: ${categoryNames.join(", ")}.
Brugeren har skrevet følgende om, hvad de har brug for hjælp til: "${text}"
Svar UDELUKKENDE med navnet på den kategori fra listen, der passer bedst - præcis som det står i listen, uden ekstra tekst, uden anførselstegn. Hvis intet giver mening, svar "Andet".`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 40,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "Kunne ikke finde en kategori.");
  }

  return (data.content || []).map((c) => c.text || "").join("").trim();
}
