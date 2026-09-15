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

async function getKontaktFoto() {
  try {
    await ensureSchema();
    const { rows } = await pool.query(
      "SELECT key, value FROM site_settings WHERE key IN ('kontakt_foto', 'kontakt_foto_position', 'kontakt_foto_zoom')"
    );
    const settings = {};
    rows.forEach((r) => (settings[r.key] = r.value));
    return {
      url: settings.kontakt_foto || "/kontakt-foto.jpg",
      position: settings.kontakt_foto_position ? parseFloat(settings.kontakt_foto_position) : 50,
      zoom: settings.kontakt_foto_zoom ? parseFloat(settings.kontakt_foto_zoom) : 100,
    };
  } catch (err) {
    return { url: "/kontakt-foto.jpg", position: 50, zoom: 100 };
  }
}

export default async function Page() {
  const kontaktFoto = await getKontaktFoto();
  return (
    <Suspense fallback={null}>
      <ContactClient initialKontaktFoto={kontaktFoto} />
    </Suspense>
  );
}
