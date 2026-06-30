-- Migration: Add partner RLS sharing policies and reset stuck active_profiles
-- 1. Helper function to check if target user is partner
CREATE OR REPLACE FUNCTION public.is_partner_of(target_uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  self_email TEXT;
  partner_email_val TEXT;
  partner_uid UUID;
  partner_linked_email TEXT;
BEGIN
  -- Get self email and partner email
  SELECT email, partner_email INTO self_email, partner_email_val
  FROM public.profiles
  WHERE id = auth.uid();

  IF self_email IS NULL OR partner_email_val IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get the partner's id and check if they link back
  SELECT id, partner_email INTO partner_uid, partner_linked_email
  FROM public.profiles
  WHERE email = LOWER(TRIM(partner_email_val));

  IF partner_uid IS NOT NULL AND partner_uid = target_uid AND LOWER(TRIM(partner_linked_email)) = LOWER(TRIM(self_email)) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add SELECT policies for authenticated partners
DROP POLICY IF EXISTS "member_profiles: partner read" ON public.member_profiles;
CREATE POLICY "member_profiles: partner read"
  ON public.member_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id));

DROP POLICY IF EXISTS "workout_logs: partner read" ON public.workout_logs;
CREATE POLICY "workout_logs: partner read"
  ON public.workout_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id));

DROP POLICY IF EXISTS "nutrition_logs: partner read" ON public.nutrition_logs;
CREATE POLICY "nutrition_logs: partner read"
  ON public.nutrition_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id));

DROP POLICY IF EXISTS "daily_stats: partner read" ON public.daily_stats;
CREATE POLICY "daily_stats: partner read"
  ON public.daily_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id));

DROP POLICY IF EXISTS "body_measurements: partner read" ON public.body_measurements;
CREATE POLICY "body_measurements: partner read"
  ON public.body_measurements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id));

DROP POLICY IF EXISTS "supplement_logs: partner read" ON public.supplement_logs;
CREATE POLICY "supplement_logs: partner read"
  ON public.supplement_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id));

DROP POLICY IF EXISTS "user_badges: partner read" ON public.user_badges;
CREATE POLICY "user_badges: partner read"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id));

DROP POLICY IF EXISTS "ai_insights: partner read" ON public.ai_insights;
CREATE POLICY "ai_insights: partner read"
  ON public.ai_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id));

-- 3. Reset stuck active_profiles in user_settings to 'S'
UPDATE public.user_settings SET active_profile = 'S';
