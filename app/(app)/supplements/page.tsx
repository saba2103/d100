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

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);

  const [{ data: logsRes }, { data: profileData }] = await Promise.all([
    supabase.from("supplement_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .gte("logged_at", thirtyDaysAgoStr)
      .order("logged_at", { ascending: false }),
    supabase.from("profiles").select("program_start_date").eq("id", target.userId).maybeSingle()
  ]);

  return (
    <SupplementsClient
      userId={target.userId}
      today={todayStr}
      programStartDate={profileData?.program_start_date ?? null}
      initialLogs={logsRes || []}
      isReadOnly={target.userId !== user.id}
    />
  );
}
