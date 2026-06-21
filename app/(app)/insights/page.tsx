import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InsightsClient } from "./InsightsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Insights | D100",
  description: "Personalized fitness coaching insights powered by AI.",
};

export default async function InsightsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch settings to check if key is set up and get active profile
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const hasApiKey = !!(settings?.ai_api_key_encrypted);
  const profileId = (settings?.active_profile === "S" || settings?.active_profile === "A")
    ? (settings.active_profile as "S" | "A")
    : "S";

  // Fetch history of last 10 insights for the current profile
  const { data: history } = await supabase
    .from("ai_insights" as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("profile_tag", profileId)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <InsightsClient
      userId={user.id}
      profileId={profileId}
      hasApiKey={hasApiKey}
      initialHistory={(history as any) || []}
    />
  );
}
