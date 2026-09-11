import crypto from "crypto";

export function getSiteUrl(request) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || "https://aibud.dk";
}

export function randomState() {
  return crypto.randomBytes(24).toString("hex");
}

// --- Google ---

export function googleAuthUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function googleExchangeCode({ code, redirectUri }) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || "Google-login mislykkedes.");

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const profile = await userRes.json();

  return {
    providerId: profile.sub,
    email: profile.email?.toLowerCase(),
    emailVerified: !!profile.email_verified,
    name: profile.name,
    avatarUrl: profile.picture,
  };
}

// --- Facebook ---

export function facebookAuthUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: redirectUri,
    state,
    scope: "email public_profile",
    response_type: "code",
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}

export async function facebookExchangeCode({ code, redirectUri }) {
  const params = new URLSearchParams({
    code,
    client_id: process.env.FACEBOOK_APP_ID,
    client_secret: process.env.FACEBOOK_APP_SECRET,
    redirect_uri: redirectUri,
  });
  const res = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Facebook-login mislykkedes.");

  const userRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${data.access_token}`
  );
  const profile = await userRes.json();

  return {
    providerId: profile.id,
    // Facebook leverer ikke altid en email (f.eks. hvis brugeren aldrig har
    // bekræftet én på deres Facebook-konto) - håndteres af den kaldende kode.
    email: profile.email?.toLowerCase() || null,
    emailVerified: !!profile.email,
    name: profile.name,
    avatarUrl: profile.picture?.data?.url,
  };
}

// Finder et ledigt, unikt brugernavn ud fra det navn, udbyderen sender -
// tilføjer et tal, hvis navnet allerede er i brug.
export async function uniqueNameFrom(pool, baseName) {
  const clean = (baseName || "Bruger").trim().slice(0, 60);
  let candidate = clean;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rows } = await pool.query("SELECT id FROM users WHERE name = $1", [candidate]);
    if (rows.length === 0) return candidate;
    suffix += 1;
    candidate = `${clean} ${suffix}`;
  }
}
