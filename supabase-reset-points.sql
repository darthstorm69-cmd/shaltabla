-- One-time script to reset all friends to 0 points
-- Run this in Supabase SQL Editor after migration

UPDATE friends 
SET points = 0, 
    point_history = '[]'::jsonb,
    updated_at = NOW();

