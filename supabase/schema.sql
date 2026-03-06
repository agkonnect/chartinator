-- ============================================================
-- Chartinator — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- ── User profiles ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  tier        TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'pro'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Generated indicators ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS indicators (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  indicator_type  TEXT NOT NULL DEFAULT 'custom',
  timeframe       TEXT NOT NULL DEFAULT 'any',
  code            TEXT NOT NULL,
  file_path       TEXT,
  is_valid        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indicators_user_id   ON indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_indicators_created   ON indicators(created_at DESC);

-- ── Usage tracking ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_user_created ON usage_logs(user_id, created_at DESC);

-- ── Helper function: daily usage count ───────────────────────
CREATE OR REPLACE FUNCTION public.get_daily_usage(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM   usage_logs
  WHERE  user_id    = p_user_id
    AND  created_at >= CURRENT_DATE
    AND  created_at <  CURRENT_DATE + INTERVAL '1 day';
$$;

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators    ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs    ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
DROP POLICY IF EXISTS "users_own_profile"       ON user_profiles;
CREATE POLICY "users_own_profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id);

-- indicators policies
DROP POLICY IF EXISTS "users_own_indicators"    ON indicators;
CREATE POLICY "users_own_indicators"
  ON indicators FOR ALL
  USING (auth.uid() = user_id);

-- usage_logs policies
DROP POLICY IF EXISTS "users_own_usage"         ON usage_logs;
CREATE POLICY "users_own_usage"
  ON usage_logs FOR ALL
  USING (auth.uid() = user_id);
