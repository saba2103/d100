import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendServerNotification } from "@/lib/services/notificationService";

export async function GET(req: Request) {
  return handleNotificationsCron(req);
}

export async function POST(req: Request) {
  return handleNotificationsCron(req);
}

async function handleNotificationsCron(req: Request) {
  try {
    const url = new URL(req.url);
    const typeOverride = url.searchParams.get("type"); // e.g. "workout_am", "water_10am", "streak_check", etc.
    const supabase = createClient();

    // Get current IST time details (or UTC)
    const now = new Date();
    // Convert to IST offset +5:30
    const istTime = new Date(now.getTime() + (330 * 60 * 1000));
    const currentHour = istTime.getUTCHours(); // 0-23
    const dayOfWeek = istTime.getUTCDay(); // 0 = Sunday
    const todayStr = istTime.toISOString().split("T")[0];

    // Fetch all active users
    const { data: users, error } = await supabase.from("profiles").select("id, display_name, program_start_date");
    if (error || !users) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    let triggeredCount = 0;

    for (const user of users) {
      // Calculate current program day
      let programDay = 1;
      if (user.program_start_date) {
        const start = new Date(user.program_start_date);
        const diffTime = Math.abs(now.getTime() - start.getTime());
        programDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      }

      // 1. Workout Reminder (4:00 AM IST or type="workout_4am")
      if (typeOverride === "workout_4am" || (currentHour === 4 && !typeOverride)) {
        await sendServerNotification({
          userId: user.id,
          title: "🔥 Workout Time",
          body: `Day ${programDay} starts now. Show up.`,
          action_url: "/workout",
        });
        triggeredCount++;
      }

      // 2. Supplement Reminder (8:00 AM IST or type="supplements_8am")
      if (typeOverride === "supplements_8am" || (currentHour === 8 && !typeOverride)) {
        await sendServerNotification({
          userId: user.id,
          title: "💊 Morning Supplements",
          body: "Take your morning supplements with breakfast.",
          action_url: "/supplements",
        });
        triggeredCount++;
      }

      // 3. Water Check-ins (10am, 1pm, 4pm, 8pm IST)
      if (
        typeOverride === "water_check" ||
        (!typeOverride && [10, 13, 16, 20].includes(currentHour))
      ) {
        let bodyMsg = "Remember to stay hydrated and log your water.";
        if (currentHour === 13) bodyMsg = "Halfway through the day. Hit your water goal?";
        else if (currentHour === 20) bodyMsg = "Final stretch! Did you reach your daily water target?";

        await sendServerNotification({
          userId: user.id,
          title: "💧 Water Check-in",
          body: bodyMsg,
          action_url: "/water",
        });
        triggeredCount++;
      }

      // 4. Streak Protection Alert (8:00 PM IST or type="streak_check")
      if (typeOverride === "streak_check" || (currentHour === 20 && !typeOverride)) {
        // Check if today's workout log exists
        const { data: todayLogs } = await supabase
          .from("workout_logs")
          .select("id")
          .eq("user_id", user.id)
          .eq("logged_at", todayStr);

        if (!todayLogs || todayLogs.length === 0) {
          await sendServerNotification({
            userId: user.id,
            title: "⚠️ Streak at Risk!",
            body: `You haven't logged a workout yet. Day ${programDay} is still saveable.`,
            action_url: "/workout",
          });
          triggeredCount++;
        }
      }

      // 5. Night Log Reminder (9:00 PM IST or type="night_log")
      if (typeOverride === "night_log" || (currentHour === 21 && !typeOverride)) {
        await sendServerNotification({
          userId: user.id,
          title: "🌙 Nightly Check-in",
          body: "Log today before it slips. Nutrition + water.",
          action_url: "/dashboard",
        });
        triggeredCount++;
      }

      // 6. Weekly Check-in (Sunday 7:00 PM IST or type="weekly_recap")
      if (typeOverride === "weekly_recap" || (dayOfWeek === 0 && currentHour === 19 && !typeOverride)) {
        // Fetch workouts completed in past 7 days
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0];
        const { data: recentWorkouts } = await supabase
          .from("workout_logs")
          .select("id")
          .eq("user_id", user.id)
          .gte("logged_at", sevenDaysAgo);

        const workoutCount = recentWorkouts?.length || 0;
        const currentWeekNum = Math.ceil(programDay / 7);

        await sendServerNotification({
          userId: user.id,
          title: `📊 Week ${currentWeekNum} Recap`,
          body: `Week recap: ${workoutCount} workouts completed. Week ${currentWeekNum + 1} starts tomorrow!`,
          action_url: "/dashboard",
        });
        triggeredCount++;
      }

      // 7. Smart AI Nudges (3+ missed workouts or type="ai_nudge")
      if (typeOverride === "ai_nudge" || (!typeOverride && currentHour === 18)) {
        const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0];
        const { data: last3DaysLogs } = await supabase
          .from("workout_logs")
          .select("id")
          .eq("user_id", user.id)
          .gte("logged_at", threeDaysAgo);

        if (!last3DaysLogs || last3DaysLogs.length === 0) {
          await sendServerNotification({
            userId: user.id,
            title: "📋 Coach Recommendation",
            body: "You've missed 3 days. Here's what Coach recommends to get back on track.",
            action_url: "/insights",
          });
          triggeredCount++;
        }
      }
    }

    return NextResponse.json({ success: true, triggeredCount, currentHour, todayStr });
  } catch (error: any) {
    console.error("Cron Notifications Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
