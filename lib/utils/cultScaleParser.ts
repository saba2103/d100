/**
 * Cult Smart Scale export text parser.
 *
 * The scale app exports a plain-text blob with sections like:
 *
 *   Essentials
 *   Date/Time     19/06/2026 08:30   Standard
 *   Weight        72.5 kg            Standard
 *   BMI           23.4               Standard
 *   Body Fat %    18.5 %             High
 *   ...
 *
 * Each line: Label  Value  [Status]
 * Sections are delimited by their heading lines.
 */

export interface ParsedMeasurement {
  measured_at: string; // YYYY-MM-DD
  weight_kg: number | null;
  standard_weight_kg: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  body_fat_kg: number | null;
  lean_mass_kg: number | null;
  heart_rate_bpm: number | null;
  health_score: number | null;
  total_body_water_kg: number | null;
  weight_control_kg: number | null;
  bone_mass_kg: number | null;
  skeletal_muscle_mass_kg: number | null;
  skeletal_muscle_pct: number | null;
  subcutaneous_fat_pct: number | null;
  subcutaneous_fat_kg: number | null;
  visceral_fat_level: number | null;
  trunk_fat_mass_kg: number | null;
  trunk_fat_ratio_pct: number | null;
  body_water_pct: number | null;
  protein_pct: number | null;
  recommended_calorie_intake_kcal: number | null;
  bmr_kcal: number | null;
  metabolic_age: number | null;
  waist_hip_ratio: number | null;
  intracellular_water_kg: number | null;
  extracellular_water_kg: number | null;
  protein_mass_kg: number | null;
  mineral_mass_kg: number | null;
  left_arm_fat_ratio_pct: number | null;
  right_arm_fat_ratio_pct: number | null;
  left_arm_fat_mass_kg: number | null;
  right_arm_fat_mass_kg: number | null;
  left_arm_muscle_ratio_pct: number | null;
  right_arm_muscle_ratio_pct: number | null;
  left_arm_muscle_mass_kg: number | null;
  right_arm_muscle_mass_kg: number | null;
  left_leg_fat_ratio_pct: number | null;
  right_leg_fat_ratio_pct: number | null;
  left_leg_fat_mass_kg: number | null;
  right_leg_fat_mass_kg: number | null;
  left_leg_muscle_ratio_pct: number | null;
  right_leg_muscle_ratio_pct: number | null;
  left_leg_muscle_mass_kg: number | null;
  right_leg_muscle_mass_kg: number | null;
  flags: Record<string, string>;
}

const STATUS_VALUES = ["standard", "high", "low", "normal", "excellent", "good", "fair", "poor"];

function extractNumber(raw: string): number | null {
  const match = raw.match(/-?\d+\.?\d*/);
  return match ? parseFloat(match[0]) : null;
}

function extractStatus(line: string): string | null {
  const words = line.toLowerCase().split(/\s+/);
  for (const w of words) {
    if (STATUS_VALUES.includes(w)) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }
  }
  return null;
}

/** Parse a date string like "19/06/2026 08:30" or "2026-06-19" */
function parseDate(line: string): string {
  // DD/MM/YYYY HH:MM
  const ddmmyyyy = line.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  }
  // ISO
  const iso = line.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  return new Date().toISOString().split("T")[0];
}

