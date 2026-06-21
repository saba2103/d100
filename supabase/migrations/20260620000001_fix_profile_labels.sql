-- =============================================================================
-- D100 — Fix Profile Labels: D → A (S = Saba, A = Ancy)
-- Migration: 20260620000001_fix_profile_labels.sql
-- =============================================================================

-- Fix collection_items.profile_tag constraint
ALTER TABLE collection_items
  DROP CONSTRAINT IF EXISTS collection_items_profile_tag_check;

ALTER TABLE collection_items
  ADD CONSTRAINT collection_items_profile_tag_check
  CHECK (profile_tag IN ('S', 'A', 'both'));

-- Fix user_settings.active_profile constraint
ALTER TABLE user_settings
  DROP CONSTRAINT IF EXISTS user_settings_active_profile_check;

ALTER TABLE user_settings
  ADD CONSTRAINT user_settings_active_profile_check
  CHECK (active_profile IN ('S', 'A'));

-- Note: profiles.display_name accepts 'S' or 'A' (no DB constraint enforced,
-- validated at application level via TypeScript).
