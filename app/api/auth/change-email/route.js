import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { pool, ensureSchema } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request) {
  try {
    await ensureSchema();
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

    const body = await request.json();
    const { newEmail } = body;
    if (!newEmail?.trim()) {
      return NextResponse.json({ error: "Angiv en ny email." }, { status: 400 });
    }
    const normalized = newEmail.trim().toLowerCase();

    const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [normalized, payload.userId]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Den email er allerede i brug af en anden konto." }, { status: 400 });
    }

    const verificationToken = crypto.randomBytes(24).toString("hex");
    const { rows } = await pool.query(
      "UPDATE users SET email = $1, email_verified = false, verification_token = $2, verification_sent_at = now() WHERE id = $3 RETURNING name",
      [normalized, verificationToken, payload.userId]
    );

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendVerificationEmail(normalized, rows[0].name, verificationToken, origin);

    return NextResponse.json({ ok: true, email: normalized });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke skifte email." }, { status: 500 });
  }
}
