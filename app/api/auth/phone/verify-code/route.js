import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, ensureSchema } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getTwilio, getTwilioVerifyServiceSid } from "@/lib/twilio";

export async function POST(request) {
  try {
    await ensureSchema();
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

    const { phone, code } = await request.json();
    if (!phone || !code?.trim()) {
      return NextResponse.json({ error: "Mangler telefonnummer eller kode." }, { status: 400 });
    }

    const client = getTwilio();
    const serviceSid = getTwilioVerifyServiceSid();
    const check = await client.verify.v2.services(serviceSid).verificationChecks.create({ to: phone, code: code.trim() });

    if (check.status !== "approved") {
      return NextResponse.json({ error: "Forkert eller udløbet kode - prøv igen." }, { status: 400 });
    }

    await pool.query("UPDATE users SET phone = $1, phone_verified = true WHERE id = $2", [phone, payload.userId]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Twilio-fejl i app/api/auth/phone/verify-code/route.js:", err);
    return NextResponse.json({ error: "Kunne ikke bekræfte koden - prøv igen." }, { status: 500 });
  }
}
