import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupplementsClient } from "./SupplementsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supplements | D100",
  description: "Track your daily supplements, compliance, and streaks.",
};

export default async function SupplementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch past 30 days of supplement logs for streak and grid calculations
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

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
