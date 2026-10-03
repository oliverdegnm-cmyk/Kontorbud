import { NextResponse } from "next/server";
import { extractTaskFromDescription } from "@/lib/anthropicClient";
import { CATS } from "@/lib/categories";

// 11/10: "udfyld automatisk med AI" på opret-opgave-siden (app/opret/PostTaskClient.js).
// Tager brugerens fritekst-beskrivelse og returnerer et forslag til de felter,
// formularen allerede har - brugeren godkender/retter selv bagefter.
export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: "Skriv en kort beskrivelse af opgaven, før du udfylder automatisk." }, { status: 400 });
    }

    const extracted = await extractTaskFromDescription(text, CATS.map((c) => c.name));

    // Kategorien skal matche en af vores faktiske kategorier - ellers
    // overlader vi den til brugeren selv at vælge.
    if (extracted.category && !CATS.some((c) => c.name === extracted.category)) {
      extracted.category = null;
    }

    // 2/10: samme forsigtighedsprincip som kategorien ovenfor - en dato, der
    // ikke er et gyldigt, reelt (og ikke allerede overstået) YYYY-MM-DD-format,
    // bliver aldrig sendt videre til formularen. Så falder siden tilbage til
    // brugerens egen valgte/forudvalgte dato, i stedet for at vise noget forkert.
    if (extracted.deadlineDate) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(extracted.deadlineDate.trim());
      const parsed = match ? new Date(`${extracted.deadlineDate.trim()}T00:00:00Z`) : null;
      const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(new Date());
      const isValid = match && parsed && !isNaN(parsed.getTime()) && extracted.deadlineDate.trim() >= todayIso;
      extracted.deadlineDate = isValid ? extracted.deadlineDate.trim() : "";
    }

    return NextResponse.json({ extracted });
  } catch (err) {
    console.error("Kunne ikke AI-udfylde opgaveformularen:", err);
    return NextResponse.json({ error: "Kunne ikke udfylde formularen automatisk. Prøv igen, eller udfyld felterne manuelt." }, { status: 500 });
  }
}
