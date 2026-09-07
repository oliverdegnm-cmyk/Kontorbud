import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, ensureSchema } from "@/lib/db";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { facebookExchangeCode, getSiteUrl, uniqueNameFrom } from "@/lib/oauth";

export async function GET(request) {
  const siteUrl = getSiteUrl(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookies().get("kb_oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${siteUrl}/login?error=oauth`);
  }

  try {
    await ensureSchema();
    const redirectUri = `${siteUrl}/api/auth/facebook/callback`;
    const profile = await facebookExchangeCode({ code, redirectUri });

    if (!profile.email) {
      // Facebook giver ikke altid en email med - kan ikke oprette/matche en
      // konto uden en, så brugeren bedes bruge almindelig tilmelding i stedet.
      return NextResponse.redirect(`${siteUrl}/login?error=no_email`);
    }

    let { rows } = await pool.query("SELECT * FROM users WHERE facebook_id = $1", [profile.providerId]);
    let user = rows[0];

    if (!user) {
      const { rows: byEmail } = await pool.query("SELECT * FROM users WHERE email = $1", [profile.email]);
      user = byEmail[0];

      if (user) {
        await pool.query("UPDATE users SET facebook_id = $1, email_verified = true WHERE id = $2", [profile.providerId, user.id]);
      } else {
        const name = await uniqueNameFrom(pool, profile.name);
        const { rows: created } = await pool.query(
          `INSERT INTO users (name, email, facebook_id, email_verified)
           VALUES ($1, $2, $3, true) RETURNING *`,
          [name, profile.email, profile.providerId]
        );
        user = created[0];

        if (profile.avatarUrl) {
          await pool.query(
            `INSERT INTO profiles (name, avatar_url) VALUES ($1, $2)
             ON CONFLICT (name) DO UPDATE SET avatar_url = $2`,
            [user.name, profile.avatarUrl]
          );
        }
      }
    }

    const token = signSession({ userId: user.id, name: user.name });
    const response = NextResponse.redirect(`${siteUrl}/`);
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.delete("kb_oauth_state");
    return response;
  } catch (err) {
    console.error("Facebook OAuth-fejl:", err);
    return NextResponse.redirect(`${siteUrl}/login?error=oauth`);
  }
}
