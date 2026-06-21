-- =============================================================================
-- D100 — Create Member Profiles Table & Alter Profiles Table
-- Migration: 20260621000004_create_member_profiles.sql
-- =============================================================================

-- 1. Add goal columns to main profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_weight_goal_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS target_body_fat_pct    NUMERIC;

-- 2. Create member_profiles table to store details for both S and A
CREATE TABLE IF NOT EXISTS public.member_profiles (
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_tag            TEXT NOT NULL CHECK (profile_tag IN ('S', 'A')),
  full_name              TEXT,
  phone                  TEXT,
  height_cm              NUMERIC,
  starting_weight_kg     NUMERIC,
  date_of_birth          DATE,
  gender                 TEXT CHECK (gender IN ('male', 'female', 'other')),
  avatar_url             TEXT,
  program_start_date     DATE,
  current_weight_goal_kg NUMERIC,
  target_body_fat_pct    NUMERIC,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, profile_tag)
);

-- 3. Enable RLS on member_profiles
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS owner policy
DROP POLICY IF EXISTS "member_profiles: owner all" ON public.member_profiles;
CREATE POLICY "member_profiles: owner all"
  ON public.member_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Seed existing data for profile 'S' using profiles table data
INSERT INTO public.member_profiles (
  user_id, profile_tag, full_name, phone, height_cm, starting_weight_kg, 
  date_of_birth, gender, avatar_url, program_start_date, current_weight_goal_kg, 
  target_body_fat_pct, created_at, updated_at
)
SELECT 
  id, 'S', full_name, phone, height_cm, starting_weight_kg, 
  date_of_birth, gender, avatar_url, program_start_date, current_weight_goal_kg, 
  target_body_fat_pct, created_at, updated_at
FROM public.profiles
ON CONFLICT (user_id, profile_tag) DO NOTHING;

-- 6. Seed a default entry for profile 'A' if it doesn't exist
INSERT INTO public.member_profiles (user_id, profile_tag, full_name)
SELECT id, 'A', 'Ancy'
FROM public.profiles
ON CONFLICT (user_id, profile_tag) DO NOTHING;

-- 7. Update handle_new_user() trigger to automatically create S & A member profiles upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'S'),
    NEW.email
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.member_profiles (user_id, profile_tag, full_name)
  VALUES 
    (NEW.id, 'S', COALESCE(NEW.raw_user_meta_data->>'display_name', 'Saba')),
    (NEW.id, 'A', 'Ancy');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
