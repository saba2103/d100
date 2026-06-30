export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import { workoutStreak } from "@/lib/streaks";
import { checkAndAwardBadges } from "@/lib/achievements";
import { getTodayStr } from "@/lib/utils/date";
import { getProfileQueryTarget } from "@/lib/profileConnection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | D100",
  description: "View your daily stats, log workouts, and track progress.",
};

export default async function DashboardPage() {
  const supabase = createClient();

  // 1. Fetch current session user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // 2. Fetch user settings to get active profile
  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const settings = settingsData || {
    user_id: user.id,
    theme: "dark",
    water_goal_ml: 3000,
    steps_goal: 10000,
    calories_goal: 2000,
    active_profile: "S",
  };

  const activeProfile = settings.active_profile as "S" | "P";
  const target = await getProfileQueryTarget(supabase, user.id);

  // Sync / catch-up earned badges for target profile
  await checkAndAwardBadges(target.userId, target.profileTag);

  const todayStr = getTodayStr();

  // 3. Query initial data in parallel
  const [
    profileRes,
    memberProfileRes,
    dailyStatsRes,
    workoutLogRes,
    supplementLogRes,
    bodyMeasurementsRes,
    badgesRes,
    wStreak,
    aiInsightsRes,
    nutritionLogsRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", target.userId)
      .single(),
    
    supabase
      .from("member_profiles")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .maybeSingle(),

    supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .eq("stat_date", todayStr)
      .maybeSingle(),
    
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .eq("logged_at", todayStr)
      .order("created_at", { ascending: false }),
    
    supabase
      .from("supplement_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .eq("logged_at", todayStr)
      .maybeSingle(),
    
    supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .order("measured_at", { ascending: false })
      .limit(2),
    
    supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .order("earned_at", { ascending: false }),

    workoutStreak(supabase, target.userId, target.profileTag),

    supabase
      .from("ai_insights" as any)
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .order("created_at", { ascending: false }),

    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .eq("logged_at", todayStr),
  ]);

  const profile = {
    ...profileRes.data,
    id: target.userId,
    program_start_date: memberProfileRes.data?.program_start_date || profileRes.data?.program_start_date || todayStr,
    full_name: memberProfileRes.data?.full_name || profileRes.data?.full_name || (target.userId === user.id ? "Self" : "Partner"),
  };

  return (
    <DashboardClient
      profile={profile}
      settings={settings}
      initialDailyStats={dailyStatsRes.data}
      initialWorkoutLog={workoutLogRes.data && workoutLogRes.data.length > 0 ? workoutLogRes.data[0] : null}
      initialSupplementLog={supplementLogRes.data}
      initialNutritionLogs={nutritionLogsRes.data || []}
      bodyMeasurements={bodyMeasurementsRes.data || []}
      userBadges={badgesRes.data || []}
      workoutStreak={wStreak}
      today={todayStr}
      initialInsights={aiInsightsRes.data || []}
      isReadOnly={target.userId !== user.id}
    />
  );
}
