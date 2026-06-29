import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrendsClient } from "./TrendsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Body Composition Trends | D100",
  description: "Track long-term progress trends for all body composition metrics since Day 1.",
};

export default async function TrendsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: measurements } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("measured_at", { ascending: false });

  return <TrendsClient userId={user.id} measurements={measurements || []} />;
}
