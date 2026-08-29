import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const name = decodeURIComponent(params.name);
    const { rows } = await pool.query("SELECT * FROM profiles WHERE name = $1", [name]);
    const p = rows[0];
    return NextResponse.json({
      profile: p
        ? { name: p.name, bio: p.bio, skills: p.skills, portfolio: p.portfolio, stripeConnected: !!p.stripe_account_id, stripePayoutsEnabled: p.stripe_payouts_enabled }
        : { name, bio: "", skills: "", portfolio: "", stripeConnected: false, stripePayoutsEnabled: false },
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente profil." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const name = decodeURIComponent(params.name);
    const body = await request.json();
    const { bio, skills, portfolio } = body;

    await pool.query(
      `INSERT INTO profiles (name, bio, skills, portfolio, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (name) DO UPDATE SET bio = $2, skills = $3, portfolio = $4, updated_at = now()`,
      [name, bio?.trim() || "", skills?.trim() || "", portfolio?.trim() || ""]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke gemme profil." }, { status: 500 });
  }
}
