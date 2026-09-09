-- One row per player. `id` is an anonymous, client-generated, stable-per-save
-- string — never an account, never a device fingerprint.
CREATE TABLE IF NOT EXISTS scores (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  -- THE score: the highest campaign node this player has ever cleared.
  score      INTEGER NOT NULL,
  -- Shown beside the rank: the best win streak. The column keeps its old name
  -- so the deployed Worker and the client agree on the wire field.
  squad      INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- The board is always read in exactly this order, and rank is
-- `COUNT(*) WHERE score > ?`, so one index serves both.
CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores (score DESC, updated_at ASC);

-- The materialised top-N, as ONE row of JSON.
--
-- Reading the top 100 as 100 rows would burn 100 of D1's 5M daily row reads per
-- board view — about 50 000 views a day. As a single blob it is one read, and
-- zero on an edge-cache hit.
CREATE TABLE IF NOT EXISTS board_cache (
  id         TEXT PRIMARY KEY,
  json       TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
