import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { name, email, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Udfyld navn, email og en besked." }, { status: 400 });
    }

    const { rows } = await pool.query("SELECT value FROM site_settings WHERE key = 'contact_email'");
    const supportEmail = rows[0]?.value;

    if (!supportEmail) {
      return NextResponse.json(
        { error: "Kontaktformularen er endnu ikke sat op. Prøv igen senere." },
        { status: 503 }
      );
    }

    const sent = await sendContactEmail(supportEmail, name.trim(), email.trim(), message.trim());
    if (!sent) {
      return NextResponse.json({ error: "Kunne ikke sende beskeden. Prøv igen." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke sende beskeden." }, { status: 500 });
  }
}
