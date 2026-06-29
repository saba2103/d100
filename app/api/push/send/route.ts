import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId, title, body, action_url, icon } = await req.json();

    if (!userId || !title) {
      return NextResponse.json({ error: "Missing required fields (userId, title)." }, { status: 400 });
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || "mailto:sabarathinamk@gmail.com";

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("Missing VAPID keys in environment variables.");
      return NextResponse.json({ error: "Server VAPID keys unconfigured." }, { status: 500 });
    }

    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

    const supabase = createClient();
    const { data: subscriptions, error } = await (supabase.from("push_subscriptions" as any) as any)
      .select("*")
      .eq("user_id", userId);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, message: "No active push subscriptions found." });
    }

    const payload = JSON.stringify({
      title,
      body: body || "",
      action_url: action_url || "/",
      icon: icon || "/icons/icon-192.svg",
    });

    let sent = 0;
    let failed = 0;

    for (const subRow of subscriptions as any[]) {
      try {
        await webpush.sendNotification(subRow.subscription, payload);
        sent++;
      } catch (err: any) {
        failed++;
        console.error(`Error sending push notification to subscription ${subRow.id}:`, err);

        // Clean up expired / unregistered subscriptions (HTTP 404 or 410)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await (supabase.from("push_subscriptions" as any) as any).delete().eq("id", subRow.id);
        }
      }
    }

    return NextResponse.json({ sent, failed });
  } catch (error: any) {
    console.error("Push Send API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process push notification." }, { status: 500 });
  }
}
