import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { notify } from "@/lib/notify";

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { requesterName } = body;

    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];

    if (task.posted_by !== requesterName?.trim()) {
      return NextResponse.json({ error: "Kun opgavestilleren kan annullere opgaven." }, { status: 403 });
    }
    if (!["open", "matched"].includes(task.status)) {
      return NextResponse.json({ error: "Denne opgave kan ikke annulleres." }, { status: 400 });
    }

    if (task.payment_status === "held" && task.stripe_payment_intent_id) {
      const stripe = getStripe();
      await stripe.refunds.create({ payment_intent: task.stripe_payment_intent_id });
      await pool.query("UPDATE tasks SET payment_status = 'refunded' WHERE id = $1", [id]);
    }

    await pool.query("UPDATE tasks SET status = 'cancelled', cancelled_at = now() WHERE id = $1", [id]);

    if (task.accepted_bid_id) {
      const { rows: bidRows } = await pool.query("SELECT bidder_name FROM bids WHERE id = $1", [task.accepted_bid_id]);
      if (bidRows[0]) {
        await notify(bidRows[0].bidder_name, "task_cancelled", id, `"${task.title}" er blevet annulleret af opgavestilleren.`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe-fejl i app/api/tasks/[id]/cancel/route.js:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke annullere opgaven." }, { status: 500 });
  }
}
