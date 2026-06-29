import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  notifyWorkoutCompleted,
  notifyNutritionLogged,
  notifyWaterGoalHit,
  notifySupplementsChecked,
  notifyBodyStatsLogged,
  notifyProgressPhotoAdded,
} from "@/lib/services/notificationService";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventType, profileTag, dayNumber, goalMl, weightKg } = await req.json();

    switch (eventType) {
      case "workout_completed":
        await notifyWorkoutCompleted(user.id, profileTag || "S", dayNumber || 1);
        break;
      case "nutrition_logged":
        await notifyNutritionLogged(user.id, profileTag || "S");
        break;
      case "water_goal_hit":
        await notifyWaterGoalHit(user.id, profileTag || "S", goalMl || 3000);
        break;
      case "supplements_checked":
        await notifySupplementsChecked(user.id, profileTag || "S");
        break;
      case "body_stats_logged":
        await notifyBodyStatsLogged(user.id, profileTag || "S", weightKg);
        break;
      case "progress_photo_added":
        await notifyProgressPhotoAdded(user.id, profileTag || "S");
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Event Log Notification API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
