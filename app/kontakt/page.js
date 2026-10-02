import { Suspense } from "react";
import ContactClient from "./KontaktClient";
import { pool, ensureSchema } from "@/lib/db";

export const metadata = {
  title: "Kontakt kundeservice - Kontorbud",
  description: "Har du et spørgsmål eller brug for hjælp? Dansk kundeservice - vi svarer hurtigst muligt.",
  alternates: { canonical: "https://kontorbud.dk/kontakt" },
};

// Skal altid vise den nyeste kontaktside-foto-indstilling, og må derfor ikke
// statisk caches - se lib/db.js/ensureSchema og /api/site-settings, som
// bruger samme force-dynamic mønster.
export const dynamic = "force-dynamic";

// 3/10: udvidet fra ét til to kontaktfotos (Josefine + Anna), efter ønske om en
// ekstra kundeservicemedarbejder på /kontakt. "foto1"/"foto2" bruger hver sit
// sæt settings-nøgler (kontakt_foto[_2]/_position/_zoom), så de kan
// uploades/justeres uafhængigt af hinanden i admin-panelet (se ImagesTab i
// app/admin/page.js).
async function getKontaktFotos() {
  try {
    await ensureSchema();
    const { rows } = await pool.query(
      "SELECT key, value FROM site_settings WHERE key IN ('kontakt_foto', 'kontakt_foto_position', 'kontakt_foto_zoom', 'kontakt_foto_2', 'kontakt_foto_2_position', 'kontakt_foto_2_zoom')"
    );
    const settings = {};
    rows.forEach((r) => (settings[r.key] = r.value));
    return {
      foto1: {
        url: settings.kontakt_foto || "/kontakt-foto.jpg",
        position: settings.kontakt_foto_position ? parseFloat(settings.kontakt_foto_position) : 50,
        zoom: settings.kontakt_foto_zoom ? parseFloat(settings.kontakt_foto_zoom) : 100,
      },
      foto2: {
        url: settings.kontakt_foto_2 || "/kontakt-foto-anna.jpg",
        position: settings.kontakt_foto_2_position ? parseFloat(settings.kontakt_foto_2_position) : 50,
        zoom: settings.kontakt_foto_2_zoom ? parseFloat(settings.kontakt_foto_2_zoom) : 100,
      },
    };
  } catch (err) {
    return {
      foto1: { url: "/kontakt-foto.jpg", position: 50, zoom: 100 },
      foto2: { url: "/kontakt-foto-anna.jpg", position: 50, zoom: 100 },
    };
  }
}

export default async function Page() {
  const kontaktFotos = await getKontaktFotos();
  return (
    <Suspense fallback={null}>
      <ContactClient initialKontaktFotos={kontaktFotos} />
    </Suspense>
  );
}
