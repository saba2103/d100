-- Add notification_preferences JSONB column to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "workout_time": "04:00",
  "supplement_time": "08:00",
  "water_times": ["10:00", "13:00", "16:00", "20:00"],
  "night_log_time": "21:00",
  "weekly_recap_time": "19:00",
  "enable_streak_protection": true,
  "enable_streak_risk": true,
  "enable_milestone_celebrations": true,
  "enable_ai_nudges": true,
  "enable_partner_workout": true,
  "enable_partner_nutrition": true,
  "enable_partner_water": true,
  "enable_partner_supplements": true,
  "enable_partner_body_stats": true,
  "enable_partner_photos": true,
  "enable_partner_badges": true,
  "enable_partner_streaks": true
}';
