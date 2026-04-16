-- Lv. Book — Supabase schema
-- Run this in your Supabase project → SQL Editor

CREATE TABLE IF NOT EXISTS game_profiles (
  user_id  TEXT        PRIMARY KEY,
  email    TEXT,
  game_data JSONB      NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS is bypassed by the service role key used in the API routes.
-- Enable it anyway as a security best practice.
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (bypasses RLS automatically).
-- This policy is a no-op for service role but documents intent.
CREATE POLICY "service_role_full_access" ON game_profiles
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
