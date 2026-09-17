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
    const newPhone = phone?.trim() || null;

    // Skifter man mobilnummeret, mister det sin evt. "verificeret"-status -
    // en ny SMS-verificering skal køres igen for det nye nummer (se
    // app/api/auth/phone/send-code og verify-code). Kun de to ruter kan sætte
    // phone_verified = true.
    const { rows: existingRows } = await pool.query("SELECT phone, phone_verified FROM users WHERE id = $1", [payload.userId]);
    const keepVerified = !!existingRows[0]?.phone_verified && newPhone === existingRows[0]?.phone;

    await pool.query(
      "UPDATE users SET phone = $1, email_notifications = $2, sms_notifications = $3, phone_verified = $5 WHERE id = $4",
      [newPhone, emailNotifications !== false, smsNotifications === true, payload.userId, keepVerified]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke gemme indstillinger." }, { status: 500 });
  }
}
