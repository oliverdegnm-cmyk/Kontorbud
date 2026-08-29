import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { notify } from "@/lib/notify";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const { rows } = await pool.query("SELECT * FROM reviews WHERE task_id = $1 ORDER BY created_at ASC", [id]);
    return NextResponse.json({
      reviews: rows.map((r) => ({
        id: r.id,
        reviewerName: r.reviewer_name,
        revieweeName: r.reviewee_name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente anmeldelser." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    const body = await request.json();
    const { reviewerName, rating, comment } = body;

    if (!reviewerName?.trim() || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Angiv en vurdering fra 1 til 5 stjerner." }, { status: 400 });
    }

    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];
    if (task.status !== "completed") {
      return NextResponse.json({ error: "Kun udførte opgaver kan anmeldes." }, { status: 400 });
    }

    const { rows: bidRows } = await pool.query("SELECT bidder_name FROM bids WHERE id = $1", [task.accepted_bid_id]);
    const bidderName = bidRows[0]?.bidder_name;
    if (!bidderName) {
      return NextResponse.json({ error: "Kunne ikke finde den tildelte byder." }, { status: 400 });
    }

    let revieweeName;
    if (reviewerName.trim() === task.posted_by) revieweeName = bidderName;
    else if (reviewerName.trim() === bidderName) revieweeName = task.posted_by;
    else return NextResponse.json({ error: "Du var ikke en del af denne opgave." }, { status: 403 });

    const { rows: existing } = await pool.query(
      "SELECT id FROM reviews WHERE task_id = $1 AND reviewer_name = $2",
      [id, reviewerName.trim()]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "Du har allerede anmeldt denne opgave." }, { status: 400 });
    }

    const { rows } = await pool.query(
      "INSERT INTO reviews (task_id, reviewer_name, reviewee_name, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, reviewerName.trim(), revieweeName, rating, comment?.trim() || null]
    );

    await notify(revieweeName, "new_review", id, `${reviewerName.trim()} gav dig ${rating} stjerner for "${task.title}".`);

    const r = rows[0];
    return NextResponse.json(
      { review: { id: r.id, reviewerName: r.reviewer_name, revieweeName: r.reviewee_name, rating: r.rating, comment: r.comment } },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke gemme anmeldelsen." }, { status: 500 });
  }
}
