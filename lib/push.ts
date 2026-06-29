import { createClient } from "@/lib/supabase/client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function getDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Unknown Device";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone / iPad (PWA)";
  if (/Android/i.test(ua)) return "Android Device";
  if (/Macintosh/i.test(ua)) return "Chrome on Mac";
  if (/Windows/i.test(ua)) return "Windows PC";
  return "Web Browser";
}

export async function checkPushSubscription(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

export async function subscribeToPush(userId: string): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Push notifications are not supported on this browser.");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notification permission was denied.");
    return false;
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable.");
    return false;
  }

  let reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    reg = await navigator.serviceWorker.register("/sw.js");
  }

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  const supabase = createClient();
  const subJson = subscription.toJSON();

  const { error } = await supabase.from("push_subscriptions" as any).upsert(
    {
      user_id: userId,
      subscription: subJson,
      device_label: getDeviceLabel(),
      created_at: new Date().toISOString(),
    },
    { onConflict: "user_id,endpoint" } as any
  );

  if (error) {
    console.error("Error saving push subscription to Supabase:", error);
    return false;
  }

  return true;
}

export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;

  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    const supabase = createClient();
    await supabase
      .from("push_subscriptions" as any)
      .delete()
      .eq("user_id", userId)
      .filter("subscription->>endpoint", "eq", endpoint);
  }

  return true;
}
