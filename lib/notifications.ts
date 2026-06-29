import { createClient } from "@/lib/supabase/client";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  body?: string;
  action_url?: string;
  icon?: string;
}

export async function createNotification({
  userId,
  title,
  body = "",
  action_url = "/",
  icon = "/icons/icon-192.svg",
}: CreateNotificationParams) {
  try {
    const supabase = createClient();

    // 1. Insert into notifications table
    try {
      await (supabase.from("notifications" as any) as any).insert({
        user_id: userId,
        title,
        body,
        action_url,
        icon,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error inserting notification to DB:", err);
    }

    // 2. Automatically trigger PWA web push notification
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    await fetch(`${baseUrl}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title,
        body,
        action_url,
        icon,
      }),
    });
  } catch (error) {
    console.error("Error in createNotification:", error);
  }
}
