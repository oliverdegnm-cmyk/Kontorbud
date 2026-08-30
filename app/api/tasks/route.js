import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { geocodeArea } from "@/lib/geocode";

function mapTask(row, bids, attachments) {
  return {
    id: row.id,
    caseNo: row.case_no,
    title: row.title,
    category: row.category,
    budget: row.budget,
    deadline: row.deadline,
    description: row.description,
    postedBy: row.posted_by,
    status: row.status,
    acceptedBidId: row.accepted_bid_id,
    acceptedAt: row.accepted_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    paymentStatus: row.payment_status,
    area: row.area,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,
    attachments: (attachments || []).map((a) => ({ id: a.id, url: a.url, filename: a.filename })),
    bids: bids.map((b) => ({
      id: b.id,
      bidderName: b.bidder_name,
      amount: b.amount,
      amountValue: b.amount_value,
      message: b.message,
      contactEmail: b.contact_email,
      createdAt: b.created_at,
    })),
  };
}

export async function GET() {
  try {
    await ensureSchema();
    const { rows: taskRows } = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");

    const needsGeocode = taskRows.filter((t) => t.area && (t.lat === null || t.lng === null)).slice(0, 3);
    for (const t of needsGeocode) {
      const coords = await geocodeArea(t.area);
      if (coords) {
        await pool.query("UPDATE tasks SET lat = $1, lng = $2 WHERE id = $3", [coords.lat, coords.lng, t.id]);
        t.lat = coords.lat;
        t.lng = coords.lng;
      }
    }

    const { rows: bidRows } = await pool.query("SELECT * FROM bids ORDER BY created_at ASC");
    const { rows: attRows } = await pool.query("SELECT * FROM task_attachments ORDER BY created_at ASC");
    const tasks = taskRows.map((t) =>
      mapTask(t, bidRows.filter((b) => b.task_id === t.id), attRows.filter((a) => a.task_id === t.id))
    );
    return NextResponse.json({ tasks });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente opgaver. Tjek at DATABASE_URL er sat korrekt." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { title, category, budget, deadline, description, postedBy, area, attachments } = body;

    if (!title?.trim() || !description?.trim() || !postedBy?.trim()) {
      return NextResponse.json({ error: "Titel, beskrivelse og navn er påkrævet." }, { status: 400 });
    }

    const { rows: countRows } = await pool.query("SELECT COUNT(*)::int AS count FROM tasks");
    const caseNo = `K-2026-${String(100 + countRows[0].count).padStart(3, "0")}`;

    const coords = await geocodeArea(area);

    const { rows } = await pool.query(
      `INSERT INTO tasks (case_no, title, category, budget, deadline, description, posted_by, area, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        caseNo,
        title.trim(),
        category || "Andet",
        budget?.trim() || "Ikke angivet",
        deadline?.trim() || "Ikke angivet",
        description.trim(),
        postedBy.trim(),
        area?.trim() || null,
        coords?.lat ?? null,
        coords?.lng ?? null,
      ]
    );
    const task = rows[0];

    let attRows = [];
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const a of attachments) {
        if (!a?.url || !a?.filename) continue;
        const { rows: inserted } = await pool.query(
          "INSERT INTO task_attachments (task_id, url, filename, uploaded_by) VALUES ($1, $2, $3, $4) RETURNING *",
          [task.id, a.url, a.filename, postedBy.trim()]
        );
        attRows.push(inserted[0]);
      }
    }

    return NextResponse.json({ task: mapTask(task, [], attRows) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke oprette opgaven." }, { status: 500 });
  }
}
