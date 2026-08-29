import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

function mapTask(row, bids) {
  return {
    id: row.id,
    caseNo: row.case_no,
    title: row.title,
    category: row.category,
    budget: row.budget,
    deadline: row.deadline,
    description: row.description,
    postedBy: row.posted_by,
    createdAt: row.created_at,
    bids: bids.map((b) => ({
      id: b.id,
      bidderName: b.bidder_name,
      amount: b.amount,
      message: b.message,
      createdAt: b.created_at,
    })),
  };
}

export async function GET() {
  try {
    await ensureSchema();
    const { rows: taskRows } = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    const { rows: bidRows } = await pool.query("SELECT * FROM bids ORDER BY created_at ASC");
    const tasks = taskRows.map((t) => mapTask(t, bidRows.filter((b) => b.task_id === t.id)));
    return NextResponse.json({ tasks });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente opgaver. Tjek at DATABASE_URL er sat korrekt." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { title, category, budget, deadline, description, postedBy } = body;

    if (!title?.trim() || !description?.trim() || !postedBy?.trim()) {
      return NextResponse.json({ error: "Titel, beskrivelse og navn er påkrævet." }, { status: 400 });
    }

    const { rows: countRows } = await pool.query("SELECT COUNT(*)::int AS count FROM tasks");
    const caseNo = `K-2026-${String(100 + countRows[0].count).padStart(3, "0")}`;

    const { rows } = await pool.query(
      `INSERT INTO tasks (case_no, title, category, budget, deadline, description, posted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        caseNo,
        title.trim(),
        category || "Andet",
        budget?.trim() || "Ikke angivet",
        deadline?.trim() || "Ikke angivet",
        description.trim(),
        postedBy.trim(),
      ]
    );

    return NextResponse.json({ task: mapTask(rows[0], []) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke oprette opgaven." }, { status: 500 });
  }
}
