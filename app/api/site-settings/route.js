import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const { rows } = await pool.query("SELECT key, value FROM site_settings");
    const settings = {};
    rows.forEach((r) => (settings[r.key] = r.value));
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ settings: {} });
  }
}
