import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { notify } from "@/lib/notify";
import { feeBreakdown, formatKr, completionRate, levelFor } from "@/lib/fees";

export async function POST(request, { params }) {
  await ensureSchema();
  const id = Number(params.id);
  const body = await request.json();
  const { requesterName } = body;

  // Hele tjekket + Stripe-overførslen + statusskiftet køres inden for én
  // databasetransaktion med en rækkelås ("SELECT ... FOR UPDATE") på selve
  // opgaven. Det forhindrer, at to samtidige kald (dobbeltklik på "Marker
  // som udført", eller en gentaget netværksanmodning) begge når at se
  // status = "matched" og derfor begge opretter en Stripe-overførsel til
  // hjælperen - det andet kald venter på låsen, ser status = "completed",
  // når det er dens tur, og stopper uden at overføre penge igen.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: taskRows } = await client.query("SELECT * FROM tasks WHERE id = $1 FOR UPDATE", [id]);
    if (taskRows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];

    if (task.posted_by !== requesterName?.trim()) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Kun opgavestilleren kan markere opgaven som udført." }, { status: 403 });
    }
    if (task.status !== "matched") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Kun tildelte opgaver kan markeres som udført." }, { status: 400 });
    }

    const { rows: bidRows } = await client.query("SELECT * FROM bids WHERE id = $1", [task.accepted_bid_id]);
    const bid = bidRows[0];
    if (!bid) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Kunne ikke finde det valgte bud." }, { status: 400 });
    }

    // Udbetal via Stripe, hvis opgaven reelt blev betalt gennem platformen.
    if (task.payment_status === "held" && task.stripe_payment_intent_id) {
      const { rows: profileRows } = await client.query("SELECT stripe_account_id FROM profiles WHERE name = $1", [bid.bidder_name]);
      const stripeAccountId = profileRows[0]?.stripe_account_id;
      if (!stripeAccountId) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Kunne ikke finde hjælperens Stripe-konto." }, { status: 400 });
      }

      const stripe = getStripe();

      // Bekræft kontoen faktisk findes i den tilstand (test/live), API-nøglen
      // kører i, før vi forsøger en overførsel - ellers får brugeren en kryptisk
      // "No such destination"-fejl fra Stripe, hvis kontoen blev forbundet, mens
      // platformen kørte i en anden tilstand (f.eks. sandbox før skiftet til Live).
      try {
        await stripe.accounts.retrieve(stripeAccountId);
      } catch (err) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: `${bid.bidder_name} skal forbinde deres Stripe-konto igen, før udbetalingen kan gennemføres (den nuværende forbindelse er ikke længere gyldig).` },
          { status: 400 }
        );
      }

      const { rows: earningsRows } = await client.query(
        `SELECT COALESCE(SUM(b.amount_value), 0)::int AS earnings
         FROM tasks t JOIN bids b ON b.id = t.accepted_bid_id
         WHERE t.status IN ('matched', 'completed') AND b.bidder_name = $1 AND t.accepted_at >= now() - interval '30 days'`,
        [bid.bidder_name]
      );
      const { rows: recentRows } = await client.query(
        `SELECT t.status FROM tasks t JOIN bids b ON b.id = t.accepted_bid_id
         WHERE b.bidder_name = $1 ORDER BY t.accepted_at DESC LIMIT 20`,
        [bid.bidder_name]
      );
      const completed = recentRows.filter((r) => r.status === "completed").length;
      const cancelled = recentRows.filter((r) => r.status === "cancelled").length;
      const rate = completionRate(completed, cancelled);
      const { level, net } = feeBreakdown(bid.amount_value, earningsRows[0].earnings, rate);

      const paymentIntent = await stripe.paymentIntents.retrieve(task.stripe_payment_intent_id);
      const chargeId = paymentIntent.latest_charge;

      // idempotencyKey er endnu et lag beskyttelse oveni rækkelåsen ovenfor:
      // hvis selve netværkskaldet til Stripe fejler/timer ud efter at Stripe
      // har oprettet overførslen, men før vi får svar tilbage, sikrer nøglen,
      // at et automatisk gentaget forsøg (fra Stripes egen SDK, eller en ny
      // anmodning med samme opgave-id) ikke opretter en ny, ekstra overførsel.
      await stripe.transfers.create(
        {
          amount: Math.round(net * 100),
          currency: "dkk",
          destination: stripeAccountId,
          source_transaction: chargeId || undefined,
          transfer_group: `task_${id}`,
          metadata: { task_id: String(id), level: level.key, fee_percent: String(level.feePercent) },
        },
        { idempotencyKey: `complete-task-${id}` }
      );

      await client.query(
        "UPDATE tasks SET payment_status = 'released', status = 'completed', completed_at = now() WHERE id = $1",
        [id]
      );
    } else {
      await client.query("UPDATE tasks SET status = 'completed', completed_at = now() WHERE id = $1", [id]);
    }

    await client.query("COMMIT");

    await notify(bid.bidder_name, "task_completed", id, `"${task.title}" er markeret som udført, og betalingen er frigivet. Giv gerne en anmeldelse.`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Kunne ikke rulle transaktionen tilbage:", rollbackErr);
    }
    console.error("Stripe-fejl i app/api/tasks/[id]/complete/route.js:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke markere opgaven som udført." }, { status: 500 });
  } finally {
    client.release();
  }
}
