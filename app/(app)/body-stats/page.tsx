import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BodyStatsClient } from "./BodyStatsClient";
import { getTodayStr } from "@/lib/utils/date";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Body Stats | D100",
  description: "Track your body composition, weight trends, and scale data.",
};

export default async function BodyStatsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = getTodayStr();

  // Last 30 measurements (covers >30 days for charts)
  const [{ data: measurements }, { data: profileData }] = await Promise.all([
    supabase.from("body_measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: false })
      .limit(30),
    supabase.from("profiles").select("program_start_date").eq("id", user.id).maybeSingle()
  ]);

  return (
    <BodyStatsClient
      userId={user.id}
      today={today}
      programStartDate={profileData?.program_start_date ?? null}
      measurements={measurements || []}
    />
  );
}
