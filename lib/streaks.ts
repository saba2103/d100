import { createClient } from "@/lib/supabase/server";

// Helper to count streak from a set of dates
export function calculateStreakFromDates(datesSet: Set<string>, todayStr?: string): number {
  const today = todayStr || new Date().toISOString().split("T")[0];
  let currentDate = new Date(today);
  let streak = 0;

  // Check if today is present
  const todayStrFormatted = currentDate.toISOString().split("T")[0];
  if (datesSet.has(todayStrFormatted)) {
    // Start from today
  } else {
    // If today is not present, check if yesterday is present to keep streak alive
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = currentDate.toISOString().split("T")[0];
    if (!datesSet.has(yesterdayStr)) {
      return 0;
    }
  }

  while (true) {
    const checkStr = currentDate.toISOString().split("T")[0];
    if (datesSet.has(checkStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
    // Safety break to prevent infinite loops
    if (streak > 365) break;
  }

  return streak;
}

export async function workoutStreak(supabase: any, userId: string, profileTag: "S" | "P" = "S"): Promise<number> {
  const { data, error } = await supabase
    .from("workout_logs")
    .select("logged_at")
    .eq("user_id", userId)
    .eq("profile_tag", profileTag);

  if (error || !data) return 0;

  const datesSet = new Set<string>(data.map((d: any) => d.logged_at));
  return calculateStreakFromDates(datesSet);
}

export async function waterStreak(supabase: any, userId: string, profileTag: "S" | "P" = "S"): Promise<number> {
  const { data, error } = await supabase
    .from("daily_stats")
    .select("stat_date, water_ml, water_goal_ml")
    .eq("user_id", userId)
    .eq("profile_tag", profileTag);

  if (error || !data) return 0;

  const validDates = data
    .filter((d: any) => d.water_ml >= d.water_goal_ml)
    .map((d: any) => d.stat_date);

  const datesSet = new Set<string>(validDates);
  return calculateStreakFromDates(datesSet);
}

export async function nutritionStreak(supabase: any, userId: string, profileTag: "S" | "P" = "S"): Promise<number> {
  const { data, error } = await supabase
    .from("nutrition_logs")
    .select("logged_at")
    .eq("user_id", userId)
    .eq("profile_tag", profileTag);

  if (error || !data) return 0;

  const datesSet = new Set<string>(data.map((d: any) => d.logged_at));
  return calculateStreakFromDates(datesSet);
}

const COACH_SUPPS = [
  "Whey Protein",
  "Creatine",
  "Multivitamin",
  "Fish Oil (Omega-3)",
  "Vitamin D3 + K2",
];

export async function supplementStreak(supabase: any, userId: string, profileTag: "S" | "P" = "S"): Promise<number> {
  const { data, error } = await supabase
    .from("supplement_logs")
    .select("logged_at, supplements")
    .eq("user_id", userId)
    .eq("profile_tag", profileTag);

  if (error || !data) return 0;

  const validDates = data
    .filter((log: any) => {
      if (!log.supplements || !Array.isArray(log.supplements)) return false;
      // All 5 coach supplements must be taken
      return COACH_SUPPS.every(name =>
        log.supplements.some((s: any) => s.name === name && (s.taken || s.taken_at))
      );
    })
    .map((log: any) => log.logged_at);

  const datesSet = new Set<string>(validDates);
  return calculateStreakFromDates(datesSet);
}
