import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, ensureSchema } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function PATCH(request) {
  try {
    await ensureSchema();
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

    const body = await request.json();
    const { phone, emailNotifications, smsNotifications } = body;

    await pool.query("UPDATE users SET phone = $1, email_notifications = $2, sms_notifications = $3 WHERE id = $4", [
      phone?.trim() || null,
      emailNotifications !== false,
      smsNotifications === true,
      payload.userId,
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke gemme indstillinger." }, { status: 500 });
  }
}
