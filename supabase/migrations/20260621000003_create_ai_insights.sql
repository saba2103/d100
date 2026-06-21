-- =============================================================================
-- D100 — Create AI Insights Table
-- Migration: 20260621000003_create_ai_insights.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_tag  TEXT NOT NULL CHECK (profile_tag IN ('S', 'A')),
  insight      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for owners
DROP POLICY IF EXISTS "ai_insights: owner all" ON ai_insights;
CREATE POLICY "ai_insights: owner all"
  ON ai_insights FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add index for fast history retrieval
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_profile 
  ON ai_insights (user_id, profile_tag, created_at DESC);
