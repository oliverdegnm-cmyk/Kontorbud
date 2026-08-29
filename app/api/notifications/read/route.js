import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { name } = body;
    if (!name) return NextResponse.json({ error: "Mangler name." }, { status: 400 });

    await pool.query("UPDATE notifications SET is_read = true WHERE recipient_name = $1 AND is_read = false", [name]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke opdatere notifikationer." }, { status: 500 });
  }
}
