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

export function calculateWorkoutStreak(
  datesSet: Set<string>,
  programStartDateStr: string | null,
  todayStr?: string
): number {
  if (!programStartDateStr) {
    return calculateStreakFromDates(datesSet, todayStr);
  }

  const start = new Date(programStartDateStr);
  start.setHours(0, 0, 0, 0);

  const today = todayStr ? new Date(todayStr) : new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);
  currentDate.setHours(0, 0, 0, 0);

  const isRestDay = (date: Date): boolean => {
    const diffTime = date.getTime() - start.getTime();
    const programDay = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (programDay <= 0) return false;
    return programDay % 7 === 0;
  };

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayFormatted = formatDate(currentDate);
  let startCheckDate = new Date(currentDate);

  if (datesSet.has(todayFormatted) || isRestDay(currentDate)) {
    // Start check from today
  } else {
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = formatDate(yesterday);
    if (datesSet.has(yesterdayFormatted) || isRestDay(yesterday)) {
      startCheckDate = yesterday;
    } else {
      return 0;
    }
  }

  let walkDate = new Date(startCheckDate);
  walkDate.setHours(0, 0, 0, 0);
  let streak = 0;

  while (true) {
    const checkStr = formatDate(walkDate);
    if (walkDate.getTime() < start.getTime()) {
      break;
    }

    if (datesSet.has(checkStr) || isRestDay(walkDate)) {
      streak++;
      walkDate.setDate(walkDate.getDate() - 1);
    } else {
      break;
    }

    if (streak > 365) break;
  }

  return streak;
}

export async function workoutStreak(supabase: any, userId: string, profileTag: "S" | "P" = "S"): Promise<number> {
  const { data: logs, error: logsError } = await supabase
    .from("workout_logs")
    .select("logged_at")
    .eq("user_id", userId)
    .eq("profile_tag", profileTag);

  if (logsError || !logs) return 0;

  // Query program start date
  let startStr: string | null = null;
  if (profileTag === "P") {
    const { data: mp } = await supabase
      .from("member_profiles")
      .select("program_start_date")
      .eq("user_id", userId)
      .eq("profile_tag", "P")
      .maybeSingle();
    startStr = mp?.program_start_date || null;
  }

  if (!startStr) {
    const { data: p } = await supabase
      .from("profiles")
      .select("program_start_date")
      .eq("id", userId)
      .single();
    startStr = p?.program_start_date || null;
  }

  const datesSet = new Set<string>(logs.map((d: any) => d.logged_at));
  return calculateWorkoutStreak(datesSet, startStr);
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
