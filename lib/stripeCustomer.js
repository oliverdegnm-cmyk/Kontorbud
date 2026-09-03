import { pool } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function getOrCreateStripeCustomer(name) {
  const { rows } = await pool.query("SELECT stripe_customer_id FROM profiles WHERE name = $1", [name]);
  const existing = rows[0]?.stripe_customer_id;
  if (existing) return existing;

  const stripe = getStripe();
  const customer = await stripe.customers.create({ name, metadata: { kontorbud_name: name } });

  await pool.query(
    `INSERT INTO profiles (name, stripe_customer_id) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET stripe_customer_id = $2`,
    [name, customer.id]
  );

  return customer.id;
}
