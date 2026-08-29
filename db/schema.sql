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
