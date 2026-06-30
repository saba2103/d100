-- Migration: Rename profile tag 'A' to 'P' and update constraints
-- 1. Drop existing constraints
ALTER TABLE public.member_profiles DROP CONSTRAINT IF EXISTS member_profiles_profile_tag_check;
ALTER TABLE public.workout_logs DROP CONSTRAINT IF EXISTS workout_logs_profile_tag_check;
ALTER TABLE public.nutrition_logs DROP CONSTRAINT IF EXISTS nutrition_logs_profile_tag_check;
ALTER TABLE public.daily_stats DROP CONSTRAINT IF EXISTS daily_stats_profile_tag_check;
ALTER TABLE public.body_measurements DROP CONSTRAINT IF EXISTS body_measurements_profile_tag_check;
ALTER TABLE public.supplement_logs DROP CONSTRAINT IF EXISTS supplement_logs_profile_tag_check;
ALTER TABLE public.user_badges DROP CONSTRAINT IF EXISTS user_badges_profile_tag_check;
ALTER TABLE public.ai_insights DROP CONSTRAINT IF EXISTS ai_insights_profile_tag_check;
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_active_profile_check;

-- 2. Update existing 'A' values to 'P'
UPDATE public.member_profiles SET profile_tag = 'P' WHERE profile_tag = 'A';
UPDATE public.workout_logs SET profile_tag = 'P' WHERE profile_tag = 'A';
UPDATE public.nutrition_logs SET profile_tag = 'P' WHERE profile_tag = 'A';
UPDATE public.daily_stats SET profile_tag = 'P' WHERE profile_tag = 'A';
UPDATE public.body_measurements SET profile_tag = 'P' WHERE profile_tag = 'A';
UPDATE public.supplement_logs SET profile_tag = 'P' WHERE profile_tag = 'A';
UPDATE public.user_badges SET profile_tag = 'P' WHERE profile_tag = 'A';
UPDATE public.ai_insights SET profile_tag = 'P' WHERE profile_tag = 'A';
UPDATE public.user_settings SET active_profile = 'P' WHERE active_profile = 'A';

-- 3. Add new check constraints restricting to 'S' and 'P'
ALTER TABLE public.member_profiles ADD CONSTRAINT member_profiles_profile_tag_check CHECK (profile_tag IN ('S', 'P'));
ALTER TABLE public.workout_logs ADD CONSTRAINT workout_logs_profile_tag_check CHECK (profile_tag IN ('S', 'P'));
ALTER TABLE public.nutrition_logs ADD CONSTRAINT nutrition_logs_profile_tag_check CHECK (profile_tag IN ('S', 'P'));
ALTER TABLE public.daily_stats ADD CONSTRAINT daily_stats_profile_tag_check CHECK (profile_tag IN ('S', 'P'));
ALTER TABLE public.body_measurements ADD CONSTRAINT body_measurements_profile_tag_check CHECK (profile_tag IN ('S', 'P'));
ALTER TABLE public.supplement_logs ADD CONSTRAINT supplement_logs_profile_tag_check CHECK (profile_tag IN ('S', 'P'));
ALTER TABLE public.user_badges ADD CONSTRAINT user_badges_profile_tag_check CHECK (profile_tag IN ('S', 'P'));
ALTER TABLE public.ai_insights ADD CONSTRAINT ai_insights_profile_tag_check CHECK (profile_tag IN ('S', 'P'));
ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_active_profile_check CHECK (active_profile IN ('S', 'P'));

-- 4. Update public.handle_new_user() trigger function
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
    (NEW.id, 'P', 'Partner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
