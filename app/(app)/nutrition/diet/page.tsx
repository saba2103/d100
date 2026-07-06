export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DietClient } from "./DietClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diet Plan | D100",
  description: "View your phase 2 coach diet plan customized to your body weight.",
};

export default async function DietPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, user.id);

  // Fetch latest weight measurement for the active profile
  const { data: latestMeasurement } = await supabase
    .from("body_measurements")
    .select("weight_kg")
    .eq("user_id", target.userId)
    .eq("profile_tag", target.profileTag)
    .order("measured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const userWeight = latestMeasurement?.weight_kg ? Number(latestMeasurement.weight_kg) : null;

  return (
    <DietClient
      userWeight={userWeight}
    />
  );
}
