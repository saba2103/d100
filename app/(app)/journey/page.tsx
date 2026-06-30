import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JourneyClient } from "./JourneyClient";
import { getTodayStr } from "@/lib/utils/date";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Transformation Journey | D100",
  description: "Track your 100-day transformation story, milestones, and progress trajectory.",
};

export default async function JourneyPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profile & settings
  const { data: settings } = await supabase.from("user_settings").select("active_profile").eq("user_id", user.id).single();

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);

  const [profileRes, memberProfileRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", target.userId).single(),
    supabase.from("member_profiles").select("*").eq("user_id", target.userId).eq("profile_tag", target.profileTag).maybeSingle()
  ]);

  const profile = {
    ...profileRes.data,
    id: target.userId,
    program_start_date: memberProfileRes.data?.program_start_date || profileRes.data?.program_start_date || getTodayStr(),
    full_name: memberProfileRes.data?.full_name || profileRes.data?.full_name || (target.userId === user.id ? "Self" : "Partner"),
  };

  // Daily Stats for consistency and water
  const { data: dailyStats } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", target.userId)
    .eq("profile_tag", target.profileTag)
    .order("stat_date", { ascending: true });

  // Workout Logs
  const { data: workoutLogs } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", target.userId)
    .eq("profile_tag", target.profileTag)
    .order("logged_at", { ascending: true });

  // Supplement Logs
  const { data: supplementLogs } = await supabase
    .from("supplement_logs")
    .select("*")
    .eq("user_id", target.userId)
    .order("logged_at", { ascending: true });

  // Body Measurements
  const { data: bodyMeasurements } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", target.userId)
    .order("measured_at", { ascending: true });

  // User Badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", target.userId);

  // Nutrition Logs
  const { data: nutritionLogs } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", target.userId)
    .eq("profile_tag", target.profileTag);

  // Collection Items (Progress photos)
  const { data: collectionPhotos } = await supabase
    .from("collection_items")
    .select("*")
    .eq("user_id", target.userId)
    .eq("file_type", "photo")
    .order("created_at", { ascending: true });

  return (
    <JourneyClient
      profile={profile}
      activeProfile={target.profileTag}
      dailyStats={dailyStats || []}
      workoutLogs={workoutLogs || []}
      supplementLogs={supplementLogs || []}
      bodyMeasurements={bodyMeasurements || []}
      userBadges={userBadges || []}
      nutritionLogs={nutritionLogs || []}
      collectionPhotos={collectionPhotos || []}
    />
  );
}
