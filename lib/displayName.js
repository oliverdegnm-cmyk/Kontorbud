// Formaterer et navn til visning for ANDRE brugere (bud, opgavelister, anmeldelser,
// beskeder, profilsider osv.). Selve det gemte, unikke "name"-felt i databasen
// rører vi IKKE ved her - det bruges stadig til login, matching af bud/opgaver
// m.m. Denne funktion laver kun en kortere visningsudgave af teksten:
//
//   "Oliver Degn Mortensen" -> "Oliver D. M."
//   "Josefine Degn"         -> "Josefine D."
//   "Oliverdegn"            -> "Oliverdegn" (ét ord, uændret)
//
// Bruges IKKE på brugerens egen profilside (hvor de redigerer deres eget navn) -
// kun der, hvor navnet vises til andre.
export function shortDisplayName(name) {
  if (!name) return name;
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const [first, ...rest] = parts;
  const initials = rest.map((p) => (p ? p[0].toUpperCase() + "." : "")).filter(Boolean);
  return [first, ...initials].join(" ");
}
