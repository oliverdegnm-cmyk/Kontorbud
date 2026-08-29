import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { bidderName, amount, message } = body;

    if (!bidderName?.trim() || !amount?.trim()) {
      return NextResponse.json({ error: "Navn og beløb er påkrævet." }, { status: 400 });
    }

    const { rows: taskRows } = await pool.query("SELECT id FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }

    const { rows } = await pool.query(
      `INSERT INTO bids (task_id, bidder_name, amount, message) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, bidderName.trim(), amount.trim(), message?.trim() || "Ingen besked tilføjet."]
    );

    const b = rows[0];
    return NextResponse.json({ bid: { id: b.id, bidderName: b.bidder_name, amount: b.amount, message: b.message } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke afgive bud." }, { status: 500 });
  }
}
