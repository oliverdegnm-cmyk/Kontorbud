import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { pool, ensureSchema } from "@/lib/db";
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return NextResponse.json({ error: "Udfyld navn, email og en adgangskode på mindst 6 tegn." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1 OR name = $2", [normalizedEmail, trimmedName]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email eller navn er allerede i brug. Prøv at logge ind i stedet." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(24).toString("hex");

    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash, verification_token, verification_sent_at) VALUES ($1, $2, $3, $4, now()) RETURNING id, name, email",
      [trimmedName, normalizedEmail, passwordHash, verificationToken]
    );
    const user = rows[0];

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendVerificationEmail(normalizedEmail, trimmedName, verificationToken, origin);

    const token = signSession({ userId: user.id, name: user.name });
    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (err) {
    console.error("Signup-fejl:", err);
    return NextResponse.json({ error: err.message || "Kunne ikke oprette konto." }, { status: 500 });
  }
}
