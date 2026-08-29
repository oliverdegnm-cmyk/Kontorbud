import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { formatKr } from "@/lib/fees";

function parseAmount(input) {
  if (typeof input === "number") return Math.round(input);
  const digits = String(input || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { bidderName, amount, message, contactEmail } = body;

    const amountValue = parseAmount(amount);
    if (!bidderName?.trim() || !amountValue || amountValue <= 0) {
      return NextResponse.json({ error: "Navn og et gyldigt beløb i kr er påkrævet." }, { status: 400 });
    }

    const { rows: taskRows } = await pool.query("SELECT id, status FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    if (taskRows[0].status !== "open") {
      return NextResponse.json({ error: "Opgaven er allerede tildelt og modtager ikke flere bud." }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO bids (task_id, bidder_name, amount, amount_value, message, contact_email)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, bidderName.trim(), formatKr(amountValue), amountValue, message?.trim() || "Ingen besked tilføjet.", contactEmail?.trim() || null]
    );

    const b = rows[0];
    return NextResponse.json(
      { bid: { id: b.id, bidderName: b.bidder_name, amount: b.amount, amountValue: b.amount_value, message: b.message, contactEmail: b.contact_email } },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke afgive bud." }, { status: 500 });
  }
}
