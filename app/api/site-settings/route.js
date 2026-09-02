import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

// Skal altid returnere de friskeste indstillinger og må derfor aldrig
// statisk caches - ellers ser besøgende aldrig nye billeder/justeringer,
// før der sker en helt ny deployment.
export const dynamic = "force-dynamic";

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
