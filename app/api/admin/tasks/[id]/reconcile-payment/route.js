import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { getStripe } from "@/lib/stripe";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });

    const taskId = Number(params.id);
    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
    const task = taskRows[0];
    if (!task) return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });

    if (!task.pending_bid_id) {
      return NextResponse.json({ error: "Denne opgave venter ikke på en betaling lige nu (intet 'pending_bid_id')." }, { status: 400 });
    }

    const stripe = getStripe();

    // Stripe gemmer ikke opgave-id direkte søgbart, så vi leder i de seneste
    // checkout-sessioner efter én, hvis metadata matcher denne opgave og dette bud.
    const sessions = await stripe.checkout.sessions.list({ limit: 25 });
    const match = sessions.data.find(
      (s) => s.metadata?.task_id === String(taskId) && s.metadata?.bid_id === String(task.pending_bid_id) && s.payment_status === "paid"
    );

    if (!match) {
      return NextResponse.json(
        { error: "Fandt ingen gennemført betaling hos Stripe for denne opgave i de seneste 25 sessioner. Tjek beløbet manuelt i Stripe Dashboard." },
        { status: 404 }
      );
    }

    await pool.query(
      `UPDATE tasks
       SET status = 'matched', accepted_bid_id = $1, accepted_at = now(),
           payment_status = 'held', stripe_payment_intent_id = $2, pending_bid_id = NULL
       WHERE id = $3`,
      [task.pending_bid_id, match.payment_intent, taskId]
    );

    const { rows: bidRows } = await pool.query("SELECT bidder_name FROM bids WHERE id = $1", [task.pending_bid_id]);
    if (bidRows[0]) {
      await notify(bidRows[0].bidder_name, "bid_accepted", taskId, `Dit bud på "${task.title}" er valgt, og betalingen holdes klar til udbetaling.`);
    }

    return NextResponse.json({ ok: true, paymentIntentId: match.payment_intent });
  } catch (err) {
    console.error("Kunne ikke reparere opgave manuelt:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke reparere opgaven." }, { status: 500 });
  }
}
