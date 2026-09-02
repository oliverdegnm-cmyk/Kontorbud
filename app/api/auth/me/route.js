import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, ensureSchema } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// Skal altid læse den friske cookie for den aktuelle bruger og må derfor
// aldrig statisk caches eller genbruges på tværs af forskellige besøgende.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ user: null });

    const { rows } = await pool.query("SELECT id, name, email, email_verified, is_admin FROM users WHERE id = $1", [payload.userId]);
    if (!rows[0]) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: { id: rows[0].id, name: rows[0].name, email: rows[0].email, emailVerified: rows[0].email_verified, isAdmin: rows[0].is_admin },
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
