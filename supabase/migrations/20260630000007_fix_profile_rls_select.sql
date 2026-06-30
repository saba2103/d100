-- Migration: Fix profiles RLS SELECT policy to allow reading partner profiles for connection handshake
-- 1. Create helper function to check if user can read target profile
CREATE OR REPLACE FUNCTION public.can_read_profile(target_uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  self_email TEXT;
  self_partner_email TEXT;
  target_email TEXT;
  target_partner_email TEXT;
BEGIN
  -- Get current user's email and partner_email
  SELECT email, partner_email INTO self_email, self_partner_email
  FROM public.profiles
  WHERE id = auth.uid();

  -- Get target user's email and partner_email
  SELECT email, partner_email INTO target_email, target_partner_email
  FROM public.profiles
  WHERE id = target_uid;

  -- Allow if self
  IF auth.uid() = target_uid THEN
    RETURN TRUE;
  END IF;

  -- Allow if target is our listed partner
  IF self_partner_email IS NOT NULL AND LOWER(TRIM(target_email)) = LOWER(TRIM(self_partner_email)) THEN
    RETURN TRUE;
  END IF;

  -- Allow if we are target's listed partner
  IF target_partner_email IS NOT NULL AND LOWER(TRIM(self_email)) = LOWER(TRIM(target_partner_email)) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop old profiles policy
DROP POLICY IF EXISTS "profiles: owner all" ON public.profiles;

-- 3. Create fine-grained profiles policies
CREATE POLICY "profiles: select profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.can_read_profile(id));

CREATE POLICY "profiles: insert self"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update self"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: delete self"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
