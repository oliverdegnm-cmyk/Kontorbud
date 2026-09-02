import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { getStripe } from "@/lib/stripe";

export async function DELETE(request, { params }) {
  try {
    await ensureSchema();
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });

    const id = Number(params.id);
    const { rows: taskRows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskRows.length === 0) {
      return NextResponse.json({ error: "Opgaven findes ikke." }, { status: 404 });
    }
    const task = taskRows[0];

    // Refunder automatisk, hvis der er penge under vejs, så en administrativ
    // sletning aldrig efterlader en kunde, der har betalt for ingenting.
    if (task.payment_status === "held" && task.stripe_payment_intent_id) {
      try {
        const stripe = getStripe();
        await stripe.refunds.create({ payment_intent: task.stripe_payment_intent_id });
      } catch (err) {
        console.error("Kunne ikke refundere ved admin-sletning:", err);
      }
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke slette opgaven." }, { status: 500 });
  }
}
