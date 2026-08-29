import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const name = decodeURIComponent(params.name);
    const { rows } = await pool.query(
      `SELECT r.*, t.title AS task_title
       FROM reviews r
       JOIN tasks t ON t.id = r.task_id
       WHERE r.reviewee_name = $1
       ORDER BY r.created_at DESC`,
      [name]
    );
    return NextResponse.json({
      reviews: rows.map((r) => ({
        id: r.id,
        reviewerName: r.reviewer_name,
        rating: r.rating,
        comment: r.comment,
        taskTitle: r.task_title,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente anmeldelser." }, { status: 500 });
  }
}
