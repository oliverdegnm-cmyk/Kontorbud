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

// 11/10: "udfyld automatisk med AI" på opret-opgave-siden. Brugeren skriver
// kort, med egne ord, hvad de har brug for hjælp til - denne funktion
// udtrækker de felter, formularen allerede har, så brugeren kun skal tjekke
// dem igennem og rette til, i stedet for at udfylde alt fra bunden. Bevidst
// konservativ: må ALDRIG opfinde oplysninger (beløb, deadlines, byer osv.),
// som brugeren ikke selv har skrevet - tom streng/false/"remote" i stedet.
export async function extractTaskFromDescription(text, categoryNames) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY mangler i miljøvariablerne - automatisk udfyldning kan ikke bruges endnu.");
  }

  const prompt = `Du får en kort fritekst-beskrivelse fra en bruger, der ønsker at oprette en opgave på en dansk platform for kontoropgaver. Baseret UDELUKKENDE på hvad brugeren selv skriver, skal du udtrække oplysninger til en opgaveformular. Svar UDELUKKENDE med et JSON-objekt (ingen forklaring, ingen markdown-kodeblok omkring), i præcis dette format:
{
  "title": "en kort, konkret titel til opgaven (maks. ca. 8 ord), skrevet på dansk",
  "category": "den kategori fra listen nedenfor, der passer bedst",
  "description": "en renskrevet, professionel version af brugerens egen beskrivelse, på dansk - medtag KUN det brugeren faktisk har skrevet, opfind aldrig nye detaljer, krav eller omfang",
  "budget": "et foreslået budget i kr, KUN hvis brugeren selv har nævnt et beløb eller en tydelig prisindikation - ellers tom streng",
  "isUrgent": true/false - kun true, hvis brugeren tydeligt signalerer at opgaven er akut/skal løses hurtigst muligt,
  "locationType": "in_person" KUN hvis brugeren tydeligt angiver, at opgaven kræver fysisk fremmøde et sted - ellers "remote",
  "area": "by eller område, KUN hvis brugeren selv har nævnt det i forbindelse med fysisk fremmøde - ellers tom streng"
}
Kategorier at vælge mellem: ${categoryNames.join(", ")}.
Opfind ALDRIG oplysninger, der ikke fremgår af brugerens tekst - brug tom streng/false/"remote", hvis noget ikke er tydeligt angivet.
Brugerens tekst: "${text}"`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "Kunne ikke analysere beskrivelsen.");
  }

  const responseText = (data.content || []).map((c) => c.text || "").join("");
  const cleaned = responseText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Kunne ikke tolke svaret fra AI-udfyldningen.");
  }
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
