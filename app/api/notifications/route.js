import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function GET(request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    if (!name) return NextResponse.json({ error: "Mangler name." }, { status: 400 });

    const { rows } = await pool.query(
      "SELECT * FROM notifications WHERE recipient_name = $1 ORDER BY created_at DESC LIMIT 30",
      [name]
    );
    const { rows: unreadRows } = await pool.query(
      "SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_name = $1 AND is_read = false",
      [name]
    );

    return NextResponse.json({
      notifications: rows.map((n) => ({
        id: n.id,
        type: n.type,
        taskId: n.task_id,
        body: n.body,
        isRead: n.is_read,
        createdAt: n.created_at,
      })),
      unreadCount: unreadRows[0].count,
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente notifikationer." }, { status: 500 });
  }
}
