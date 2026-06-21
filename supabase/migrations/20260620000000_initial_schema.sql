-- =============================================================================
-- D100 Fitness App — Initial Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- HELPER: auto-update updated_at column
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles — extends auth.users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name         TEXT NOT NULL,
  full_name            TEXT,
  email                TEXT,
  phone                TEXT,
  height_cm            NUMERIC,
  starting_weight_kg   NUMERIC,
  date_of_birth        DATE,
  gender               TEXT CHECK (gender IN ('male', 'female', 'other')),
  program_start_date   DATE,
  avatar_url           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_profiles_display_name ON profiles (display_name);

-- ---------------------------------------------------------------------------
-- workout_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at         DATE NOT NULL DEFAULT CURRENT_DATE,
  phase             INT NOT NULL DEFAULT 1,
  -- exercises: [{name, sets:[{reps, weight_kg, completed}]}]
  exercises         JSONB NOT NULL DEFAULT '[]',
  duration_minutes  INT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_logs_user_date ON workout_logs (user_id, logged_at DESC);

-- ---------------------------------------------------------------------------
-- nutrition_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type   TEXT CHECK (meal_type IN (
                'breakfast', 'lunch', 'dinner', 'snack',
                'pre_workout', 'post_workout'
              )),
  -- items: [{name, calories, protein_g, carbs_g, fat_g, quantity, unit}]
  items       JSONB NOT NULL DEFAULT '[]',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs (user_id, logged_at DESC);

-- ---------------------------------------------------------------------------
-- daily_stats — water, steps, calories summary (one row per user per day)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_stats (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stat_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  water_ml            INT NOT NULL DEFAULT 0,
  water_goal_ml       INT NOT NULL DEFAULT 3000,
  steps               INT NOT NULL DEFAULT 0,
  steps_goal          INT NOT NULL DEFAULT 10000,
  calories_consumed   INT NOT NULL DEFAULT 0,
  calories_burned     INT NOT NULL DEFAULT 0,
  calories_goal       INT NOT NULL DEFAULT 2000,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, stat_date)
);

CREATE TRIGGER trg_daily_stats_updated_at
  BEFORE UPDATE ON daily_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_daily_stats_user_date ON daily_stats (user_id, stat_date DESC);

