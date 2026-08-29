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
`;

// Runs once per server instance. Every API route calls this before querying,
// so the very first request after deploy creates the tables automatically -
// no manual migration step needed.
export async function ensureSchema() {
  if (globalForPg.pgSchemaReady) return;
  await pool.query(SCHEMA_SQL);
  globalForPg.pgSchemaReady = true;
}
