import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LibraryClient } from "./LibraryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exercise Library | D100",
  description: "Browse and watch demonstration videos for all transformation exercises.",
};

export default async function LibraryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <LibraryClient />;
}
