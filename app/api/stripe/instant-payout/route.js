import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// Mindste antal fuldførte opgaver, en hjælper skal have i historikken, før
// Instant Payout tilbydes - beskytter mod at helt nye/uprøvede konti (som
// platformen endnu ikke har nogen erfaring med) kan bede om at få hele deres
// saldo udbetalt øjeblikkeligt. Samme tærskel som i status.md er beskrevet.
const INSTANT_PAYOUT_MIN_COMPLETED = 3;

// Denne route kaldes af hjælperen selv, fra deres egen betalingsside - IKKE
// af opgavestilleren. Instant Payout handler om AT FLYTTE penge, der allerede
// er frigivet til hjælperens Stripe-konto (se app/api/tasks/[id]/complete),
// videre til banken med det samme i stedet for at vente på Stripes normale
// udbetalingsplan. Det ændrer ikke på, hvornår pengene bliver frigivet i
// første omgang - det afgøres stadig udelukkende af, at opgavestilleren
// trykker "Marker som udført".
export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { name } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Mangler navn." }, { status: 400 });
    }
    const trimmedName = name.trim();

    const { rows: profileRows } = await pool.query(
      "SELECT stripe_account_id, stripe_payouts_enabled FROM profiles WHERE name = $1",
      [trimmedName]
    );
    const profile = profileRows[0];
    if (!profile?.stripe_account_id || !profile.stripe_payouts_enabled) {
      return NextResponse.json(
        { error: "Du skal have en færdigoprettet Stripe-konto, før du kan bruge Instant Payout." },
        { status: 400 }
      );
    }

    // Samme historik-tjek som niveauberegningen (se /api/helpers/[name]) -
    // kræver et minimum af gennemførte opgaver, før Instant Payout er muligt.
    const { rows: recentRows } = await pool.query(
      `SELECT t.status FROM tasks t JOIN bids b ON b.id = t.accepted_bid_id
       WHERE b.bidder_name = $1 ORDER BY t.accepted_at DESC LIMIT 20`,
      [trimmedName]
    );
    const completed = recentRows.filter((r) => r.status === "completed").length;
    if (completed < INSTANT_PAYOUT_MIN_COMPLETED) {
      return NextResponse.json(
        {
          error: `Instant Payout kræver mindst ${INSTANT_PAYOUT_MIN_COMPLETED} gennemførte opgaver på platformen (du har ${completed} lige nu).`,
        },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Instant Payout kan kun trække på den del af saldoen, Stripe selv har
    // markeret som "instant available" - IKKE hele saldoen. Nye/uprøvede
    // konti kan derfor stadig opleve et beløb på 0, selvom pengene allerede
    // er overført til kontoen: Stripes egen risikovurdering holder dem
    // tilbage nogle dage (se status.md, 13/9). Det er en normal, forventet
    // tilstand her - ikke en fejl.
    const balance = await stripe.balance.retrieve({ stripeAccount: profile.stripe_account_id });
    const instantEntry = (balance.instant_available || []).find((b) => b.currency === "dkk");
    const availableAmount = instantEntry?.amount || 0;

    if (availableAmount <= 0) {
      return NextResponse.json({
        ok: true,
        paid: false,
        message:
          "Der er ikke noget til rådighed for Instant Payout lige nu - beløbet holdes stadig af Stripe. Det udbetales automatisk til din bank om kort tid, via den normale udbetalingsplan.",
      });
    }

    // idempotencyKey er afgrænset til dette minut, så et dobbeltklik ikke kan
    // udløse to udbetalinger ved et uheld - men blokerer ikke et nyt, ægte
    // forsøg senere, hvis der igen bliver noget til rådighed.
    await stripe.payouts.create(
      { amount: availableAmount, currency: "dkk", method: "instant", metadata: { helper_name: trimmedName } },
      {
        stripeAccount: profile.stripe_account_id,
        idempotencyKey: `instant-payout-${profile.stripe_account_id}-${Math.floor(Date.now() / 60000)}`,
      }
    );

    return NextResponse.json({ ok: true, paid: true, amount: availableAmount / 100 });
  } catch (err) {
    console.error("Stripe-fejl i app/api/stripe/instant-payout/route.js:", err);
    const message =
      err.code === "balance_insufficient"
        ? "Der er ikke nok til rådighed for Instant Payout lige nu. Prøv igen senere, eller vent på den normale udbetaling."
        : err.message || "Kunne ikke gennemføre Instant Payout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
