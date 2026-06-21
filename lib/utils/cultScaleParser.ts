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
  bmi: number | null;
  body_fat_pct: number | null;
  body_fat_kg: number | null;
  lean_mass_kg: number | null;
  bone_mass_kg: number | null;
  skeletal_muscle_mass_kg: number | null;
  skeletal_muscle_pct: number | null;
  subcutaneous_fat_pct: number | null;
  visceral_fat_level: number | null;
  protein_pct: number | null;
  body_water_pct: number | null;
  bmr_kcal: number | null;
  metabolic_age: number | null;
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
    weight_kg: null, bmi: null, body_fat_pct: null, body_fat_kg: null,
    lean_mass_kg: null, bone_mass_kg: null, skeletal_muscle_mass_kg: null,
    skeletal_muscle_pct: null, subcutaneous_fat_pct: null, visceral_fat_level: null,
    protein_pct: null, body_water_pct: null, bmr_kcal: null, metabolic_age: null,
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

    // Subcutaneous Fat (must check before generic "body fat" or "fat")
    if (lower.includes("subcutaneous")) {
      result.subcutaneous_fat_pct = num;
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

    // Protein
    if (lower.includes("protein")) {
      result.protein_pct = num;
      if (status) result.flags["protein"] = status;
      continue;
    }

    // Body Water
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