export function parseCultScaleExport(raw: string): ParsedMeasurement {
  const today = new Date().toISOString().split("T")[0];
  const result: ParsedMeasurement = {
    measured_at: today,
    weight_kg: null,
    standard_weight_kg: null,
    bmi: null,
    body_fat_pct: null,
    body_fat_kg: null,
    lean_mass_kg: null,
    heart_rate_bpm: null,
    health_score: null,
    total_body_water_kg: null,
    weight_control_kg: null,
    bone_mass_kg: null,
    skeletal_muscle_mass_kg: null,
    skeletal_muscle_pct: null,
    subcutaneous_fat_pct: null,
    subcutaneous_fat_kg: null,
    visceral_fat_level: null,
    trunk_fat_mass_kg: null,
    trunk_fat_ratio_pct: null,
    body_water_pct: null,
    protein_pct: null,
    recommended_calorie_intake_kcal: null,
    bmr_kcal: null,
    metabolic_age: null,
    waist_hip_ratio: null,
    intracellular_water_kg: null,
    extracellular_water_kg: null,
    protein_mass_kg: null,
    mineral_mass_kg: null,
    left_arm_fat_ratio_pct: null,
    right_arm_fat_ratio_pct: null,
    left_arm_fat_mass_kg: null,
    right_arm_fat_mass_kg: null,
    left_arm_muscle_ratio_pct: null,
    right_arm_muscle_ratio_pct: null,
    left_arm_muscle_mass_kg: null,
    right_arm_muscle_mass_kg: null,
    left_leg_fat_ratio_pct: null,
    right_leg_fat_ratio_pct: null,
    left_leg_fat_mass_kg: null,
    right_leg_fat_mass_kg: null,
    left_leg_muscle_ratio_pct: null,
    right_leg_muscle_ratio_pct: null,
    left_leg_muscle_mass_kg: null,
    right_leg_muscle_mass_kg: null,
    flags: {},
  };

  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    const num = extractNumber(line);
    const status = extractStatus(line);

    // Date/Time
    if (lower.includes("date") || lower.includes("time")) {
      result.measured_at = parseDate(line);
      continue;
    }

    // Standard Weight (check before generic "weight")
    if (lower.includes("standard weight")) {
      result.standard_weight_kg = num;
      continue;
    }

    // Weight Control (check before generic "weight")
    if (lower.includes("weight control")) {
      result.weight_control_kg = num;
      continue;
    }

    // Weight
    if (lower.includes("weight")) {
      result.weight_kg = num;
      if (status) result.flags["weight"] = status;
      continue;
    }

    // BMI
    if (lower.includes("bmi")) {
      result.bmi = num;
      if (status) result.flags["bmi"] = status;
      continue;
    }

    // Heart Rate
    if (lower.includes("heart rate")) {
      result.heart_rate_bpm = num;
      continue;
    }

    // Health Score
    if (lower.includes("health score")) {
      result.health_score = num;
      continue;
    }

    // Recommended Calorie Intake (check before general calorie)
    if (lower.includes("recommended calorie")) {
      result.recommended_calorie_intake_kcal = num;
      continue;
    }

    // Waist Hip Ratio
    if (lower.includes("waist hip")) {
      result.waist_hip_ratio = num;
      continue;
    }

    // Trunk Fat Mass (check before "trunk fat ratio")
    if (lower.includes("trunk fat mass")) {
      result.trunk_fat_mass_kg = num;
      continue;
    }

    // Trunk Fat Ratio
    if (lower.includes("trunk fat ratio")) {
      result.trunk_fat_ratio_pct = num;
      continue;
    }

    // Subcutaneous Fat (must check before generic "body fat" or "fat")
    if (lower.includes("subcutaneous")) {
      if (lower.includes("kg") && !lower.includes("%")) {
        result.subcutaneous_fat_kg = num;
      } else {
        result.subcutaneous_fat_pct = num;
      }
      if (status) result.flags["subcutaneous_fat"] = status;
      continue;
    }

    // Body Fat
    if (lower.includes("body fat")) {
      if (lower.includes("%")) {
        result.body_fat_pct = num;
        if (status) result.flags["body_fat"] = status;
      } else {
        result.body_fat_kg = num;
      }
      continue;
    }

    // Lean Mass
    if (lower.includes("lean mass") || lower.includes("lean body mass")) {
      result.lean_mass_kg = num;
      if (status) result.flags["lean_mass"] = status;
      continue;
    }

    // Bone Mass
    if (lower.includes("bone")) {
      result.bone_mass_kg = num;
      if (status) result.flags["bone_mass"] = status;
      continue;
    }

    // Segmental — Arms (check before generic muscle)
    if (lower.includes("left arm fat ratio")) {
      result.left_arm_fat_ratio_pct = num;
      continue;
    }
    if (lower.includes("right arm fat ratio")) {
      result.right_arm_fat_ratio_pct = num;
      continue;
    }
    if (lower.includes("left arm fat mass")) {
      result.left_arm_fat_mass_kg = num;
      continue;
    }
    if (lower.includes("right arm fat mass")) {
      result.right_arm_fat_mass_kg = num;
      continue;
    }
    if (lower.includes("left arm muscle ratio")) {
      result.left_arm_muscle_ratio_pct = num;
      continue;
    }
    if (lower.includes("right arm muscle ratio")) {
      result.right_arm_muscle_ratio_pct = num;
      continue;
    }
    if (lower.includes("left arm muscle mass")) {
      result.left_arm_muscle_mass_kg = num;
      continue;
    }
    if (lower.includes("right arm muscle mass")) {
      result.right_arm_muscle_mass_kg = num;
      continue;
    }

    // Segmental — Legs (check before generic muscle)
    if (lower.includes("left leg fat ratio")) {
      result.left_leg_fat_ratio_pct = num;
      continue;
    }
    if (lower.includes("right leg fat ratio")) {
      result.right_leg_fat_ratio_pct = num;
      continue;
    }
    if (lower.includes("left leg fat mass")) {
      result.left_leg_fat_mass_kg = num;
      continue;
    }
    if (lower.includes("right leg fat mass")) {
      result.right_leg_fat_mass_kg = num;
      continue;
    }
    if (lower.includes("left leg muscle ratio")) {
      result.left_leg_muscle_ratio_pct = num;
      continue;
    }
    if (lower.includes("right leg muscle ratio")) {
      result.right_leg_muscle_ratio_pct = num;
      continue;
    }
    if (lower.includes("left leg muscle mass")) {
      result.left_leg_muscle_mass_kg = num;
      continue;
    }
    if (lower.includes("right leg muscle mass")) {
      result.right_leg_muscle_mass_kg = num;
      continue;
    }

    // Skeletal Muscle
    if (lower.includes("skeletal muscle") || lower.includes("muscle mass") || lower.includes("muscle")) {
      if (lower.includes("%")) {
        result.skeletal_muscle_pct = num;
      } else {
        result.skeletal_muscle_mass_kg = num;
        if (status) result.flags["skeletal_muscle"] = status;
      }
      continue;
    }

    // Visceral Fat
    if (lower.includes("visceral")) {
      result.visceral_fat_level = num;
      if (status) result.flags["visceral_fat"] = status;
      continue;
    }

    // Mineral Mass (check before protein)
    if (lower.includes("mineral")) {
      result.mineral_mass_kg = num;
      continue;
    }

    // Protein Mass (kg, not %) — check before generic protein
    if (lower.includes("protein")) {
      if (lower.includes("kg") && !lower.includes("%")) {
        result.protein_mass_kg = num;
      } else {
        result.protein_pct = num;
        if (status) result.flags["protein"] = status;
      }
      continue;
    }

    // Intracellular Water (check before generic water)
    if (lower.includes("intracellular water")) {
      result.intracellular_water_kg = num;
      continue;
    }

    // Extracellular Water (check before generic water)
    if (lower.includes("extracellular water")) {
      result.extracellular_water_kg = num;
      continue;
    }

    // Total Body Water (kg) — check before generic water %
    if (lower.includes("total body water") || (lower.includes("water") && lower.includes("kg") && !lower.includes("%"))) {
      result.total_body_water_kg = num;
      continue;
    }

    // Body Water (% — water ratio)
    if (lower.includes("water") || lower.includes("body water")) {
      result.body_water_pct = num;
      if (status) result.flags["body_water"] = status;
      continue;
    }

    // BMR
    if (lower.includes("bmr") || lower.includes("basal")) {
      result.bmr_kcal = num;
      if (status) result.flags["bmr"] = status;
      continue;
    }

    // Metabolic Age
    if (lower.includes("metabolic age") || lower.includes("metabolic")) {
      result.metabolic_age = num;
      if (status) result.flags["metabolic_age"] = status;
      continue;
    }
  }

  return result;
}
