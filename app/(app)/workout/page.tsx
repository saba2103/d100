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

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);

  // Fetch profile and recent workouts
  const [profileRes, memberProfileRes, workoutsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", target.userId)
      .single(),
    supabase
      .from("member_profiles")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .maybeSingle(),
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .order("logged_at", { ascending: false })
      .limit(30),
  ]);

  const profile = {
    ...profileRes.data,
    id: target.userId,
    program_start_date: memberProfileRes.data?.program_start_date || profileRes.data?.program_start_date || todayStr,
    full_name: memberProfileRes.data?.full_name || profileRes.data?.full_name || (target.profileTag === "S" ? "Saba" : "Ancy"),
  };

  const workouts = workoutsRes.data || [];

  return (
    <WorkoutHomeClient
      profile={profile}
      initialWorkouts={workouts}
      today={todayStr}
      isReadOnly={target.userId !== user.id}
    />
  );
}
