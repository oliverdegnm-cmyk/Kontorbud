import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { levelForEarnings } from "@/lib/fees";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const name = decodeURIComponent(params.name);
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(b.amount_value), 0)::int AS earnings
       FROM tasks t
       JOIN bids b ON b.id = t.accepted_bid_id
       WHERE t.status = 'matched'
         AND b.bidder_name = $1
         AND t.accepted_at >= now() - interval '30 days'`,
      [name]
    );
    const earnings30d = rows[0].earnings;
    const level = levelForEarnings(earnings30d);
    return NextResponse.json({ name, earnings30d, level });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke beregne niveau." }, { status: 500 });
  }
}
