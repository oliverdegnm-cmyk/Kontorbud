import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const name = decodeURIComponent(params.name);
    const { rows } = await pool.query("SELECT stripe_account_id, stripe_payouts_enabled FROM profiles WHERE name = $1", [name]);
    const profile = rows[0];

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ connected: false, payoutsEnabled: false });
    }

    const stripe = getStripe();

    let account;
    try {
      account = await stripe.accounts.retrieve(profile.stripe_account_id);
    } catch (err) {
      // Kontoen findes ikke i den nuværende tilstand (test/live) - typisk fordi
      // den blev forbundet, mens platformen kørte i sandbox, før skiftet til
      // Live mode. Ryd op i den forældede reference, så brugeren tydeligt ser,
      // at de skal forbinde Stripe igen, i stedet for en skjult fejl senere.
      await pool.query(
        "UPDATE profiles SET stripe_account_id = NULL, stripe_payouts_enabled = false WHERE name = $1",
        [name]
      );
      return NextResponse.json({ connected: false, payoutsEnabled: false });
    }

    const payoutsEnabled = !!account.payouts_enabled;

    if (payoutsEnabled !== profile.stripe_payouts_enabled) {
      await pool.query("UPDATE profiles SET stripe_payouts_enabled = $1 WHERE name = $2", [payoutsEnabled, name]);
    }

    return NextResponse.json({ connected: true, payoutsEnabled });
  } catch (err) {
    console.error("Stripe-fejl i app/api/stripe/status/[name]/route.js:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke hente Stripe-status." }, { status: 500 });
  }
}
