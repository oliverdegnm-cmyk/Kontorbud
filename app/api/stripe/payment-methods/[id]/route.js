import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function DELETE(request, { params }) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

    const stripe = getStripe();
    await stripe.paymentMethods.detach(params.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe-fejl (detach card):", err);
    return NextResponse.json({ error: "Kunne ikke fjerne kortet." }, { status: 500 });
  }
}
