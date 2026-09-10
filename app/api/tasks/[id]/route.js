import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { geocodeArea } from "@/lib/geocode";

function mapFullTask(t, bidRows, attRows, revealAddress) {
  return {
    id: t.id,
    caseNo: t.case_no,
    title: t.title,
    category: t.category,
    budget: t.budget,
    deadline: t.deadline,
    deadlineDate: t.deadline_date,
    description: t.description,
    postedBy: t.posted_by,
    posterType: t.poster_type,
    companyName: t.company_name,
    cvrNumber: t.cvr_number,
    status: t.status,
    acceptedBidId: t.accepted_bid_id,
    acceptedAt: t.accepted_at,
    completedAt: t.completed_at,
    cancelledAt: t.cancelled_at,
    paymentStatus: t.payment_status,
    area: t.area,
    locationType: t.location_type,
    // Den præcise adresse er kun med i svaret, hvis den, der spørger, enten er
    // opgavestilleren selv, eller den hjælper, hvis bud er blevet valgt -
    // ikke til almindelige besøgende eller andre bydere.
    address: revealAddress ? t.address : null,
    lat: t.lat,
    lng: t.lng,
    attachments: (attRows || []).map((a) => ({ id: a.id, url: a.url, filename: a.filename })),
    bids: bidRows.map((b) => ({
      id: b.id,
      bidderName: b.bidder_name,
      amount: b.amount,
      amountValue: b.amount_value,
      message: b.message,
      contactEmail: b.contact_email,
      verified: !!b.stripe_payouts_enabled,
    })),
  };
}

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const { searchParams } = new URL(request.url);
    const viewerName = searchParams.get("viewerName");

    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];
    const { rows: bidRows } = await pool.query("SELECT b.*, p.stripe_payouts_enabled FROM bids b LEFT JOIN profiles p ON p.name = b.bidder_name WHERE b.task_id = $1 ORDER BY b.created_at ASC", [id]);
    const { rows: attRows } = await pool.query("SELECT * FROM task_attachments WHERE task_id = $1 ORDER BY created_at ASC", [id]);
    const { rows: posterProfileRows } = await pool.query("SELECT stripe_payouts_enabled FROM profiles WHERE name = $1", [taskRows[0].posted_by]);

    const acceptedBid = bidRows.find((b) => b.id === task.accepted_bid_id);
    const revealAddress = !!viewerName && (viewerName === task.posted_by || (acceptedBid && viewerName === acceptedBid.bidder_name));

    return NextResponse.json({ task: { ...mapFullTask(task, bidRows, attRows, revealAddress), posterVerified: !!posterProfileRows[0]?.stripe_payouts_enabled } });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente opgaven." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { requesterName, title, category, budget, deadline, deadlineDate, description, area, locationType, address, newAttachments, posterType, companyName } = body;

    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];

    if (task.posted_by !== requesterName?.trim()) {
      return NextResponse.json({ error: "Kun opgavestilleren kan redigere opgaven." }, { status: 403 });
    }
    if (task.status !== "open") {
      return NextResponse.json({ error: "Opgaven kan kun redigeres, mens den er åben." }, { status: 400 });
    }
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Titel og beskrivelse er påkrævet." }, { status: 400 });
    }

    const isInPerson = locationType === "in_person";
    let coords = { lat: task.lat, lng: task.lng };
    if (isInPerson && (area?.trim() || null) !== task.area) {
      coords = (await geocodeArea(area)) || { lat: null, lng: null };
    }
    if (!isInPerson) coords = { lat: null, lng: null };

    const { rows } = await pool.query(
      `UPDATE tasks SET title = $1, category = $2, budget = $3, deadline = $4, deadline_date = $5, description = $6, area = $7, lat = $8, lng = $9, poster_type = $10, company_name = $11, location_type = $12, address = $13
       WHERE id = $14 RETURNING *`,
      [
        title.trim(),
        category || task.category,
        budget?.trim() || "Ikke angivet",
        deadlineDate ? null : deadline?.trim() || "Fleksibel",
        deadlineDate || null,
        description.trim(),
        isInPerson ? area?.trim() || null : null,
        coords.lat,
        coords.lng,
        posterType === "business" ? "business" : "private",
        posterType === "business" ? companyName?.trim() || null : null,
        isInPerson ? "in_person" : "remote",
        isInPerson ? address?.trim() || null : null,
        id,
      ]
    );

    if (Array.isArray(newAttachments)) {
      for (const a of newAttachments) {
        if (!a?.url || !a?.filename) continue;
        await pool.query(
          "INSERT INTO task_attachments (task_id, url, filename, uploaded_by) VALUES ($1, $2, $3, $4)",
          [id, a.url, a.filename, requesterName.trim()]
        );
      }
    }

    const { rows: bidRows } = await pool.query("SELECT b.*, p.stripe_payouts_enabled FROM bids b LEFT JOIN profiles p ON p.name = b.bidder_name WHERE b.task_id = $1 ORDER BY b.created_at ASC", [id]);
    const { rows: attRows } = await pool.query("SELECT * FROM task_attachments WHERE task_id = $1 ORDER BY created_at ASC", [id]);
    return NextResponse.json({ task: mapFullTask(rows[0], bidRows, attRows, true) });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke opdatere opgaven." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const { searchParams } = new URL(request.url);
    const requesterName = searchParams.get("requesterName");

    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];

    if (task.posted_by !== requesterName?.trim()) {
      return NextResponse.json({ error: "Kun opgavestilleren kan slette opgaven." }, { status: 403 });
    }
    const { rows: bidCountRows } = await pool.query("SELECT COUNT(*)::int AS count FROM bids WHERE task_id = $1", [id]);
    if (task.status !== "open" || bidCountRows[0].count > 0) {
      return NextResponse.json({ error: "Opgaver med bud kan ikke slettes - annullér den i stedet." }, { status: 400 });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke slette opgaven." }, { status: 500 });
  }
}
