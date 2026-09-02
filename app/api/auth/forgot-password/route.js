import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool, ensureSchema } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { email } = body;
    if (!email?.trim()) {
      return NextResponse.json({ error: "Angiv din email." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);

    // Vi svarer altid det samme, uanset om emailen findes - så man ikke kan bruge
    // denne funktion til at afsløre, hvilke emails der har en konto hos os.
    if (rows.length > 0) {
      const user = rows[0];
      const token = crypto.randomBytes(24).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 time
      await pool.query("UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3", [token, expires, user.id]);

      const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      await sendPasswordResetEmail(user.email, user.name, token, origin);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke sende nulstillingsmail." }, { status: 500 });
  }
}
