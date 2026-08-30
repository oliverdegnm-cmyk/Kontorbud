// Nominatim (OpenStreetMap) er en gratis geokodningstjeneste uden API-nøgle.
// Den har en brugspolitik om max ~1 opslag/sekund og kræver en beskrivende
// User-Agent - fint til vores lave volumen, men ikke beregnet til tung
// kommerciel brug. Hvis Kontorbud vokser meget, bør dette udskiftes med en
// betalt geokodningstjeneste med højere grænser.
export async function geocodeArea(area) {
  if (!area?.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=dk&q=${encodeURIComponent(area.trim())}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Kontorbud/1.0 (opgaveplatform)" },
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!results?.[0]) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch (err) {
    console.error("Geokodning fejlede:", err);
    return null;
  }
}
