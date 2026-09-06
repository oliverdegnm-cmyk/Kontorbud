import { NextResponse } from "next/server";
import { extractCvData } from "@/lib/anthropicClient";

export async function POST(request) {
  try {
    const { cvUrl } = await request.json();
    if (!cvUrl) {
      return NextResponse.json({ error: "Mangler et CV at analysere." }, { status: 400 });
    }

    const fileRes = await fetch(cvUrl);
    if (!fileRes.ok) {
      return NextResponse.json({ error: "Kunne ikke hente CV-filen." }, { status: 400 });
    }
    const buffer = await fileRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const extracted = await extractCvData(base64);
    return NextResponse.json({ extracted });
  } catch (err) {
    console.error("Kunne ikke analysere CV:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke analysere CV'et." }, { status: 500 });
  }
}
