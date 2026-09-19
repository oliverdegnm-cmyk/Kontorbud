import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    await ensureSchema();
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });

    const { rows } = await pool.query(
      `SELECT DISTINCT ON (bidder_name) bidder_name, body, sender_name, created_at
       FROM messages
       WHERE task_id IS NULL
       ORDER BY bidder_name, created_at DESC`
    );
    const threads = rows
      .map((r) => ({
        userName: r.bidder_name,
        lastBody: r.body,
        lastSender: r.sender_name,
        lastAt: r.created_at,
      }))
      .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

    return NextResponse.json({ threads });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente support-tråde." }, { status: 500 });
  }
}
