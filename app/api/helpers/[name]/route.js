import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { levelFor, completionRate } from "@/lib/fees";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const name = decodeURIComponent(params.name);

    const { rows: earningsRows } = await pool.query(
      `SELECT COALESCE(SUM(b.amount_value), 0)::int AS earnings
       FROM tasks t
       JOIN bids b ON b.id = t.accepted_bid_id
       WHERE t.status IN ('matched', 'completed')
         AND b.bidder_name = $1
         AND t.accepted_at >= now() - interval '30 days'`,
      [name]
    );
    const earnings30d = earningsRows[0].earnings;

    const { rows: recentRows } = await pool.query(
      `SELECT t.status
       FROM tasks t
       JOIN bids b ON b.id = t.accepted_bid_id
       WHERE b.bidder_name = $1
       ORDER BY t.accepted_at DESC
       LIMIT 20`,
      [name]
    );
    const completedCount = recentRows.filter((r) => r.status === "completed").length;
    const cancelledCount = recentRows.filter((r) => r.status === "cancelled").length;
    const rate = completionRate(completedCount, cancelledCount);

    const level = levelFor(earnings30d, rate);

    const { rows: reviewRows } = await pool.query(
      `SELECT COALESCE(AVG(rating), 0)::float AS avg_rating, COUNT(*)::int AS count
       FROM reviews WHERE reviewee_name = $1`,
      [name]
    );

    return NextResponse.json({
      name,
      earnings30d,
      completionRate: rate,
      completedCount,
      cancelledCount,
      level,
      avgRating: reviewRows[0].avg_rating,
      reviewCount: reviewRows[0].count,
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke beregne niveau." }, { status: 500 });
  }
}
