import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BadgesClient } from "./BadgesClient";
import { workoutStreak, nutritionStreak, waterStreak } from "@/lib/streaks";
import { checkAndAwardBadges } from "@/lib/achievements";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements | D100",
  description: "View your earned badges, milestone achievements, and progress.",
};

export default async function BadgesPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Get active profile
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_profile")
    .eq("user_id", user.id)
    .single();
  const activeProfile = settings?.active_profile || "S";

  // Sync / catch-up earned badges (tag-aware)
  await checkAndAwardBadges(user.id, activeProfile);

  // 1. Fetch profiles and member_profiles
  const [profileRes, memberProfileRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("program_start_date")
      .eq("id", user.id)
      .single(),
    supabase
      .from("member_profiles")
      .select("program_start_date")
      .eq("user_id", user.id)
      .eq("profile_tag", activeProfile)
      .maybeSingle()
  ]);

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr);

  let program_day = 1;
  let workout_days_missed = 0;
  const startStr = memberProfileRes.data?.program_start_date || profileRes.data?.program_start_date;

  // 2. Fetch workout logs
  const { data: workoutLogs } = await supabase
    .from("workout_logs")
    .select("logged_at")
    .eq("user_id", user.id);

  const workout_count = workoutLogs ? workoutLogs.length : 0;
  const workoutDates = new Set<string>(
    workoutLogs ? workoutLogs.map((log: any) => log.logged_at) : []
  );

  if (startStr) {
    const start = new Date(startStr);
    start.setHours(0, 0, 0, 0);
    const target = new Date(today);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - start.getTime();
    program_day = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Calculate missed workouts on Mon/Wed/Fri before today
    let iter = new Date(start);
    while (iter < today) {
      const dayOfWeek = iter.getDay();
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

  // 3. Compute streaks (tag-aware)
  const wStreak = await workoutStreak(supabase, user.id, activeProfile);
  const nStreak = await nutritionStreak(supabase, user.id, activeProfile);
  const watStreak = await waterStreak(supabase, user.id, activeProfile);

  // 4. Fetch earned badges for active profile tag
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", user.id)
    .eq("profile_tag", activeProfile);

  const earnedList = earnedBadges || [];

  return (
    <BadgesClient
      earnedList={earnedList}
      stats={{
        workout_count,
        workout_streak: wStreak,
        nutrition_streak: nStreak,
        water_goal_streak: watStreak,
        program_day,
        workout_days_missed,
      }}
    />
  );
}
export const dynamic = "force-dynamic";
