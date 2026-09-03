import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripeCustomer";

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { bidId, requesterName } = body;

    if (!bidId || !requesterName?.trim()) {
      return NextResponse.json({ error: "Mangler bud eller navn." }, { status: 400 });
    }

    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];

    if (task.posted_by !== requesterName.trim()) {
      return NextResponse.json({ error: "Kun opgavestilleren kan vælge et bud." }, { status: 403 });
    }
    if (task.status !== "open") {
      return NextResponse.json({ error: "Opgaven er allerede tildelt." }, { status: 400 });
    }

    const { rows: bidRows } = await pool.query("SELECT * FROM bids WHERE id = $1 AND task_id = $2", [bidId, id]);
    if (bidRows.length === 0) {
      return NextResponse.json({ error: "Buddet findes ikke på denne opgave." }, { status: 404 });
    }
    const bid = bidRows[0];
    if (!bid.amount_value || bid.amount_value <= 0) {
      return NextResponse.json({ error: "Buddet har ikke et gyldigt beløb." }, { status: 400 });
    }

    const { rows: profileRows } = await pool.query(
      "SELECT stripe_account_id, stripe_payouts_enabled FROM profiles WHERE name = $1",
      [bid.bidder_name]
    );
    const profile = profileRows[0];
    if (!profile?.stripe_account_id || !profile.stripe_payouts_enabled) {
      return NextResponse.json(
        { error: `${bid.bidder_name} har ikke forbundet en betalingsmodtagende Stripe-konto endnu. Bed dem forbinde Stripe under deres profil, før du kan vælge buddet.` },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Kobler betalingen til opgavestillerens Stripe-kunde, så kortet automatisk
    // gemmes og kan genbruges med ét klik næste gang, ligesom Handyhands "HandyhandPay".
    const customerId = await getOrCreateStripeCustomer(task.posted_by);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      payment_method_types: ["card"],
      payment_intent_data: {
        setup_future_usage: "on_session",
      },
      line_items: [
        {
          price_data: {
            currency: "dkk",
            unit_amount: bid.amount_value * 100,
            product_data: {
              name: task.title,
              description: `Bud fra ${bid.bidder_name} — betalingen holdes, indtil du markerer opgaven som udført.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { task_id: String(id), bid_id: String(bidId) },
      success_url: `${origin}/opgave/${id}?checkout=success`,
      cancel_url: `${origin}/opgave/${id}?checkout=cancelled`,
    });

    await pool.query(
      "UPDATE tasks SET pending_bid_id = $1, stripe_checkout_session_id = $2 WHERE id = $3",
      [bidId, session.id, id]
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe-fejl i app/api/tasks/[id]/checkout/route.js:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke starte betalingen." }, { status: 500 });
  }
}
