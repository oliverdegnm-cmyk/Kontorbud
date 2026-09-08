import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { requesterName, reason } = body;

    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];

    if (task.status !== "matched") {
      return NextResponse.json({ error: "Denne opgave kan ikke trækkes tilbage fra." }, { status: 400 });
    }

    const { rows: bidRows } = await pool.query("SELECT * FROM bids WHERE id = $1", [task.accepted_bid_id]);
    const acceptedBid = bidRows[0];
    if (!acceptedBid || acceptedBid.bidder_name !== requesterName?.trim()) {
      return NextResponse.json({ error: "Kun den valgte hjælper kan trække sig fra opgaven." }, { status: 403 });
    }

    // Opgavestilleren har ikke fået noget udført endnu, så hele beløbet
    // refunderes - og opgaven genåbnes, så den kan modtage nye bud, i stedet
    // for at opgavestilleren skal oprette den forfra.
    if (task.payment_status === "held" && task.stripe_payment_intent_id) {
      const stripe = getStripe();
      await stripe.refunds.create({ payment_intent: task.stripe_payment_intent_id });
    }

    await pool.query(
      `UPDATE tasks
       SET status = 'open', accepted_bid_id = NULL, accepted_at = NULL,
           payment_status = 'unpaid', stripe_payment_intent_id = NULL, pending_bid_id = NULL
       WHERE id = $1`,
      [id]
    );

    // Det tilbagetrukne bud fjernes, så det ikke længere kan vælges igen ved
    // et uheld - hjælperen er velkommen til at byde igen senere, hvis de
    // ombestemmer sig.
    await pool.query("DELETE FROM bids WHERE id = $1", [task.accepted_bid_id]);

    await notify(
      task.posted_by,
      "helper_withdrew",
      id,
      `${acceptedBid.bidder_name} har trukket sig fra "${task.title}"${reason ? ": " + reason : ""}. Betalingen er refunderet, og opgaven er åben for nye bud igen.`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Fejl ved tilbagetrækning af bud:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke trække dig fra opgaven." }, { status: 500 });
  }
}
