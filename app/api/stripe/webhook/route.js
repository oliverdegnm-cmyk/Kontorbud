import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { notify } from "@/lib/notify";

// Stripe skal have den rå request-krop for at kunne verificere signaturen,
// så vi undgår Next.js' automatiske JSON-parsing her.
export async function POST(request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook - ugyldig signatur:", err.message);
    return NextResponse.json({ error: `Webhook signatur ugyldig: ${err.message}` }, { status: 400 });
  }

  try {
    await ensureSchema();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const taskId = Number(session.metadata.task_id);
      const bidId = Number(session.metadata.bid_id);

      const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
      const task = taskRows[0];
      if (task && task.status === "open" && task.pending_bid_id === bidId) {
        await pool.query(
          `UPDATE tasks
           SET status = 'matched', accepted_bid_id = $1, accepted_at = now(),
               payment_status = 'held', stripe_payment_intent_id = $2, pending_bid_id = NULL
           WHERE id = $3`,
          [bidId, session.payment_intent, taskId]
        );

        const { rows: bidRows } = await pool.query("SELECT bidder_name FROM bids WHERE id = $1", [bidId]);
        if (bidRows[0]) {
          await notify(bidRows[0].bidder_name, "bid_accepted", taskId, `Dit bud på "${task.title}" er valgt, og betalingen holdes klar til udbetaling.`);
        }
      } else {
        console.error("Stripe webhook - opgave matchede ikke forventet tilstand:", { taskId, bidId, taskStatus: task?.status, pendingBidId: task?.pending_bid_id });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook - fejl under behandling:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke behandle webhook." }, { status: 500 });
  }
}
