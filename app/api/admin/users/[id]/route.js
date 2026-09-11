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

// Gør en bruger til administrator, eller fjerner administrator-rettigheden
// igen. Kun eksisterende administratorer kan bruge denne, og man kan ikke
// fjerne sin egen adgang herfra (for at undgå at låse sig selv ude).
export async function PATCH(request, { params }) {
  try {
    await ensureSchema();
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });

    const id = Number(params.id);
    const { isAdmin } = await request.json();

    if (id === admin.id && isAdmin === false) {
      return NextResponse.json({ error: "Du kan ikke fjerne din egen administrator-adgang herfra." }, { status: 400 });
    }

    const { rows } = await pool.query(
      "UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, name, is_admin",
      [!!isAdmin, id]
    );
    if (!rows[0]) return NextResponse.json({ error: "Brugeren blev ikke fundet." }, { status: 404 });

    return NextResponse.json({ ok: true, isAdmin: rows[0].is_admin });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke opdatere administrator-adgangen." }, { status: 500 });
  }
}
