import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InsightsClient } from "./InsightsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Insights | D100",
  description: "Personalized AI coaching summaries for each day of your 100-day transformation.",
};

export default async function InsightsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const profileId = (settings?.active_profile === "S" || settings?.active_profile === "A")
    ? (settings.active_profile as "S" | "A")
    : "S";

  const [profileRes, memberProfileRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("program_start_date, full_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("member_profiles")
      .select("program_start_date, full_name")
      .eq("user_id", user.id)
      .eq("profile_tag", profileId)
      .maybeSingle()
  ]);

  const profile = {
    ...profileRes.data,
    program_start_date: memberProfileRes.data?.program_start_date || profileRes.data?.program_start_date || null,
    full_name: memberProfileRes.data?.full_name || profileRes.data?.full_name || (profileId === "S" ? "Saba" : "Ancy"),
  };

  // Fetch all saved per-day insights
  const { data: history } = await supabase
    .from("ai_insights" as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("profile_tag", profileId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <InsightsClient
      userId={user.id}
      profileId={profileId}
      programStartDate={profile?.program_start_date || null}
      initialHistory={(history as any) || []}
    />
  );
}
