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

    return NextResponse.json({ extracted });
  } catch (err) {
    console.error("Kunne ikke AI-udfylde opgaveformularen:", err);
    return NextResponse.json({ error: "Kunne ikke udfylde formularen automatisk. Prøv igen, eller udfyld felterne manuelt." }, { status: 500 });
  }
}
