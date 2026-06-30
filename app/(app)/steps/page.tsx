import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StepsTrackerClient } from "./StepsClient";
import type { Metadata } from "next";

import { getTodayStr } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Steps Tracker | D100",
  description: "Log your daily steps and hit your movement goal.",
};

export default async function StepsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = getTodayStr();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const [y, m, dVal] = today.split("-").map(Number);
    const d = new Date(y, m - 1, dVal);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("sv-SE");
  });

  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("steps_goal")
    .eq("user_id", user.id)
    .single();

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);
  const stepsGoal = settingsData?.steps_goal ?? 10000;

  const { data: statsData } = await supabase
    .from("daily_stats")
    .select("stat_date,steps,steps_goal")
    .eq("user_id", target.userId)
    .eq("profile_tag", target.profileTag)
    .in("stat_date", dates)
    .order("stat_date");

  const statsMap = Object.fromEntries((statsData || []).map(r => [r.stat_date, r]));

  return (
    <StepsTrackerClient
      userId={target.userId}
      today={today}
      stepsGoal={stepsGoal}
      initialSteps={statsMap[today]?.steps ?? 0}
      historyDates={dates}
      historyStats={statsMap}
      isReadOnly={target.userId !== user.id}
    />
  );
}
