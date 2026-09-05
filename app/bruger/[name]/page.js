import { pool } from "@/lib/db";
import ProfileClient from "./ProfileClient";

export async function generateMetadata({ params }) {
  const name = decodeURIComponent(params.name);
  try {
    const { rows } = await pool.query("SELECT bio, skills FROM profiles WHERE name = $1", [name]);
    const profile = rows[0];
    const description = profile?.bio
      ? profile.bio.slice(0, 155)
      : `Se ${name}s profil, anmeldelser og bud på Kontorbud.`;
    return {
      title: `${name} - Kontorbud`,
      description,
      alternates: { canonical: `https://kontorbud.dk/bruger/${encodeURIComponent(name)}` },
    };
  } catch (err) {
    return { title: `${name} - Kontorbud` };
  }
}

export default function Page() {
  return <ProfileClient />;
}
