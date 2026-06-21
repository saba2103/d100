import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BodyStatsClient } from "./BodyStatsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Body Stats | D100",
  description: "Track your body composition, weight trends, and scale data.",
};

export default async function BodyStatsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Last 30 measurements (covers >30 days for charts)
  const { data: measurements } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("measured_at", { ascending: false })
    .limit(30);

  return (
    <BodyStatsClient
      userId={user.id}
      measurements={measurements || []}
    />
  );
}
