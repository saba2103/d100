-- =============================================================================
-- D100 — Add Profile Tag to Tracking Tables
-- Migration: 20260621000005_add_profile_tag_to_tracking_tables.sql
-- =============================================================================

-- 1. daily_stats
ALTER TABLE public.daily_stats ADD COLUMN IF NOT EXISTS profile_tag TEXT NOT NULL DEFAULT 'S' CHECK (profile_tag IN ('S', 'A'));
ALTER TABLE public.daily_stats DROP CONSTRAINT IF EXISTS daily_stats_user_id_stat_date_key;
ALTER TABLE public.daily_stats ADD CONSTRAINT daily_stats_user_id_stat_date_profile_tag_key UNIQUE (user_id, stat_date, profile_tag);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_profile ON public.daily_stats (user_id, profile_tag, stat_date DESC);

-- 2. workout_logs
ALTER TABLE public.workout_logs ADD COLUMN IF NOT EXISTS profile_tag TEXT NOT NULL DEFAULT 'S' CHECK (profile_tag IN ('S', 'A'));
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_profile ON public.workout_logs (user_id, profile_tag, logged_at DESC);

-- 3. nutrition_logs
ALTER TABLE public.nutrition_logs ADD COLUMN IF NOT EXISTS profile_tag TEXT NOT NULL DEFAULT 'S' CHECK (profile_tag IN ('S', 'A'));
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_profile ON public.nutrition_logs (user_id, profile_tag, logged_at DESC);

-- 4. supplement_logs
ALTER TABLE public.supplement_logs ADD COLUMN IF NOT EXISTS profile_tag TEXT NOT NULL DEFAULT 'S' CHECK (profile_tag IN ('S', 'A'));
CREATE INDEX IF NOT EXISTS idx_supplement_logs_user_profile ON public.supplement_logs (user_id, profile_tag, logged_at DESC);

-- 5. body_measurements
ALTER TABLE public.body_measurements ADD COLUMN IF NOT EXISTS profile_tag TEXT NOT NULL DEFAULT 'S' CHECK (profile_tag IN ('S', 'A'));
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_profile ON public.body_measurements (user_id, profile_tag, measured_at DESC);

-- 6. user_badges
ALTER TABLE public.user_badges ADD COLUMN IF NOT EXISTS profile_tag TEXT NOT NULL DEFAULT 'S' CHECK (profile_tag IN ('S', 'A'));
ALTER TABLE public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;
ALTER TABLE public.user_badges ADD CONSTRAINT user_badges_user_id_badge_id_profile_tag_key UNIQUE (user_id, badge_id, profile_tag);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_profile ON public.user_badges (user_id, profile_tag);
