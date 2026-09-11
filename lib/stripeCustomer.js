import { pool } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function getOrCreateStripeCustomer(name) {
  const { rows } = await pool.query("SELECT stripe_customer_id FROM profiles WHERE name = $1", [name]);
  let existing = rows[0]?.stripe_customer_id;

  const stripe = getStripe();

  // Bekræft en evt. gemt kunde rent faktisk stadig findes i den tilstand
  // (test/live), API-nøglen kører i lige nu - ellers opretter vi en ny, i
  // stedet for at genbruge en ugyldig reference fra en tidligere tilstand
  // (f.eks. sandbox, før platformen skiftede til Live mode).
  if (existing) {
    try {
      const customer = await stripe.customers.retrieve(existing);
      if (!customer.deleted) return existing;
    } catch (err) {
      existing = null;
    }
  }

  const customer = await stripe.customers.create({ name, metadata: { kontorbud_name: name } });

  await pool.query(
    `INSERT INTO profiles (name, stripe_customer_id) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET stripe_customer_id = $2`,
    [name, customer.id]
  );

  return customer.id;
}
