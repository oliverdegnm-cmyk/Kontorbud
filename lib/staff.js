// 11/10: medarbejderne på kontaktsiden kan nu administreres som en liste
// (tilføj/fjern/ret navn, titel og foto), i stedet for to hardcodede personer.
// Listen gemmes som JSON i site_settings-nøglen "staff_members". Denne fil er
// bevidst uden database- eller fetch-kald, så den kan bruges uændret både
// server-side (app/kontakt/page.js) og client-side (app/admin/page.js).
//
// buildDefaultStaff() bygger den liste, der vises, HVIS der endnu ikke er
// gemt en "staff_members"-værdi - dvs. nøjagtig de to personer og fotos, der
// var sat op før denne funktion fandtes (Josefine + Anna, se status-
// dokumentet runde 3/10), ud fra de gamle, enkeltstående settings-nøgler.
// Det betyder admin-panelet og den offentlige side viser det samme efter
// denne opdatering, uden at nogen skal genoprette noget.
export function buildDefaultStaff(settings) {
  const s = settings || {};
  return [
    {
      name: "Josefine Mortensen",
      title: "Kundeservice Medarbejder",
      url: s.kontakt_foto || "/kontakt-foto.jpg",
      position: s.kontakt_foto_position ? parseFloat(s.kontakt_foto_position) : 50,
      zoom: s.kontakt_foto_zoom ? parseFloat(s.kontakt_foto_zoom) : 100,
    },
    {
      name: "Anna Minaei",
      title: "Kundeservice Medarbejder",
      url: s.kontakt_foto_2 || "/kontakt-foto-anna.jpg",
      position: s.kontakt_foto_2_position ? parseFloat(s.kontakt_foto_2_position) : 50,
      zoom: s.kontakt_foto_2_zoom ? parseFloat(s.kontakt_foto_2_zoom) : 100,
    },
  ];
}

// rawJson = værdien af site_settings.staff_members (en JSON-streng eller
// undefined/null). settings = resten af site_settings-rækkerne, kun brugt
// som fallback til buildDefaultStaff, hvis staff_members ikke findes endnu.
export function parseStaffMembers(rawJson, settings) {
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (err) {
      // ugyldig JSON - fald igennem til standardlisten herunder
    }
  }
  return buildDefaultStaff(settings);
}
