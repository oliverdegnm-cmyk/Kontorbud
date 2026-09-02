import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    await ensureSchema();
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });

    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.email_verified, u.is_admin, u.created_at,
              p.stripe_payouts_enabled
       FROM users u
       LEFT JOIN profiles p ON p.name = u.name
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({
      users: rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.email_verified,
        isAdmin: u.is_admin,
        stripeConnected: !!u.stripe_payouts_enabled,
        createdAt: u.created_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente brugere." }, { status: 500 });
  }
}
