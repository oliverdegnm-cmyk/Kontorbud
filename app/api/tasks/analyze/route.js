import { NextResponse } from "next/server";
import { analyzeTaskDraft } from "@/lib/anthropicClient";
import { CATS } from "@/lib/categories";

// 3/10: det nye intelligente "Opret en opgave"-flow (se app/opret/PostTaskClient.js).
// Bruges to steder fra klienten, styret af "mode":
// - mode "full" (default): den første analyse af kundens fritekst - kortlægger
//   til ALLE felterne og regner samtidig ud, hvilke nødvendige oplysninger der
//   reelt mangler (missingFields), så klienten kun skal spørge om dem.
// - mode "description_only": en lettere genanalyse, når kunden selv redigerer
//   beskrivelsen i det levende resume bagefter (se punkt 10/13 i briefet) -
//   returnerer stadig hele AI-svaret, men klienten bruger her kun titel/
//   kategori/kategorikandidater og rører IKKE ved resten af kundens felter.
// I begge tilfælde er dette et sikkerhedsnet, samme princip som den tidligere
// autofill-route havde for kategorien: AI-output behandles ALDRIG som
// automatisk korrekt - en kategori, der ikke findes på listen, og en dato,
// der ikke er gyldig/allerede overstået, bliver aldrig sendt videre.
export async function POST(request) {
  try {
    const { text, mode } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: "Skriv en kort beskrivelse af opgaven, før AI kan analysere den." }, { status: 400 });
    }

    const categoryNames = CATS.map((c) => c.name);
    const raw = await analyzeTaskDraft(text, categoryNames);

    // Kategorien (og evt. kategorikandidater/det opklarende spørgsmåls
    // kategori-kobling) skal matche en af vores faktiske kategorier - en
    // kategori AI'en har opfundet, bliver aldrig sendt videre til klienten.
    const validCategory = raw.category && categoryNames.includes(raw.category) ? raw.category : null;
    const validCandidates = Array.isArray(raw.categoryCandidates)
      ? raw.categoryCandidates.filter((c) => categoryNames.includes(c)).slice(0, 3)
      : [];

    let validClarifying = null;
    if (raw.clarifyingQuestion?.question && Array.isArray(raw.clarifyingQuestion.options)) {
      const options = raw.clarifyingQuestion.options.filter((o) => o?.label && categoryNames.includes(o.category)).slice(0, 5);
      if (options.length >= 2) {
        validClarifying = { question: raw.clarifyingQuestion.question, options };
      }
    }

    // Samme dato-sikkerhedsnet som den tidligere autofill-route havde: en
    // udtrukket frist, der ikke er et gyldigt, reelt (og ikke allerede
    // overstået) YYYY-MM-DD-format, bliver aldrig sendt videre.
    let validDeadlineDate = "";
    if (raw.deadlineDate) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw.deadlineDate).trim());
      const parsed = match ? new Date(`${raw.deadlineDate.trim()}T00:00:00Z`) : null;
      const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(new Date());
      const isValid = match && parsed && !isNaN(parsed.getTime()) && raw.deadlineDate.trim() >= todayIso;
      validDeadlineDate = isValid ? raw.deadlineDate.trim() : "";
    }

    const validLocationType = raw.locationType === "remote" || raw.locationType === "in_person" ? raw.locationType : null;
    const validPosterType = raw.posterType === "private" || raw.posterType === "business" ? raw.posterType : null;

    const fields = {
      title: typeof raw.title === "string" ? raw.title.trim() : "",
      category: validCategory,
      description: typeof raw.description === "string" ? raw.description.trim() : "",
      budget: typeof raw.budget === "string" ? raw.budget.trim() : "",
      deadlineDate: validDeadlineDate,
      deadlineFlexible: !!raw.deadlineFlexible,
      isUrgent: !!raw.isUrgent,
      locationType: validLocationType,
      area: typeof raw.area === "string" ? raw.area.trim() : "",
      posterType: validPosterType,
    };

    // "description_only" (genanalyse ved redigeret beskrivelse) har ikke brug
    // for spørgsmåls-logikken nedenfor - klienten bruger kun titel/kategori
    // herfra, og vi vil ikke risikere at genåbne spørgsmål, kunden allerede
    // har besvaret, midt i det levende resume.
    if (mode === "description_only") {
      return NextResponse.json({ fields: { title: fields.title, category: fields.category, description: fields.description }, categoryCandidates: validCandidates });
    }

    // Spørg kun om det, der reelt mangler (punkt 5-6 i briefet) - i den
    // rækkefølge, der oftest giver mest mening at få afklaret: en uklar
    // kategori (eller det opklarende spørgsmål, der hænger sammen med den
    // valgte kategori) vejer tungest, dernæst arbejdsform, og til sidst
    // prioritet - som ofte slet ikke er nødvendig at spørge om.
    const missingFields = [];
    if (!fields.category) missingFields.push("category");
    else if (validClarifying) missingFields.push("clarify");
    if (!fields.locationType) missingFields.push("workMode");
    if (raw.isUrgentUncertain) missingFields.push("priority");

    return NextResponse.json({
      fields,
      categoryCandidates: fields.category ? [] : validCandidates,
      clarifyingQuestion: fields.category ? validClarifying : null,
      missingFields: missingFields.slice(0, 3),
    });
  } catch (err) {
    console.error("Kunne ikke AI-analysere opgaven:", err);
    return NextResponse.json({ error: "Vi kunne ikke analysere din beskrivelse lige nu. Prøv igen, eller fortsæt manuelt." }, { status: 500 });
  }
}
