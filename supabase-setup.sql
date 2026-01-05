-- Create friends table in Supabase
-- Copy and paste this SQL into your Supabase SQL Editor and run it

CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0 AND points <= 10000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create an index on points for faster sorting
CREATE INDEX IF NOT EXISTS idx_friends_points ON friends(points DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations" ON friends;

-- Create a policy that allows all operations (adjust based on your security needs)
-- For public read/write access:
CREATE POLICY "Allow all operations" ON friends
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Or for more secure read-only public access:
-- CREATE POLICY "Allow public read" ON friends
--   FOR SELECT
--   USING (true);

-- CREATE POLICY "Allow public insert" ON friends
--   FOR INSERT
--   WITH CHECK (true);

-- CREATE POLICY "Allow public update" ON friends
--   FOR UPDATE
--   USING (true)
--   WITH CHECK (true);

