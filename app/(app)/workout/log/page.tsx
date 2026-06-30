import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActiveWorkoutClient } from "./ActiveWorkoutClient";
import type { Metadata } from "next";

import { getTodayStr } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Track Session | D100",
  description: "Track exercises, weights, sets, and rest times in real-time.",
};

interface SearchParams {
  date?: string;
  edit?: string;
}

export default async function LogWorkoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const todayStr = getTodayStr();
  const targetDate = searchParams.date || todayStr;
  const isEditing = searchParams.edit === "true";

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);

  // Fetch profile, last logged workout (for placeholders), and optionally the current logged workout (if editing)
  const [profileRes, memberProfileRes, lastWorkoutRes, currentWorkoutRes] = await Promise.all([
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
    
    // Find last logged workout before the target date
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .lt("logged_at", targetDate)
      .order("logged_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    
    // Fetch current workout if editing or checking if already logged
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .eq("logged_at", targetDate)
      .maybeSingle(),
  ]);

  const profile = {
    ...profileRes.data,
    id: target.userId,
    program_start_date: memberProfileRes.data?.program_start_date || profileRes.data?.program_start_date || todayStr,
    full_name: memberProfileRes.data?.full_name || profileRes.data?.full_name || (target.profileTag === "S" ? "Saba" : "Ancy"),
  };

  return (
    <ActiveWorkoutClient
      profile={profile}
      lastWorkout={lastWorkoutRes.data}
      currentWorkout={currentWorkoutRes.data}
      targetDate={targetDate}
      isEditing={isEditing}
    />
  );
}
