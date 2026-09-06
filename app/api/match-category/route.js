import { NextResponse } from "next/server";
import { matchCategoryWithAI } from "@/lib/anthropicClient";
import { CATS } from "@/lib/categories";

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ category: null });

    const result = await matchCategoryWithAI(text, CATS.map((c) => c.name));
    const match = CATS.find((c) => c.name === result);
    return NextResponse.json({ category: match ? match.name : null });
  } catch (err) {
    console.error("Kunne ikke AI-matche kategori:", err);
    // Fejler stille - brugeren kan stadig vælge en kategori selv på opret-siden.
    return NextResponse.json({ category: null });
  }
}
