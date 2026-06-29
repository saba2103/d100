import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

interface NotifyParams {
  userId: string;
  title: string;
  body: string;
  action_url?: string;
  icon?: string;
}

/**
 * Dispatch an in-app and push notification server-side
 */
export async function sendServerNotification({
  userId,
  title,
  body,
  action_url = "/",
  icon = "/icons/icon-192.svg",
}: NotifyParams) {
  try {
    const supabase = createClient();

    // 1. Insert into notifications table
    await (supabase.from("notifications" as any) as any).insert({
      user_id: userId,
      title,
      body,
      action_url,
      icon,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // 2. Trigger web push
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || "mailto:sabarathinamk@gmail.com";

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

      const { data: subscriptions } = await (supabase.from("push_subscriptions" as any) as any)
        .select("*")
        .eq("user_id", userId);

      if (subscriptions && subscriptions.length > 0) {
        const payload = JSON.stringify({ title, body, action_url, icon });
        for (const subRow of subscriptions as any[]) {
          try {
            await webpush.sendNotification(subRow.subscription, payload);
          } catch (err: any) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await (supabase.from("push_subscriptions" as any) as any).delete().eq("id", subRow.id);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed in sendServerNotification:", error);
  }
}

/**
 * Helper to resolve partner user or profile names for notifications
 * 'S' -> Saba, 'A' -> Ancy
 */
export function getProfileNames(profileTag: "S" | "A" | string) {
  const isSaba = profileTag === "S";
  const actorName = isSaba ? "Saba" : "Ancy";
  const partnerName = isSaba ? "Ancy" : "Saba";
  return { actorName, partnerName, isSaba };
}

/**
 * Event 1: Workout Completed
 */
export async function notifyWorkoutCompleted(userId: string, profileTag: "S" | "A" | string, dayNumber: number) {
  const { actorName } = getProfileNames(profileTag);
  const title = `💪 Workout Crushed!`;
  const body = `${actorName} just crushed Day ${dayNumber}'s workout`;

  await sendServerNotification({ userId, title, body, action_url: "/workout" });
}

/**
 * Event 2: Nutrition Logged
 */
export async function notifyNutritionLogged(userId: string, profileTag: "S" | "A" | string) {
  const { actorName } = getProfileNames(profileTag);
  const title = `🥗 Meals Logged`;
  const body = `${actorName} logged meals for today`;

  await sendServerNotification({ userId, title, body, action_url: "/nutrition" });
}

/**
 * Event 3: Water Goal Hit
 */
export async function notifyWaterGoalHit(userId: string, profileTag: "S" | "A" | string, goalMl: number) {
  const { actorName } = getProfileNames(profileTag);
  const title = `💧 Water Goal Hit!`;
  const body = `${actorName} hit their ${goalMl}ml water goal today!`;

  await sendServerNotification({ userId, title, body, action_url: "/water" });
}

/**
 * Event 4: All Supplements Checked
 */
export async function notifySupplementsChecked(userId: string, profileTag: "S" | "A" | string) {
  const { actorName } = getProfileNames(profileTag);
  const title = `💊 Supplements Taken`;
  const body = `${actorName} checked all daily supplements`;

  await sendServerNotification({ userId, title, body, action_url: "/supplements" });
}

/**
 * Event 5: Body Stats Logged
 */
export async function notifyBodyStatsLogged(userId: string, profileTag: "S" | "A" | string, weightKg?: number) {
  const { actorName } = getProfileNames(profileTag);
  const title = `⚖️ Body Stats Logged`;
  const body = weightKg ? `${actorName} logged today's weight (${weightKg} kg)` : `${actorName} logged body measurements`;

  await sendServerNotification({ userId, title, body, action_url: "/body-stats" });
}

/**
 * Event 6: Progress Photo Added
 */
export async function notifyProgressPhotoAdded(userId: string, profileTag: "S" | "A" | string) {
  const { actorName } = getProfileNames(profileTag);
  const title = `📸 New Photo Added`;
  const body = `${actorName} added a progress photo to Collection`;

  await sendServerNotification({ userId, title, body, action_url: "/collection" });
}

/**
 * Event 7: Badge Unlocked
 */
export async function notifyBadgeUnlocked(userId: string, profileTag: "S" | "A" | string, badgeName: string) {
  const { actorName } = getProfileNames(profileTag);
  const title = `🏆 Badge Earned!`;
  const body = `${actorName} just earned the ${badgeName} badge!`;

  await sendServerNotification({ userId, title, body, action_url: "/badges" });
}

/**
 * Event 8: Streak Milestone
 */
export async function notifyStreakMilestone(userId: string, profileTag: "S" | "A" | string, streakDays: number) {
  const { actorName } = getProfileNames(profileTag);
  const title = `🔥 ${streakDays}-Day Streak!`;
  const body = `${actorName} is on a ${streakDays}-day streak!`;

  await sendServerNotification({ userId, title, body, action_url: "/dashboard" });
}
