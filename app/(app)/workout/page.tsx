import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkoutHomeClient } from "./WorkoutHomeClient";
import type { Metadata } from "next";

import { getTodayStr } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Workout Tracker | D100",
  description: "Track your workouts, stay consistent, and view progress history.",
};

export default async function WorkoutPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const todayStr = getTodayStr();

  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("active_profile")
    .eq("user_id", user.id)
    .single();

  const activeProfile = settingsData?.active_profile || "S";

  // Fetch profile and recent workouts
  const [profileRes, memberProfileRes, workoutsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("member_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("profile_tag", activeProfile)
      .maybeSingle(),
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("profile_tag", activeProfile)
      .order("logged_at", { ascending: false })
      .limit(30),
  ]);

  const profile = {
    ...profileRes.data,
    id: user.id,
    program_start_date: memberProfileRes.data?.program_start_date || profileRes.data?.program_start_date || todayStr,
    full_name: memberProfileRes.data?.full_name || profileRes.data?.full_name || (activeProfile === "S" ? "Saba" : "Ancy"),
  };

  const workouts = workoutsRes.data || [];

  return (
    <WorkoutHomeClient
      profile={profile}
      initialWorkouts={workouts}
      today={todayStr}
    />
  );
}
