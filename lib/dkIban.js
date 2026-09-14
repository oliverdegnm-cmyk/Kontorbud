// Regner et gyldigt dansk IBAN ud fra et almindeligt reg.nr. + kontonummer -
// de to felter danskere rent faktisk kender, i stedet for at bede dem slå
// deres eget IBAN op et sted. Der er intet gæt eller opslag involveret: et
// dansk IBAN er bare "DK" + 2 kontrolcifre + reg.nr. (4 cifre) + kontonummer
// (zero-paddet til 10 cifre), og kontrolcifrene beregnes med den officielle
// IBAN-tjeksumformel (ISO 7064 MOD 97-10, samme standard alle banker bruger).
// Se status.md (13-14/9) for baggrunden: Stripes onboarding til danske
// connected accounts beder ellers om IBAN direkte, hvilket forvirrer mange
// danske brugere, der aldrig har haft brug for at kende deres eget IBAN.

// Konverterer landekode-bogstaver til tal efter IBAN-standarden (A=10 ... Z=35)
// og regner hele tallet modulo 97 uden at løbe ind i JS' grænser for hele tal,
// ved at tage modulo løbende, ét ciffer ad gangen, i stedet for på hele tallet.
function mod97(numericString) {
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + Number(numericString[i])) % 97;
  }
  return remainder;
}

function letterToDigits(ch) {
  if (/[0-9]/.test(ch)) return ch;
  return String(ch.toUpperCase().charCodeAt(0) - 55); // A=10, B=11, ... Z=35
}

function computeIbanCheckDigits(countryCode, bban) {
  // IBAN-tjeksum-regel: flyt landekode + "00" om bag BBAN, konverter bogstaver
  // til tal, og regn modulo 97 - kontrolcifrene er så 98 minus resten.
  const rearranged = `${bban}${countryCode}00`;
  const numeric = rearranged.split("").map(letterToDigits).join("");
  const remainder = mod97(numeric);
  return String(98 - remainder).padStart(2, "0");
}

// Kaster en fejl med en dansk, brugervendt besked, hvis input ikke er gyldigt
// - så den kan vises direkte i UI'et uden videre oversættelse.
export function regAndAccountToIban(regNrRaw, kontoNrRaw) {
  const regNr = String(regNrRaw ?? "").replace(/\D/g, "");
  const kontoNr = String(kontoNrRaw ?? "").replace(/\D/g, "");

  if (regNr.length !== 4) {
    throw new Error("Registreringsnummer skal være præcis 4 cifre.");
  }
  if (kontoNr.length === 0 || kontoNr.length > 10) {
    throw new Error("Kontonummer skal være mellem 1 og 10 cifre.");
  }

  // Danske kontonumre kan være kortere end 10 cifre - i BBAN'en zero-paddes
  // det til venstre til 10 cifre, som bankerne selv gør det.
  const paddedAccount = kontoNr.padStart(10, "0");
  const bban = `${regNr}${paddedAccount}`;
  const checkDigits = computeIbanCheckDigits("DK", bban);
  return `DK${checkDigits}${bban}`;
}

// Simpelt sanity-tjek af et allerede udregnet (eller indtastet) IBAN mod
// samme tjeksum-formel - bruges ikke af selve konverteringen ovenfor, men er
// nyttig hvis man nogensinde skal validere et IBAN, brugeren selv har skrevet.
export function isValidIban(iban) {
  const cleaned = String(iban ?? "").replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false;
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged.split("").map(letterToDigits).join("");
  return mod97(numeric) === 1;
}
