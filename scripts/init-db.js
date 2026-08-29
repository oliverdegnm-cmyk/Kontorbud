const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL mangler. Sæt den i .env.local eller som miljøvariabel og prøv igen.");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const sql = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Databasen er klar: tabellerne 'tasks' og 'bids' findes nu.");
  await pool.end();
}

main().catch((err) => {
  console.error("Kunne ikke oprette tabellerne:", err.message);
  process.exit(1);
});
