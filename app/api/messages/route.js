import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function GET(request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    if (!name) return NextResponse.json({ error: "Mangler name." }, { status: 400 });

    const { rows } = await pool.query(
      `WITH threads AS (
         SELECT m.task_id, m.bidder_name, MAX(m.created_at) AS last_at
         FROM messages m
         JOIN tasks t ON t.id = m.task_id
         WHERE m.bidder_name = $1 OR t.posted_by = $1
         GROUP BY m.task_id, m.bidder_name
       )
       SELECT th.task_id, th.bidder_name, th.last_at, t.title, t.posted_by, t.status,
         (SELECT body FROM messages m2 WHERE m2.task_id = th.task_id AND m2.bidder_name = th.bidder_name ORDER BY created_at DESC LIMIT 1) AS last_body,
         (SELECT sender_name FROM messages m2 WHERE m2.task_id = th.task_id AND m2.bidder_name = th.bidder_name ORDER BY created_at DESC LIMIT 1) AS last_sender
       FROM threads th
       JOIN tasks t ON t.id = th.task_id
       ORDER BY th.last_at DESC`,
      [name]
    );

    const threads = rows.map((r) => ({
      taskId: r.task_id,
      bidderName: r.bidder_name,
      taskTitle: r.title,
      taskStatus: r.status,
      counterpart: r.posted_by === name ? r.bidder_name : r.posted_by,
      lastBody: r.last_body,
      lastSender: r.last_sender,
      lastAt: r.last_at,
    }));

    return NextResponse.json({ threads });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente beskeder." }, { status: 500 });
  }
}