-- ---------------------------------------------------------------------------
-- body_measurements — detailed body composition (manual + scale import)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_measurements (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  measured_at               DATE NOT NULL DEFAULT CURRENT_DATE,
  source                    TEXT NOT NULL DEFAULT 'manual'
                              CHECK (source IN ('manual', 'cult_scale', 'import')),
  -- Essentials
  weight_kg                 NUMERIC,
  bmi                       NUMERIC,
  body_fat_pct              NUMERIC,
  body_fat_kg               NUMERIC,
  lean_mass_kg              NUMERIC,
  -- Bone & Muscle
  bone_mass_kg              NUMERIC,
  skeletal_muscle_mass_kg   NUMERIC,
  skeletal_muscle_pct       NUMERIC,
  -- Body Composition
  subcutaneous_fat_pct      NUMERIC,
  visceral_fat_level        INT,
  protein_pct               NUMERIC,
  body_water_pct            NUMERIC,
  -- Metabolic
  bmr_kcal                  INT,
  metabolic_age             INT,
  -- Status flags from scale: { bmi: "Standard", body_fat: "High", ... }
  flags                     JSONB NOT NULL DEFAULT '{}',
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_body_measurements_user_date ON body_measurements (user_id, measured_at DESC);

-- ---------------------------------------------------------------------------
-- supplement_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplement_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  -- supplements: [{name, dose, taken_at}]
  supplements  JSONB NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supplement_logs_user_date ON supplement_logs (user_id, logged_at DESC);

-- ---------------------------------------------------------------------------
-- user_badges — achievements
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id    TEXT NOT NULL,   -- e.g. "first_spark", "week_warrior"
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges (user_id);

-- ---------------------------------------------------------------------------
-- collection_items — media files (photos, PDFs, scans)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_tag      TEXT CHECK (profile_tag IN ('S', 'A', 'both')),
  title            TEXT,
  file_url         TEXT NOT NULL,
  file_type        TEXT NOT NULL CHECK (file_type IN (
                     'photo', 'pdf', 'screenshot', 'report', 'other'
                   )),
  -- Albums: "body_scan", "progress", "meals", "reports"
  album            TEXT,
  file_size_bytes  INT,
  mime_type        TEXT,
  -- Extracted stats, page count, etc.
  metadata         JSONB NOT NULL DEFAULT '{}',
  taken_at         DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collection_items_user ON collection_items (user_id, created_at DESC);
CREATE INDEX idx_collection_items_album ON collection_items (user_id, album);

-- ---------------------------------------------------------------------------
-- course_articles — educational content blocks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_articles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase                   INT NOT NULL DEFAULT 1,
  lesson_number           TEXT NOT NULL,   -- "1.1", "2.3", etc.
  title                   TEXT NOT NULL,
  slug                    TEXT UNIQUE NOT NULL,
  -- Rich content blocks: [{type: "heading"|"text"|"list"|"image", ...}]
  content                 JSONB NOT NULL DEFAULT '[]',
  cover_image_url         TEXT,
  estimated_read_minutes  INT,
  tags                    TEXT[] NOT NULL DEFAULT '{}',
  published               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_course_articles_updated_at
  BEFORE UPDATE ON course_articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_course_articles_phase ON course_articles (phase, lesson_number);
CREATE INDEX idx_course_articles_published ON course_articles (published) WHERE published = TRUE;

-- ---------------------------------------------------------------------------
-- user_settings — per-user preferences and encrypted API keys
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
  user_id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme                TEXT NOT NULL DEFAULT 'dark'
                         CHECK (theme IN ('dark', 'light', 'system')),
  ai_provider          TEXT NOT NULL DEFAULT 'openai'
                         CHECK (ai_provider IN ('openai', 'anthropic')),
  -- Never expose this in API responses; encrypt before storing
  ai_api_key_encrypted TEXT,
  water_goal_ml        INT NOT NULL DEFAULT 3000,
  steps_goal           INT NOT NULL DEFAULT 10000,
  calories_goal        INT NOT NULL DEFAULT 2000,
  active_profile       TEXT NOT NULL DEFAULT 'S',
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_articles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles: owner all"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- workout_logs
-- ---------------------------------------------------------------------------
CREATE POLICY "workout_logs: owner all"
  ON workout_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- nutrition_logs
-- ---------------------------------------------------------------------------
CREATE POLICY "nutrition_logs: owner all"
  ON nutrition_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- daily_stats
-- ---------------------------------------------------------------------------
CREATE POLICY "daily_stats: owner all"
  ON daily_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- body_measurements
-- ---------------------------------------------------------------------------
CREATE POLICY "body_measurements: owner all"
  ON body_measurements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- supplement_logs
-- ---------------------------------------------------------------------------
CREATE POLICY "supplement_logs: owner all"
  ON supplement_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_badges
-- ---------------------------------------------------------------------------
CREATE POLICY "user_badges: owner all"
  ON user_badges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- collection_items
-- ---------------------------------------------------------------------------
CREATE POLICY "collection_items: owner all"
  ON collection_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- course_articles — public read for published, admins write
-- ---------------------------------------------------------------------------
CREATE POLICY "course_articles: public read published"
  ON course_articles FOR SELECT
  USING (published = TRUE);

-- Service role (admin) can manage all articles (via service_role key in API routes)

-- ---------------------------------------------------------------------------
-- user_settings
-- ---------------------------------------------------------------------------
CREATE POLICY "user_settings: owner all"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================

-- collection — private, up to 50 MB per file
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'collection',
  'collection',
  FALSE,
  52428800,  -- 50 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'application/pdf',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- avatars — public, up to 5 MB per file
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  5242880,   -- 5 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: collection — owner only
CREATE POLICY "collection: owner read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'collection' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "collection: owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'collection' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "collection: owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'collection' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- Storage RLS: avatars — public read, owner write
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "avatars: owner update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "avatars: owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- =============================================================================
-- AUTO-CREATE profile + settings on signup
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    NEW.email
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
