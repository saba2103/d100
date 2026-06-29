import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationsClient } from "./NotificationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | D100",
  description: "View your in-app notification history and badge alerts.",
};

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: initialNotifications } = await (supabase.from("notifications" as any) as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <NotificationsClient
      userId={user.id}
      initialNotifications={initialNotifications || []}
    />
  );
}
