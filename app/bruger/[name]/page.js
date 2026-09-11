import { pool } from "@/lib/db";
import ProfileClient from "./ProfileClient";

export async function generateMetadata({ params }) {
  const name = decodeURIComponent(params.name);
  try {
    const { rows } = await pool.query("SELECT bio, skills FROM profiles WHERE name = $1", [name]);
    const profile = rows[0];
    const description = profile?.bio
      ? profile.bio.slice(0, 155)
      : `Se ${name}s profil, anmeldelser og bud på AIbud.`;
    return {
      title: `${name} - AIbud`,
      description,
      alternates: { canonical: `https://aibud.dk/bruger/${encodeURIComponent(name)}` },
      // Profiler kan indeholde personfølsomme dokumenter (CV, portfolio), som
      // brugerne selv vælger at uploade - vi holder dem derfor ude af Googles
      // søgeresultater, selvom siden stadig er tilgængelig for direkte besøgende.
      robots: { index: false, follow: true },
    };
  } catch (err) {
    return { title: `${name} - AIbud`, robots: { index: false, follow: true } };
  }
}

export default function Page() {
  return <ProfileClient />;
}
