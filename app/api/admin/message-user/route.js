import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { notify } from "@/lib/notify";

export async function POST(request) {
  try {
    await ensureSchema();
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });

    const body = await request.json();
    const { recipientName, message } = body;
    if (!recipientName || !message?.trim()) {
      return NextResponse.json({ error: "Mangler modtager eller besked." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://kontorbud.vercel.app";
    await notify(recipientName, "admin_message", null, `Besked fra Kontorbud support: ${message.trim()}`, origin);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke sende besked." }, { status: 500 });
  }
}
