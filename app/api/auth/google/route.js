import { NextResponse } from "next/server";
import { googleAuthUrl, getSiteUrl, randomState } from "@/lib/oauth";

export async function GET(request) {
  const siteUrl = getSiteUrl(request);
  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  const state = randomState();

  const url = googleAuthUrl({ redirectUri, state });
  const response = NextResponse.redirect(url);
  response.cookies.set("kb_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
