import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogMeasurementClient } from "./LogClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Measurement | D100",
  description: "Manually log body measurements or import from Cult Smart Scale.",
};

export default async function LogMeasurementPage({ searchParams }: { searchParams: { edit?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <LogMeasurementClient userId={user.id} editId={searchParams.edit} />;
}
