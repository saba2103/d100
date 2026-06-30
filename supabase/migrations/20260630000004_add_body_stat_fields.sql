-- Migration: Add 30 new body stat fields to body_measurements
ALTER TABLE body_measurements
  -- Group: Essentials (additions)
  ADD COLUMN IF NOT EXISTS standard_weight_kg        NUMERIC,
  ADD COLUMN IF NOT EXISTS heart_rate_bpm             INTEGER,
  ADD COLUMN IF NOT EXISTS health_score               INTEGER,
  ADD COLUMN IF NOT EXISTS total_body_water_kg        NUMERIC,
  ADD COLUMN IF NOT EXISTS weight_control_kg          NUMERIC,

  -- Group: Fat & Composition (additions)
  ADD COLUMN IF NOT EXISTS subcutaneous_fat_kg        NUMERIC,
  ADD COLUMN IF NOT EXISTS trunk_fat_mass_kg          NUMERIC,
  ADD COLUMN IF NOT EXISTS trunk_fat_ratio_pct        NUMERIC,
  ADD COLUMN IF NOT EXISTS recommended_calorie_intake_kcal INTEGER,

  -- Group: More
  ADD COLUMN IF NOT EXISTS waist_hip_ratio            NUMERIC,
  ADD COLUMN IF NOT EXISTS intracellular_water_kg     NUMERIC,
  ADD COLUMN IF NOT EXISTS extracellular_water_kg     NUMERIC,
  ADD COLUMN IF NOT EXISTS protein_mass_kg            NUMERIC,
  ADD COLUMN IF NOT EXISTS mineral_mass_kg            NUMERIC,

  -- Group: Segmental — Arms
  ADD COLUMN IF NOT EXISTS left_arm_fat_ratio_pct     NUMERIC,
  ADD COLUMN IF NOT EXISTS right_arm_fat_ratio_pct    NUMERIC,
  ADD COLUMN IF NOT EXISTS left_arm_fat_mass_kg       NUMERIC,
  ADD COLUMN IF NOT EXISTS right_arm_fat_mass_kg      NUMERIC,
  ADD COLUMN IF NOT EXISTS left_arm_muscle_ratio_pct  NUMERIC,
  ADD COLUMN IF NOT EXISTS right_arm_muscle_ratio_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS left_arm_muscle_mass_kg    NUMERIC,
  ADD COLUMN IF NOT EXISTS right_arm_muscle_mass_kg   NUMERIC,

  -- Group: Segmental — Legs
  ADD COLUMN IF NOT EXISTS left_leg_fat_ratio_pct     NUMERIC,
  ADD COLUMN IF NOT EXISTS right_leg_fat_ratio_pct    NUMERIC,
  ADD COLUMN IF NOT EXISTS left_leg_fat_mass_kg       NUMERIC,
  ADD COLUMN IF NOT EXISTS right_leg_fat_mass_kg      NUMERIC,
  ADD COLUMN IF NOT EXISTS left_leg_muscle_ratio_pct  NUMERIC,
  ADD COLUMN IF NOT EXISTS right_leg_muscle_ratio_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS left_leg_muscle_mass_kg    NUMERIC,
  ADD COLUMN IF NOT EXISTS right_leg_muscle_mass_kg   NUMERIC;
