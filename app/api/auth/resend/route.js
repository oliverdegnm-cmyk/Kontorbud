import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool, ensureSchema } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { name } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Mangler navn." }, { status: 400 });

    const { rows } = await pool.query("SELECT * FROM users WHERE name = $1", [name.trim()]);
    if (rows.length === 0) return NextResponse.json({ error: "Bruger findes ikke." }, { status: 404 });
    const user = rows[0];

    if (user.email_verified) {
      return NextResponse.json({ error: "Din email er allerede bekræftet." }, { status: 400 });
    }

    const token = crypto.randomBytes(24).toString("hex");
    await pool.query("UPDATE users SET verification_token = $1, verification_sent_at = now() WHERE id = $2", [token, user.id]);

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendVerificationEmail(user.email, user.name, token, origin);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke sende mail igen." }, { status: 500 });
  }
}
