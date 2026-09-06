-- Run this once in the production Supabase SQL editor.
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS active_seconds INTEGER NOT NULL DEFAULT 0;
UPDATE doctors
SET active_seconds = 0
WHERE active_seconds IS NULL;