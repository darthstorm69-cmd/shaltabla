-- Migration: Add point_history and updated_at columns
-- Run this in Supabase SQL Editor

-- Add point_history JSONB column to store historical snapshots
ALTER TABLE friends 
ADD COLUMN IF NOT EXISTS point_history JSONB DEFAULT '[]'::jsonb;

-- Add updated_at timestamp for tracking
ALTER TABLE friends 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for JSONB queries (optional but helpful)
CREATE INDEX IF NOT EXISTS idx_friends_point_history ON friends USING GIN (point_history);

-- Create function to reset daily points
CREATE OR REPLACE FUNCTION reset_daily_points()
RETURNS void AS $$
BEGIN
  UPDATE friends 
  SET points = 0, 
      point_history = '[]'::jsonb,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: pg_cron extension may not be available in Supabase free tier
-- If pg_cron is not available, use Vercel Cron Jobs or external cron service
-- to call the API endpoint /api/friends/reset-daily daily

-- If pg_cron is available, uncomment below:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--   'reset-daily-points',
--   '0 0 * * *', -- Every day at midnight UTC
--   $$SELECT reset_daily_points()$$
-- );

