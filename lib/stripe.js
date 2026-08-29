import Stripe from "stripe";

let stripe = null;

// Initialiseres først når nøglen findes, så resten af appen kan bygge og køre,
// selvom Stripe endnu ikke er forbundet.
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY mangler. Forbind Stripe under Environment Variables på Vercel.");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  }
  return stripe;
}
