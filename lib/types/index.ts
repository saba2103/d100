// ── User ──────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

// ── Workout ───────────────────────────────────────────────────────
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number; // kg
  duration?: number; // seconds
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  date: string; // ISO date string
  title?: string;
  exercises: Exercise[];
  duration?: number; // minutes
  notes?: string;
  created_at: string;
}

// ── Nutrition ─────────────────────────────────────────────────────
export interface MacroEntry {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number; // g
}

export interface NutritionLog {
  id: string;
  user_id: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  food_name: string;
  quantity: number;
  unit: string;
  macros: MacroEntry;
  created_at: string;
}

// ── Body Stats ────────────────────────────────────────────────────
export interface BodyStatEntry {
  id: string;
  user_id: string;
  date: string;
  weight?: number; // kg
  body_fat_pct?: number;
  muscle_mass?: number; // kg
  waist?: number; // cm
  chest?: number; // cm
  notes?: string;
  created_at: string;
}

// ── Daily Tracking ────────────────────────────────────────────────
export interface WaterLog {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  created_at: string;
}

export interface StepsLog {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  created_at: string;
}

export interface CaloriesLog {
  id: string;
  user_id: string;
  date: string;
  burned: number;
  created_at: string;
}

// ── Supplements ───────────────────────────────────────────────────
export interface Supplement {
  id: string;
  name: string;
  dose: string;
  timing: string;
  notes?: string;
}

export interface SupplementLog {
  id: string;
  user_id: string;
  date: string;
  supplement_id: string;
  taken: boolean;
  created_at: string;
}

// ── Badges ────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

// ── App State ─────────────────────────────────────────────────────
export type Theme = "dark" | "light" | "system";

export interface DailyProgress {
  date: string;
  workout_done: boolean;
  water_pct: number; // 0-100
  steps_pct: number; // 0-100
  calories_met: boolean;
  nutrition_logged: boolean;
}
