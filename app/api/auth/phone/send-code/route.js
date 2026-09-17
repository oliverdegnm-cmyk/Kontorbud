import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureSchema } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getTwilio, getTwilioVerifyServiceSid, normalizeDanishPhone } from "@/lib/twilio";

export async function POST(request) {
  try {
    await ensureSchema();
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

    const { phone } = await request.json();
    const normalized = normalizeDanishPhone(phone);
    if (!normalized) {
      return NextResponse.json({ error: "Indtast et gyldigt dansk mobilnummer (8 cifre)." }, { status: 400 });
    }

    const client = getTwilio();
    const serviceSid = getTwilioVerifyServiceSid();
    await client.verify.v2.services(serviceSid).verifications.create({ to: normalized, channel: "sms" });

    return NextResponse.json({ ok: true, phone: normalized });
  } catch (err) {
    console.error("Twilio-fejl i app/api/auth/phone/send-code/route.js:", err);
    const message = err.message?.includes("TWILIO_")
      ? err.message
      : "Kunne ikke sende SMS-kode. Tjek at nummeret er korrekt og prøv igen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
