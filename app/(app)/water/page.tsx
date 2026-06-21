import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WaterTrackerClient } from "./WaterClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water Tracker | D100",
  description: "Track your daily hydration and hit your water goal.",
};

export default async function WaterPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Last 7 days dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("water_goal_ml, active_profile")
    .eq("user_id", user.id)
    .single();

  const activeProfile = settingsData?.active_profile || "S";
  const waterGoal = settingsData?.water_goal_ml ?? 3000;

  const { data: statsData } = await supabase
    .from("daily_stats")
    .select("stat_date,water_ml,water_goal_ml")
    .eq("user_id", user.id)
    .eq("profile_tag", activeProfile)
    .in("stat_date", dates)
    .order("stat_date");

  const statsMap = Object.fromEntries((statsData || []).map(r => [r.stat_date, r]));
  const todayStats = statsMap[today];

  return (
    <WaterTrackerClient
      userId={user.id}
      today={today}
      waterGoal={waterGoal}
      initialWaterMl={todayStats?.water_ml ?? 0}
      initialStatsId={null}
      historyDates={dates}
      historyStats={statsMap}
    />
  );
}
