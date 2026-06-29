import { createClient } from "@/lib/supabase/server";
import { BADGES } from "./badges";
import { workoutStreak, waterStreak, nutritionStreak } from "./streaks";

export async function checkAndAwardBadges(userId: string, profileTag: "S" | "A" = "S"): Promise<string[]> {
  const supabase = createClient();

  // 1. Fetch member profile
  const { data: profile, error: profileErr } = await supabase
    .from("member_profiles")
    .select("program_start_date")
    .eq("user_id", userId)
    .eq("profile_tag", profileTag)
    .maybeSingle();

  if (profileErr || !profile) return [];

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr);

  let program_day = 1;
  let workout_days_missed = 0;

  const startStr = profile.program_start_date;
  let workoutDates: Set<string> = new Set();

  // 2. Fetch workout logs
  const { data: workoutLogs } = await supabase
    .from("workout_logs")
    .select("logged_at")
    .eq("user_id", userId)
    .eq("profile_tag", profileTag);

  const workout_count = workoutLogs ? workoutLogs.length : 0;

  if (workoutLogs) {
    workoutDates = new Set(workoutLogs.map((log: any) => log.logged_at));
  }

  if (startStr) {
    const start = new Date(startStr);
    start.setHours(0, 0, 0, 0);
    const target = new Date(today);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    program_day = Math.max(1, diffDays);

    // Calculate missed workouts on Mon/Wed/Fri between start date and today (excluding today)
    let iter = new Date(start);
    while (iter < today) {
      const dayOfWeek = iter.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const isTrainingDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
      if (isTrainingDay) {
        const iterStr = iter.toISOString().split("T")[0];
        if (!workoutDates.has(iterStr)) {
          workout_days_missed++;
        }
      }
      iter.setDate(iter.getDate() + 1);
    }
  }

  // 3. Compute streaks
  const wStreak = await workoutStreak(supabase, userId, profileTag);
  const nStreak = await nutritionStreak(supabase, userId, profileTag);
  const watStreak = await waterStreak(supabase, userId, profileTag);

  // Phase 1 completion is day > 35 (Phase 1 is days 1-35)
  const phase_1_complete = program_day > 35;

  // 4. Evaluate badges
  const newlyUnlocked: string[] = [];

  // Fetch already earned badges
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId)
    .eq("profile_tag", profileTag);

  const earnedSet = new Set<string>(earnedBadges ? earnedBadges.map((b: any) => b.badge_id) : []);

  for (const badge of BADGES) {
    if (earnedSet.has(badge.id)) continue;

    let conditionMet = false;

    switch (badge.id) {
      case "first_spark":
        conditionMet = workout_count >= 1;
        break;
      case "week_warrior":
        conditionMet = workout_count >= 7;
        break;
      case "clean_machine":
        conditionMet = nStreak >= 7;
        break;
      case "iron_will":
        conditionMet = wStreak >= 14;
        break;
      case "golden_run":
        conditionMet = wStreak >= 21;
        break;
      case "phase_champ":
        conditionMet = phase_1_complete;
        break;
      case "hydration_hero":
        conditionMet = watStreak >= 30;
        break;
      case "no_mercy":
        conditionMet = workout_days_missed === 0 && program_day >= 30;
        break;
    }

    if (conditionMet) {
      // Award badge!
      const { error: insertErr } = await supabase
        .from("user_badges")
        .insert({
          user_id: userId,
          badge_id: badge.id,
          profile_tag: profileTag,
        });

      if (!insertErr) {
        newlyUnlocked.push(badge.id);
      }
    }
  }

  return newlyUnlocked;
}
