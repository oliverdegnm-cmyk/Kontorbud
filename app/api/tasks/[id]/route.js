import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const { rows: bidRows } = await pool.query("SELECT * FROM bids WHERE task_id = $1 ORDER BY created_at ASC", [id]);
    const t = taskRows[0];
    return NextResponse.json({
      task: {
        id: t.id,
        caseNo: t.case_no,
        title: t.title,
        category: t.category,
        budget: t.budget,
        deadline: t.deadline,
        description: t.description,
        postedBy: t.posted_by,
        status: t.status,
        acceptedBidId: t.accepted_bid_id,
        acceptedAt: t.accepted_at,
        completedAt: t.completed_at,
        cancelledAt: t.cancelled_at,
        paymentStatus: t.payment_status,
        area: t.area,
        bids: bidRows.map((b) => ({
          id: b.id,
          bidderName: b.bidder_name,
          amount: b.amount,
          amountValue: b.amount_value,
          message: b.message,
          contactEmail: b.contact_email,
        })),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente opgaven." }, { status: 500 });
  }
}
