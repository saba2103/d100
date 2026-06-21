import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CollectionClient } from "./CollectionClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection | D100",
  description: "D100 private media gallery and documents storage.",
};

export default async function CollectionPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial collection items sorted by taken_at DESC
  const { data: items } = await supabase
    .from("collection_items")
    .select("*")
    .order("taken_at", { ascending: false });

  return (
    <CollectionClient
      userId={user.id}
      initialItems={items || []}
    />
  );
}
