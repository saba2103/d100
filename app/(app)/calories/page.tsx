import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CaloriesTrackerClient } from "./CaloriesClient";
import type { Metadata } from "next";

import { getTodayStr } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Calories | D100",
  description: "Track consumed, burned, and net calories daily.",
};

export default async function CaloriesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = getTodayStr();

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);

  const [{ data: settingsData }, { data: profileData }] = await Promise.all([
    supabase.from("user_settings").select("calories_goal").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("program_start_date").eq("id", target.userId).maybeSingle()
  ]);

  const caloriesGoal = settingsData?.calories_goal ?? 2000;

  const [statsRes, nutritionLogsRes, bodyRes] = await Promise.all([
    supabase.from("daily_stats")
      .select("calories_consumed,calories_burned,calories_goal")
      .eq("user_id", target.userId).eq("profile_tag", target.profileTag).eq("stat_date", today).maybeSingle(),
    supabase.from("nutrition_logs").select("items").eq("user_id", target.userId).eq("profile_tag", target.profileTag).eq("logged_at", today),
    supabase.from("body_measurements").select("bmr_kcal").eq("user_id", target.userId).eq("profile_tag", target.profileTag)
      .order("measured_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  // Sum nutrition logs for consumed calories
  const consumed = (nutritionLogsRes.data || []).reduce((sum, log) => {
    const items = (log.items as any[]) || [];
    return sum + items.reduce((s: number, i: any) => s + (Number(i.calories) || 0), 0);
  }, 0);

  return (
    <CaloriesTrackerClient
      userId={target.userId}
      today={today}
      programStartDate={profileData?.program_start_date ?? null}
      caloriesGoal={caloriesGoal}
      consumed={consumed}
      initialBurned={statsRes.data?.calories_burned ?? 0}
      bmrKcal={bodyRes.data?.bmr_kcal ?? null}
      isReadOnly={target.userId !== user.id}
    />
  );
}
