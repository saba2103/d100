-- Add partner_email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_email TEXT;
