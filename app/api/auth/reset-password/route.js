import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, ensureSchema } from "@/lib/db";
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: "Angiv en ny adgangskode på mindst 6 tegn." }, { status: 400 });
    }

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > now()",
      [token]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Linket er udløbet eller ugyldigt. Bed om et nyt." }, { status: 400 });
    }
    const user = rows[0];

    const passwordHash = await hashPassword(password);
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [passwordHash, user.id]
    );

    const sessionToken = signSession({ userId: user.id, name: user.name });
    cookies().set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke nulstille adgangskoden." }, { status: 500 });
  }
}
