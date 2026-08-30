import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, ensureSchema } from "@/lib/db";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Udfyld email og adgangskode." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    const user = rows[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Forkert email eller adgangskode." }, { status: 401 });
    }

    const token = signSession({ userId: user.id, name: user.name });
    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login-fejl:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke logge ind." }, { status: 500 });
  }
}
