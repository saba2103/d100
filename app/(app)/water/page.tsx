import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WaterTrackerClient } from "./WaterClient";
import type { Metadata } from "next";

import { getTodayStr } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Water Tracker | D100",
  description: "Track your daily hydration and hit your water goal.",
};

export default async function WaterPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = getTodayStr();

  // Last 7 days dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const [y, m, dVal] = today.split("-").map(Number);
    const d = new Date(y, m - 1, dVal);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("sv-SE");
  });

  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("water_goal_ml")
    .eq("user_id", user.id)
    .single();

  const waterGoal = settingsData?.water_goal_ml ?? 3000;

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);

  const [{ data: statsData }, { data: profileData }] = await Promise.all([
    supabase.from("daily_stats")
      .select("stat_date,water_ml,water_goal_ml")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .in("stat_date", dates)
      .order("stat_date"),
    supabase.from("profiles").select("program_start_date").eq("id", target.userId).maybeSingle()
  ]);

  const statsMap = Object.fromEntries((statsData || []).map(r => [r.stat_date, r]));
  const todayStats = statsMap[today];

  return (
    <WaterTrackerClient
      userId={target.userId}
      today={today}
      programStartDate={profileData?.program_start_date ?? null}
      waterGoal={waterGoal}
      initialWaterMl={todayStats?.water_ml ?? 0}
      initialStatsId={null}
      historyDates={dates}
      historyStats={statsMap}
      isReadOnly={target.userId !== user.id}
    />
  );
}
