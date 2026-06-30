import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NutritionClient } from "./NutritionClient";
import type { Metadata } from "next";

import { getTodayStr } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Nutrition | D100",
  description: "Track your daily meals, macros, and calorie goals.",
};

export default async function NutritionPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const todayStr = getTodayStr();

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

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);

  const [profileRes, memberProfileRes, nutritionLogsRes, dailyStatsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", target.userId).single(),
      supabase
        .from("member_profiles")
        .select("*")
        .eq("user_id", target.userId)
        .eq("profile_tag", target.profileTag)
        .maybeSingle(),
      supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", target.userId)
        .eq("profile_tag", target.profileTag)
        .eq("logged_at", todayStr),
      supabase
        .from("daily_stats")
        .select("*")
        .eq("user_id", target.userId)
        .eq("profile_tag", target.profileTag)
        .eq("stat_date", todayStr)
        .maybeSingle(),
    ]);

  const profile = {
    ...profileRes.data,
    id: target.userId,
    program_start_date: memberProfileRes.data?.program_start_date || profileRes.data?.program_start_date || todayStr,
    full_name: memberProfileRes.data?.full_name || profileRes.data?.full_name || (target.profileTag === "S" ? "Saba" : "Ancy"),
  };

  return (
    <NutritionClient
      profile={profile}
      settings={settings}
      initialLogs={(nutritionLogsRes.data || []) as any[]}
      initialDailyStats={dailyStatsRes.data}
      today={todayStr}
      isReadOnly={target.userId !== user.id}
    />
  );
}
