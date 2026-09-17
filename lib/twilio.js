import twilio from "twilio";

let client = null;

// Initialiseres først når nøglerne findes, så resten af appen kan bygge og
// køre, selvom Twilio (SMS-verificering af mobilnummer) endnu ikke er
// forbundet. Se .env.example for hvilke variable der skal sættes.
export function getTwilio() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN mangler. Opret en Twilio-konto og tilføj nøglerne under Environment Variables på Vercel.");
  }
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

export function getTwilioVerifyServiceSid() {
  if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
    throw new Error("TWILIO_VERIFY_SERVICE_SID mangler. Opret en Verify Service i Twilio-konsollen og tilføj SID'et under Environment Variables på Vercel.");
  }
  return process.env.TWILIO_VERIFY_SERVICE_SID;
}

// Simpelt dansk mobilnummer-tjek: 8 cifre, evt. med +45/0045 foran. Returnerer
// nummeret i E.164-format (+45XXXXXXXX), som Twilio kræver, eller null hvis
// det ikke ligner et gyldigt dansk mobilnummer.
export function normalizeDanishPhone(raw) {
  const digits = (raw || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+45") && digits.length === 11) return digits;
  if (digits.startsWith("0045") && digits.length === 12) return `+45${digits.slice(4)}`;
  if (digits.startsWith("45") && digits.length === 10) return `+${digits}`;
  if (/^\d{8}$/.test(digits)) return `+45${digits}`;
  return null;
}
