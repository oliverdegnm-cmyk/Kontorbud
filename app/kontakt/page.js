import { Suspense } from "react";
import ContactClient from "./KontaktClient";
import { pool, ensureSchema } from "@/lib/db";
import { parseStaffMembers } from "@/lib/staff";

export const metadata = {
  title: "Kontakt kundeservice - Kontorbud",
  description: "Har du et spørgsmål eller brug for hjælp? Dansk kundeservice - vi svarer hurtigst muligt.",
  alternates: { canonical: "https://kontorbud.dk/kontakt" },
};

// Skal altid vise den nyeste kontaktside-foto-indstilling, og må derfor ikke
// statisk caches - se lib/db.js/ensureSchema og /api/site-settings, som
// bruger samme force-dynamic mønster.
export const dynamic = "force-dynamic";

// 11/10: medarbejderne vises nu som en admin-styret liste (se app/admin/page.js,
// StaffMembersSetting) i stedet for to hardcodede personer - "staff_members" i
// site_settings er en JSON-liste af { name, title, url, position, zoom}. Er
// den ikke sat endnu, bygger parseStaffMembers() den samme to-personers-liste
// (Josefine + Anna), der var der før, ud fra de gamle enkeltstående nøgler.
async function getStaffMembers() {
  try {
    await ensureSchema();
    const { rows } = await pool.query(
      "SELECT key, value FROM site_settings WHERE key IN ('staff_members', 'kontakt_foto', 'kontakt_foto_position', 'kontakt_foto_zoom', 'kontakt_foto_2', 'kontakt_foto_2_position', 'kontakt_foto_2_zoom')"
    );
    const settings = {};
    rows.forEach((r) => (settings[r.key] = r.value));
    return parseStaffMembers(settings.staff_members, settings);
  } catch (err) {
    return parseStaffMembers(null, {});
  }
}

export default async function Page() {
  const staff = await getStaffMembers();
  return (
    <Suspense fallback={null}>
      <ContactClient initialStaff={staff} />
    </Suspense>
  );
}
