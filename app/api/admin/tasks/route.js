import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });

    const { rows } = await pool.query(
      `SELECT t.*, COUNT(b.id)::int AS bid_count
       FROM tasks t
       LEFT JOIN bids b ON b.task_id = t.id
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    );

    return NextResponse.json({
      tasks: rows.map((t) => ({
        id: t.id,
        caseNo: t.case_no,
        title: t.title,
        category: t.category,
        status: t.status,
        paymentStatus: t.payment_status,
        postedBy: t.posted_by,
        bidCount: t.bid_count,
        pendingBidId: t.pending_bid_id,
        createdAt: t.created_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente opgaver." }, { status: 500 });
  }
}
