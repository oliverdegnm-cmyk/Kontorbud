import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, ensureSchema } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

    const { rows } = await pool.query("SELECT stripe_customer_id FROM profiles WHERE name = $1", [payload.name]);
    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) return NextResponse.json({ cards: [] });

    const stripe = getStripe();

    let methods;
    try {
      methods = await stripe.paymentMethods.list({ customer: customerId, type: "card" });
    } catch (err) {
      // Kunden findes ikke i den nuværende tilstand (test/live) - typisk en
      // rest fra sandbox, før platformen skiftede til Live mode. Ryd op og
      // vis blot en tom liste, i stedet for en fejl - et nyt kort tilføjet
      // herfra opretter automatisk en frisk, gyldig kunde.
      await pool.query("UPDATE profiles SET stripe_customer_id = NULL WHERE name = $1", [payload.name]);
      return NextResponse.json({ cards: [] });
    }

    return NextResponse.json({
      cards: methods.data.map((m) => ({
        id: m.id,
        brand: m.card.brand,
        last4: m.card.last4,
        expMonth: m.card.exp_month,
        expYear: m.card.exp_year,
      })),
    });
  } catch (err) {
    console.error("Stripe-fejl (list cards):", err);
    return NextResponse.json({ error: "Kunne ikke hente gemte kort." }, { status: 500 });
  }
}
