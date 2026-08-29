import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { bidId, requesterName } = body;

    if (!bidId || !requesterName?.trim()) {
      return NextResponse.json({ error: "Mangler bud eller navn." }, { status: 400 });
    }

    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];

    if (task.posted_by !== requesterName.trim()) {
      return NextResponse.json({ error: "Kun opgavestilleren kan vælge et bud." }, { status: 403 });
    }
    if (task.status !== "open") {
      return NextResponse.json({ error: "Opgaven er allerede tildelt." }, { status: 400 });
    }

    const { rows: bidRows } = await pool.query("SELECT id FROM bids WHERE id = $1 AND task_id = $2", [bidId, id]);
    if (bidRows.length === 0) {
      return NextResponse.json({ error: "Buddet findes ikke på denne opgave." }, { status: 404 });
    }

    await pool.query("UPDATE tasks SET status = 'matched', accepted_bid_id = $1, accepted_at = now() WHERE id = $2", [bidId, id]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke vælge buddet." }, { status: 500 });
  }
}
