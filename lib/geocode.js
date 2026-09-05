// Geokodning via Google Geocoding API. Kræver en server-side nøgle
// (GOOGLE_MAPS_API_KEY) begrænset til Geocoding API i Google Cloud Console.
export async function geocodeArea(area) {
  if (!area?.trim()) return null;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY mangler - kan ikke geokode.");
    return null;
  }
  try {
    const query = `${area.trim()}, Danmark`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=dk&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK" || !data.results?.[0]) {
      // Logges eksplicit, så en afvist eller begrænset nøgle (f.eks.
      // REQUEST_DENIED) ikke fejler helt stille i baggrunden.
      console.error(`Geokodning afvist af Google for "${area}": ${data.status}${data.error_message ? " - " + data.error_message : ""}`);
      return null;
    }
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  } catch (err) {
    console.error("Geokodning fejlede:", err);
    return null;
  }
}
