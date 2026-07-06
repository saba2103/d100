export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalculatorClient } from "./CalculatorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calorie & Macro Calculator | D100",
  description: "Calculate your personalized calorie and macronutrient targets.",
};

export default async function CalculatorPage() {
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

  // 1. Get latest logged weight from body_measurements
  const { data: latestMeasurement } = await supabase
    .from("body_measurements")
    .select("weight_kg")
    .eq("user_id", target.userId)
    .eq("profile_tag", target.profileTag)
    .order("measured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2. Get starting weight from member_profiles
  const { data: memberProfile } = await supabase
    .from("member_profiles")
    .select("starting_weight_kg")
    .eq("user_id", target.userId)
    .eq("profile_tag", target.profileTag)
    .maybeSingle();

  const userWeight = latestMeasurement?.weight_kg 
    ? Number(latestMeasurement.weight_kg) 
    : memberProfile?.starting_weight_kg 
      ? Number(memberProfile.starting_weight_kg) 
      : null;

  return (
    <CalculatorClient
      initialWeight={userWeight}
    />
  );
}
