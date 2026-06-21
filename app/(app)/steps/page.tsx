import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StepsTrackerClient } from "./StepsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steps Tracker | D100",
  description: "Log your daily steps and hit your movement goal.",
};

export default async function StepsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("steps_goal, active_profile")
    .eq("user_id", user.id)
    .single();

  const activeProfile = settingsData?.active_profile || "S";
  const stepsGoal = settingsData?.steps_goal ?? 10000;

  const { data: statsData } = await supabase
    .from("daily_stats")
    .select("stat_date,steps,steps_goal")
    .eq("user_id", user.id)
    .eq("profile_tag", activeProfile)
    .in("stat_date", dates)
    .order("stat_date");

  const statsMap = Object.fromEntries((statsData || []).map(r => [r.stat_date, r]));

  return (
    <StepsTrackerClient
      userId={user.id}
      today={today}
      stepsGoal={stepsGoal}
      initialSteps={statsMap[today]?.steps ?? 0}
      historyDates={dates}
      historyStats={statsMap}
    />
  );
}
