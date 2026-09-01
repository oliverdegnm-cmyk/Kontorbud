import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { token } = body;
    if (!token) {
      return NextResponse.json({ error: "Mangler token." }, { status: 400 });
    }

    const { rows } = await pool.query("SELECT id FROM users WHERE verification_token = $1", [token]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Linket er ugyldigt eller allerede brugt." }, { status: 400 });
    }

    await pool.query("UPDATE users SET email_verified = true, verification_token = NULL WHERE id = $1", [rows[0].id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke bekræfte email." }, { status: 500 });
  }
}
