import { Pool } from "pg";

const globalForPg = globalThis;

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  case_no TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  budget TEXT,
  deadline TEXT,
  description TEXT NOT NULL,
  posted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  bidder_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_bid_id INTEGER REFERENCES bids(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pending_bid_id INTEGER REFERENCES bids(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS poster_type TEXT NOT NULL DEFAULT 'private';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS amount_value INTEGER;

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  bidder_name TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;

CREATE TABLE IF NOT EXISTS task_attachments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  name TEXT PRIMARY KEY,
  bio TEXT,
  skills TEXT,
  portfolio TEXT,
  stripe_account_id TEXT,
  stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_filename TEXT;

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewee_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  type TEXT NOT NULL,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
`;

// Runs once per server instance. Every API route calls this before querying,
// so the very first request after deploy creates the tables automatically -
// no manual migration step needed.
export async function ensureSchema() {
  if (globalForPg.pgSchemaReady) return;
  await pool.query(SCHEMA_SQL);
  globalForPg.pgSchemaReady = true;
}
