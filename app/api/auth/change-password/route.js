import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, ensureSchema } from "@/lib/db";
import { verifySession, SESSION_COOKIE, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    await ensureSchema();
    const token = cookies().get(SESSION_COOKIE)?.value;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ error: "Ikke logget ind." }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Den nye adgangskode skal være mindst 6 tegn." }, { status: 400 });
    }

    const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [payload.userId]);
    const user = rows[0];

    if (!user?.password_hash) {
      return NextResponse.json(
        { error: "Denne konto blev oprettet via Google eller Facebook og har ingen adgangskode at skifte. Brug \"Glemt adgangskode\" for at oprette en." },
        { status: 400 }
      );
    }

    if (!currentPassword || !(await verifyPassword(currentPassword, user.password_hash))) {
      return NextResponse.json({ error: "Forkert nuværende adgangskode." }, { status: 401 });
    }

    const newHash = await hashPassword(newPassword);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, payload.userId]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Kunne ikke skifte adgangskode:", err);
    return NextResponse.json({ error: "Kunne ikke skifte adgangskode." }, { status: 500 });
  }
}
