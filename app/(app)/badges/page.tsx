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

  // Sync / catch-up earned badges
  await checkAndAwardBadges(user.id);

  // 1. Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("program_start_date")
    .eq("id", user.id)
    .single();

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr);

  let program_day = 1;
  let workout_days_missed = 0;
  const startStr = profile?.program_start_date;

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
    const diffTime = today.getTime() - start.getTime();
    program_day = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

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

  // 3. Compute streaks
  const wStreak = await workoutStreak(supabase, user.id);
  const nStreak = await nutritionStreak(supabase, user.id);
  const watStreak = await waterStreak(supabase, user.id);

  // 4. Fetch earned badges
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", user.id);

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
