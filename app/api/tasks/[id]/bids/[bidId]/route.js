import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    await ensureSchema();
    const taskId = Number(params.id);
    const bidId = Number(params.bidId);
    const { searchParams } = new URL(request.url);
    const requesterName = searchParams.get("requesterName");

    const { rows: taskRows } = await pool.query("SELECT status FROM tasks WHERE id = $1", [taskId]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    if (taskRows[0].status !== "open") {
      return NextResponse.json({ error: "Bud kan kun trækkes tilbage, mens opgaven er åben." }, { status: 400 });
    }

    const { rows: bidRows } = await pool.query("SELECT * FROM bids WHERE id = $1 AND task_id = $2", [bidId, taskId]);
    if (bidRows.length === 0) {
      return NextResponse.json({ error: "Buddet findes ikke." }, { status: 404 });
    }
    if (bidRows[0].bidder_name !== requesterName?.trim()) {
      return NextResponse.json({ error: "Du kan kun trække dine egne bud tilbage." }, { status: 403 });
    }

    await pool.query("DELETE FROM bids WHERE id = $1", [bidId]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke trække buddet tilbage." }, { status: 500 });
  }
}
