export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const date: string = body.date; // YYYY-MM-DD
    const profileId: "S" | "A" = body.profileId === "A" ? "A" : "S";
    const dayNumber: number = body.dayNumber || 1;

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    // Fetch all logs for this single day in parallel
    const [
      workoutRes,
      nutritionRes,
      dailyStatRes,
      bodyRes,
      supplementRes,
    ] = await Promise.all([
      supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_tag", profileId)
        .eq("logged_at", date),

      supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_tag", profileId)
        .eq("logged_at", date),

      supabase
        .from("daily_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_tag", profileId)
        .eq("stat_date", date)
        .maybeSingle(),

      supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_tag", profileId)
        .or(`measured_at.eq.${date},created_at.gte.${date}T00:00:00,created_at.lte.${date}T23:59:59`)
        .limit(1)
        .maybeSingle(),

      supabase
        .from("supplement_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_tag", profileId)
        .eq("logged_at", date)
        .maybeSingle(),
    ]);

    const workouts = workoutRes.data || [];
    const nutrition = nutritionRes.data || [];
    const dailyStat = dailyStatRes.data;
    const bodyMeasurement = bodyRes.data;
    const supplement = supplementRes.data;

    // Build a structured data summary for this day
    const parts: string[] = [`Day ${dayNumber} of 100 — Date: ${date}`, ""];

    // Workout
    if (workouts.length > 0) {
      const w = workouts[0];
      const exercises = Array.isArray(w.exercises) ? w.exercises : [];
      const exNames = exercises.map((e: any) => e.name).filter(Boolean).join(", ");
      const totalSets = exercises.reduce((acc: number, e: any) => acc + (Array.isArray(e.sets) ? e.sets.length : 0), 0);
      parts.push(`Workout: LOGGED ✓`);
      parts.push(`  - Duration: ${w.duration_minutes || "N/A"} minutes`);
      if (exNames) parts.push(`  - Exercises: ${exNames}`);
      if (totalSets > 0) parts.push(`  - Total sets: ${totalSets}`);
      if (w.notes) parts.push(`  - Notes: ${w.notes}`);
    } else {
      parts.push("Workout: Not logged");
    }

    parts.push("");

    // Nutrition
    if (nutrition.length > 0) {
      let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      const mealNames: string[] = [];
      nutrition.forEach((n: any) => {
        const items = Array.isArray(n.items) ? n.items : [];
        items.forEach((item: any) => {
          totalCal += Number(item.calories || 0);
          totalProtein += Number(item.protein_g || 0);
          totalCarbs += Number(item.carbs_g || 0);
          totalFat += Number(item.fat_g || 0);
          if (item.name) mealNames.push(item.name);
        });
        if (n.meal_type) mealNames.push(n.meal_type);
      });
      parts.push("Nutrition: LOGGED ✓");
      parts.push(`  - Calories: ${Math.round(totalCal)} kcal`);
      parts.push(`  - Protein: ${Math.round(totalProtein)}g | Carbs: ${Math.round(totalCarbs)}g | Fat: ${Math.round(totalFat)}g`);
    } else {
      parts.push("Nutrition: Not logged");
    }

    parts.push("");

    // Water & Steps
    if (dailyStat) {
      const waterGoalMet = dailyStat.water_ml >= dailyStat.water_goal_ml;
      const stepsGoalMet = dailyStat.steps >= dailyStat.steps_goal;
      parts.push("Daily Habits:");
      parts.push(`  - Water: ${dailyStat.water_ml}ml / ${dailyStat.water_goal_ml}ml goal — ${waterGoalMet ? "TARGET HIT ✓" : "below target"}`);
      parts.push(`  - Steps: ${dailyStat.steps} / ${dailyStat.steps_goal} goal — ${stepsGoalMet ? "TARGET HIT ✓" : "below target"}`);
    } else {
      parts.push("Daily Habits (water/steps): Not logged");
    }

    parts.push("");

    // Supplements
    if (supplement) {
      const list = Array.isArray(supplement.supplements) ? supplement.supplements : [];
      const names = list.map((s: any) => s.name).filter(Boolean).join(", ");
      parts.push(`Supplements: LOGGED ✓ — ${names || `${list.length} items`}`);
    } else {
      parts.push("Supplements: Not logged");
    }

    parts.push("");

    // Body measurements
    if (bodyMeasurement) {
      const bm = bodyMeasurement as any;
      const bmParts: string[] = [];
      if (bm.weight_kg) bmParts.push(`Weight: ${bm.weight_kg}kg`);
      if (bm.body_fat_pct) bmParts.push(`Body fat: ${bm.body_fat_pct}%`);
      if (bm.muscle_mass_kg) bmParts.push(`Muscle mass: ${bm.muscle_mass_kg}kg`);
      if (bmParts.length) parts.push(`Body Stats: ${bmParts.join(" | ")}`);
    }

    const dataHasLogs = workouts.length > 0 || nutrition.length > 0 || dailyStat || supplement;

    if (!dataHasLogs) {
      return NextResponse.json({
        insight: null,
        error: "no_data",
        message: "No data logged for this day yet.",
      });
    }

    const structuredData = parts.join("\n");

    const systemPrompt = `You are Coach AI — a world-class fitness transformation coach reviewing a single day's data for an athlete on a 100-day body transformation program.

Your job is to deliver a rich, structured daily coaching summary for this specific day. Write in a motivating, direct, coach-to-athlete voice. Be data-driven and specific.

Always structure your response as a JSON object with these EXACT keys:
{
  "headline": "One powerful, motivating sentence summarizing the day (max 12 words)",
  "overallScore": <number 0–100 based on how complete/good the day was>,
  "scoreLabel": "<Excellent|Strong|Solid|Average|Needs Work>",
  "wins": ["<specific win 1>", "<specific win 2>", ...],
  "improvements": ["<specific area to improve 1>", ...],
  "coachNote": "<1-2 sentence direct coaching message for tomorrow>",
  "focusAreas": {
    "workout": { "status": "<completed|missed|partial>", "detail": "<brief note>" },
    "nutrition": { "status": "<on_track|off_track|not_logged>", "detail": "<brief note>" },
    "hydration": { "status": "<hit|missed|not_logged>", "detail": "<brief note>" },
    "supplements": { "status": "<taken|missed|not_logged>", "detail": "<brief note>" }
  }
}

Only return valid JSON. No markdown. No explanation outside the JSON.`;

    const userPrompt = `Here is my Day ${dayNumber} data:\n\n${structuredData}\n\nGenerate my daily coaching summary as structured JSON.`;

    let rawInsight = "";
    try {
      rawInsight = await callAI({
        provider: "anthropic",
        encryptedApiKey: null,
        systemPrompt,
        userPrompt,
      });
    } catch (aiErr: any) {
      console.error("AI error:", aiErr);
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    // Parse the JSON response from AI
    let parsed: any = null;
    try {
      // Strip markdown code fences if AI wrapped in them
      const cleaned = rawInsight.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Fallback: return raw text
      parsed = { headline: "Day Summary", coachNote: rawInsight.trim() };
    }

    // Save to DB (store JSON stringified as insight text so existing table works)
    await supabase
      .from("ai_insights" as any)
      .insert({
        user_id: user.id,
        profile_tag: profileId,
        insight: JSON.stringify({ ...parsed, dayNumber, date }),
      });

    return NextResponse.json({ insight: parsed, dayNumber, date });
  } catch (err: any) {
    console.error("generate-day error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
