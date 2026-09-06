import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    await ensureSchema();
    const name = decodeURIComponent(params.name);
    const { rows } = await pool.query("SELECT * FROM profiles WHERE name = $1", [name]);
    const p = rows[0];
    return NextResponse.json({
      profile: p
        ? {
            name: p.name,
            bio: p.bio,
            skills: p.skills,
            job: p.portfolio,
            education: p.education,
            avatarUrl: p.avatar_url,
            websiteUrl: p.website_url,
            linkedinUrl: p.linkedin_url,
            cvUrl: p.cv_url,
            cvFilename: p.cv_filename,
            portfolioUrl: p.portfolio_url,
            portfolioFilename: p.portfolio_filename,
            stripeConnected: !!p.stripe_account_id,
            stripePayoutsEnabled: p.stripe_payouts_enabled,
          }
        : {
            name,
            bio: "",
            skills: "",
            job: "",
            education: "",
            avatarUrl: null,
            websiteUrl: null,
            linkedinUrl: null,
            cvUrl: null,
            cvFilename: null,
            portfolioUrl: null,
            portfolioFilename: null,
            stripeConnected: false,
            stripePayoutsEnabled: false,
          },
    });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke hente profil." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await ensureSchema();
    const name = decodeURIComponent(params.name);
    const body = await request.json();
    const { bio, skills, job, education, avatarUrl, websiteUrl, linkedinUrl, cvUrl, cvFilename, portfolioUrl, portfolioFilename } = body;

    if (avatarUrl !== undefined) {
      await pool.query(
        `INSERT INTO profiles (name, avatar_url, updated_at) VALUES ($1, $2, now())
         ON CONFLICT (name) DO UPDATE SET avatar_url = $2, updated_at = now()`,
        [name, avatarUrl || null]
      );
      return NextResponse.json({ ok: true });
    }

    if (cvUrl !== undefined) {
      await pool.query(
        `INSERT INTO profiles (name, cv_url, cv_filename, updated_at) VALUES ($1, $2, $3, now())
         ON CONFLICT (name) DO UPDATE SET cv_url = $2, cv_filename = $3, updated_at = now()`,
        [name, cvUrl || null, cvFilename || null]
      );
      return NextResponse.json({ ok: true });
    }

    if (portfolioUrl !== undefined) {
      await pool.query(
        `INSERT INTO profiles (name, portfolio_url, portfolio_filename, updated_at) VALUES ($1, $2, $3, now())
         ON CONFLICT (name) DO UPDATE SET portfolio_url = $2, portfolio_filename = $3, updated_at = now()`,
        [name, portfolioUrl || null, portfolioFilename || null]
      );
      return NextResponse.json({ ok: true });
    }

    await pool.query(
      `INSERT INTO profiles (name, bio, skills, portfolio, education, website_url, linkedin_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (name) DO UPDATE SET bio = $2, skills = $3, portfolio = $4, education = $5, website_url = $6, linkedin_url = $7, updated_at = now()`,
      [name, bio?.trim() || "", skills?.trim() || "", job?.trim() || "", education?.trim() || "", websiteUrl?.trim() || null, linkedinUrl?.trim() || null]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Kunne ikke gemme profil." }, { status: 500 });
  }
}
