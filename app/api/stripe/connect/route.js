import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { name } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Mangler navn." }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { rows } = await pool.query("SELECT stripe_account_id FROM profiles WHERE name = $1", [name.trim()]);
    let accountId = rows[0]?.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "DK",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: "individual",
        metadata: { kontorbud_name: name.trim() },
      });
      accountId = account.id;
      await pool.query(
        `INSERT INTO profiles (name, stripe_account_id) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET stripe_account_id = $2`,
        [name.trim(), accountId]
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/profil?stripe=refresh`,
      return_url: `${origin}/profil?stripe=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Kunne ikke starte Stripe-forbindelsen." }, { status: 500 });
  }
}
