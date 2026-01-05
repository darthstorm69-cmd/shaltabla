-- Optional: Seed some initial friends data
-- Run this in Supabase SQL Editor if you want to start with some sample data

INSERT INTO friends (name, points) VALUES
  ('Alex', 2850),
  ('Jordan', 2740),
  ('Sam', 2630),
  ('Taylor', 2510),
  ('Casey', 2390),
  ('Morgan', 2280),
  ('Riley', 2170),
  ('Avery', 2050)
ON CONFLICT DO NOTHING;


