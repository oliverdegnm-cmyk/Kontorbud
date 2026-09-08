import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function DELETE(request, { params }) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

    const stripe = getStripe();

    // Bekræfter kortet rent faktisk tilhører den, der er logget ind, før det
    // fjernes - ellers kunne enhver logget ind bruger fjerne et vilkårligt
    // andet korts id, bare ved at kende det.
    const { rows } = await pool.query("SELECT stripe_customer_id FROM profiles WHERE name = $1", [payload.name]);
    const customerId = rows[0]?.stripe_customer_id;

    const method = await stripe.paymentMethods.retrieve(params.id);
    if (!customerId || method.customer !== customerId) {
      return NextResponse.json({ error: "Dette kort tilhører ikke din konto." }, { status: 403 });
    }

    await stripe.paymentMethods.detach(params.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe-fejl (detach card):", err);
    return NextResponse.json({ error: "Kunne ikke fjerne kortet." }, { status: 500 });
  }
}
