import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { notify } from "@/lib/notify";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const { searchParams } = new URL(request.url);
    const bidderName = searchParams.get("bidderName");
    if (!bidderName) {
      return NextResponse.json({ error: "Mangler bidderName." }, { status: 400 });
    }
    const { rows } = await pool.query(
      "SELECT * FROM messages WHERE task_id = $1 AND bidder_name = $2 ORDER BY created_at ASC",
      [id, bidderName]
    );
    return NextResponse.json({
      messages: rows.map((m) => ({
        id: m.id,
        senderName: m.sender_name,
        body: m.body,
        attachmentUrl: m.attachment_url,
        attachmentName: m.attachment_name,
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente beskeder." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { bidderName, senderName, text, attachmentUrl, attachmentName } = body;

    if (!bidderName?.trim() || !senderName?.trim() || (!text?.trim() && !attachmentUrl)) {
      return NextResponse.json({ error: "Besked mangler indhold." }, { status: 400 });
    }

    const { rows: taskRows } = await pool.query("SELECT posted_by, title FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const { posted_by: postedBy, title } = taskRows[0];

    if (senderName.trim() !== postedBy && senderName.trim() !== bidderName.trim()) {
      return NextResponse.json({ error: "Du har ikke adgang til denne samtale." }, { status: 403 });
    }

    const { rows } = await pool.query(
      "INSERT INTO messages (task_id, bidder_name, sender_name, body, attachment_url, attachment_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [id, bidderName.trim(), senderName.trim(), text?.trim() || "", attachmentUrl || null, attachmentName || null]
    );

    const recipient = senderName.trim() === postedBy ? bidderName.trim() : postedBy;
    await notify(recipient, "new_message", id, `Ny besked fra ${senderName.trim()} om "${title}".`);

    const m = rows[0];
    return NextResponse.json(
      {
        message: {
          id: m.id,
          senderName: m.sender_name,
          body: m.body,
          attachmentUrl: m.attachment_url,
          attachmentName: m.attachment_name,
          createdAt: m.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke sende besked." }, { status: 500 });
  }
}
