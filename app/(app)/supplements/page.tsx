import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupplementsClient } from "./SupplementsClient";
import type { Metadata } from "next";

import { getTodayStr } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Supplements | D100",
  description: "Track your daily supplements, compliance, and streaks.",
};

export default async function SupplementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const todayStr = getTodayStr();

  // Fetch past 30 days of supplement logs for streak and grid calculations
  const [y, m, dVal] = todayStr.split("-").map(Number);
  const thirtyDaysAgo = new Date(y, m - 1, dVal);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toLocaleDateString("sv-SE");

  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("active_profile")
    .eq("user_id", user.id)
    .single();

  const activeProfile = settingsData?.active_profile || "S";

  const { data: logsRes } = await supabase
    .from("supplement_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("profile_tag", activeProfile)
    .gte("logged_at", thirtyDaysAgoStr)
    .order("logged_at", { ascending: false });

  return (
    <SupplementsClient
      userId={user.id}
      today={todayStr}
      initialLogs={logsRes || []}
    />
  );
}
