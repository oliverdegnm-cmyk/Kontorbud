import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function DELETE(request, { params }) {
  try {
    await ensureSchema();
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });

    const id = Number(params.id);
    if (id === admin.id) {
      return NextResponse.json({ error: "Du kan ikke slette din egen konto herfra." }, { status: 400 });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke slette brugeren." }, { status: 500 });
  }
}
