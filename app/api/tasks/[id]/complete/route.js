import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { notify } from "@/lib/notify";
import { feeBreakdown, formatKr, completionRate, levelFor } from "@/lib/fees";

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
      return NextResponse.json({ error: "Kun opgavestilleren kan markere opgaven som udført." }, { status: 403 });
    }
    if (task.status !== "matched") {
      return NextResponse.json({ error: "Kun tildelte opgaver kan markeres som udført." }, { status: 400 });
    }

    const { rows: bidRows } = await pool.query("SELECT * FROM bids WHERE id = $1", [task.accepted_bid_id]);
    const bid = bidRows[0];
    if (!bid) {
      return NextResponse.json({ error: "Kunne ikke finde det valgte bud." }, { status: 400 });
    }

    // Udbetal via Stripe, hvis opgaven reelt blev betalt gennem platformen.
    if (task.payment_status === "held" && task.stripe_payment_intent_id) {
      const { rows: profileRows } = await pool.query("SELECT stripe_account_id FROM profiles WHERE name = $1", [bid.bidder_name]);
      const stripeAccountId = profileRows[0]?.stripe_account_id;
      if (!stripeAccountId) {
        return NextResponse.json({ error: "Kunne ikke finde hjælperens Stripe-konto." }, { status: 400 });
      }

      const { rows: earningsRows } = await pool.query(
        `SELECT COALESCE(SUM(b.amount_value), 0)::int AS earnings
         FROM tasks t JOIN bids b ON b.id = t.accepted_bid_id
         WHERE t.status IN ('matched', 'completed') AND b.bidder_name = $1 AND t.accepted_at >= now() - interval '30 days'`,
        [bid.bidder_name]
      );
      const { rows: recentRows } = await pool.query(
        `SELECT t.status FROM tasks t JOIN bids b ON b.id = t.accepted_bid_id
         WHERE b.bidder_name = $1 ORDER BY t.accepted_at DESC LIMIT 20`,
        [bid.bidder_name]
      );
      const completed = recentRows.filter((r) => r.status === "completed").length;
      const cancelled = recentRows.filter((r) => r.status === "cancelled").length;
      const rate = completionRate(completed, cancelled);
      const { level, net } = feeBreakdown(bid.amount_value, earningsRows[0].earnings, rate);

      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(task.stripe_payment_intent_id);
      const chargeId = paymentIntent.latest_charge;

      await stripe.transfers.create({
        amount: Math.round(net * 100),
        currency: "dkk",
        destination: stripeAccountId,
        source_transaction: chargeId || undefined,
        transfer_group: `task_${id}`,
        metadata: { task_id: String(id), level: level.key, fee_percent: String(level.feePercent) },
      });

      await pool.query("UPDATE tasks SET payment_status = 'released' WHERE id = $1", [id]);
    }

    await pool.query("UPDATE tasks SET status = 'completed', completed_at = now() WHERE id = $1", [id]);

    await notify(bid.bidder_name, "task_completed", id, `"${task.title}" er markeret som udført, og betalingen er frigivet. Giv gerne en anmeldelse.`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe-fejl i app/api/tasks/[id]/complete/route.js:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke markere opgaven som udført." }, { status: 500 });
  }
}
