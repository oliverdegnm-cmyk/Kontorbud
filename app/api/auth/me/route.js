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

    const { rows } = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [payload.userId]);
    if (!rows[0]) return NextResponse.json({ user: null });

    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
