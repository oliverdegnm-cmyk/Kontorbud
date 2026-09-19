import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { notify } from "@/lib/notify";
import { requireAdmin } from "@/lib/adminAuth";
import { SUPPORT_SENDER } from "@/lib/support";

// Beskeder mellem en bruger og Kontorbud support - genbruger "messages"-tabellen,
// men uden en tilknyttet opgave (task_id = NULL), nøglet på bidder_name alene.
// Det betyder, at både admins hurtige beskeder og brugerens svar ender i samme
// tråd, og at tråden dukker op i brugerens almindelige "Beskeder"-indbakke.

export async function GET(request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const bidderName = searchParams.get("bidderName");
    if (!bidderName?.trim()) return NextResponse.json({ error: "Mangler bidderName." }, { status: 400 });

    const { rows } = await pool.query(
      "SELECT * FROM messages WHERE task_id IS NULL AND bidder_name = $1 ORDER BY created_at ASC",
      [bidderName.trim()]
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

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { bidderName, senderName, text, attachmentUrl, attachmentName } = body;
    const recipient = bidderName?.trim();

    if (!recipient || !senderName?.trim() || (!text?.trim() && !attachmentUrl)) {
      return NextResponse.json({ error: "Besked mangler indhold." }, { status: 400 });
    }

    // Svaret er enten fra en administrator (afsendernavnet tvinges til det faste
    // "Kontorbud support", uanset hvilken admin der faktisk skriver - så fremstår
    // det ens for brugeren), eller fra brugeren selv om sin egen sag.
    const admin = await requireAdmin();
    let finalSender;
    if (admin) {
      finalSender = SUPPORT_SENDER;
    } else if (senderName.trim() === recipient) {
      finalSender = recipient;
    } else {
      return NextResponse.json({ error: "Du har ikke adgang til denne samtale." }, { status: 403 });
    }

    const { rows } = await pool.query(
      "INSERT INTO messages (task_id, bidder_name, sender_name, body, attachment_url, attachment_name) VALUES (NULL, $1, $2, $3, $4, $5) RETURNING *",
      [recipient, finalSender, text?.trim() || "", attachmentUrl || null, attachmentName || null]
    );

    const origin = request.headers.get("origin") || undefined;
    if (admin) {
      await notify(recipient, "admin_message", null, `Besked fra Kontorbud support: ${text?.trim() || "Se vedhæftning"}`, origin);
    } else {
      // Ingen enkelt admin "ejer" sagen, så alle administratorer får besked om svaret.
      const { rows: admins } = await pool.query("SELECT name FROM users WHERE is_admin = true");
      await Promise.all(
        admins.map((a) => notify(a.name, "support_reply", null, `${recipient} har svaret i support-beskeder: ${text?.trim() || "Se vedhæftning"}`, origin))
      );
    }

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
