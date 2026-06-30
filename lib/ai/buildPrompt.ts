import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export interface AggregatedStats {
  daysCount: number;
  workouts: {
    totalLogged: number;
    daysCount: number;
    exercises: string[];
    totalSets: number;
  };
  nutrition: {
    avgCalories: number;
    avgProteinG: number;
    loggedDays: number;
  };
  dailyStats: {
    avgWaterMl: number;
    avgSteps: number;
    waterGoalMetDays: number;
    stepsGoalMetDays: number;
    loggedDays: number;
  };
  body: {
    latestWeightKg: number | null;
    oldestWeightKg: number | null;
    weightDiff: number | null;
    latestBodyFatPct: number | null;
    oldestBodyFatPct: number | null;
    fatDiff: number | null;
  };
  supplements: {
    loggedDays: number;
    compliancePct: number;
  };
}

/**
 * Aggregates logs from Supabase for a given user and timeframe (7 or 30 days)
 * to build an anonymous stats summary.
 */
export async function buildPrompt(
  supabase: SupabaseClient<Database>,
  userId: string,
  timeframe: "7d" | "30d",
  profileId?: "S" | "P"
): Promise<{ systemPrompt: string; userPrompt: string; stats: AggregatedStats }> {
  const days = timeframe === "30d" ? 30 : 7;
  
  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  const { getProfileQueryTarget } = require("@/lib/profileConnection");
  const target = await getProfileQueryTarget(supabase, userId, profileId);

  // Fetch all logs in parallel
  const [
    workoutsRes,
    nutritionRes,
    dailyStatsRes,
    bodyRes,
    supplementsRes,
  ] = await Promise.all([
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .gte("logged_at", startDateStr)
      .order("logged_at", { ascending: false }),
    
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .gte("logged_at", startDateStr)
      .order("logged_at", { ascending: false }),
    
    supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .gte("stat_date", startDateStr)
      .order("stat_date", { ascending: false }),
    
    supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .gte("measured_at", startDateStr)
      .order("measured_at", { ascending: false }),
    
    supabase
      .from("supplement_logs")
      .select("*")
      .eq("user_id", target.userId)
      .eq("profile_tag", target.profileTag)
      .gte("logged_at", startDateStr)
      .order("logged_at", { ascending: false }),
  ]);

  const workouts = workoutsRes.data || [];
  const nutrition = nutritionRes.data || [];
  const dailyStats = dailyStatsRes.data || [];
  const bodyMeasurements = bodyRes.data || [];
  const supplements = supplementsRes.data || [];

  // 1. Process Workout Logs
  const uniqueExercises = new Set<string>();
  let totalSets = 0;
  workouts.forEach((w) => {
    const exercisesList = Array.isArray(w.exercises) ? w.exercises : [];
    exercisesList.forEach((ex: any) => {
      if (ex.name) uniqueExercises.add(ex.name);
      if (Array.isArray(ex.sets)) {
        totalSets += ex.sets.length;
      }
    });
  });

  // 2. Process Nutrition Logs (aggregate by day)
  const dailyNutritionMap = new Map<string, { calories: number; protein: number }>();
  nutrition.forEach((n) => {
    const date = n.logged_at;
    const items = Array.isArray(n.items) ? n.items : [];
    let calories = 0;
    let protein = 0;
    
    items.forEach((item: any) => {
      calories += Number(item.calories || 0);
      protein += Number(item.protein_g || 0);
    });

    const existing = dailyNutritionMap.get(date) || { calories: 0, protein: 0 };
    dailyNutritionMap.set(date, {
      calories: existing.calories + calories,
      protein: existing.protein + protein,
    });
  });

  let totalCalories = 0;
  let totalProtein = 0;
  dailyNutritionMap.forEach((v) => {
    totalCalories += v.calories;
    totalProtein += v.protein;
  });

  const avgCalories = dailyNutritionMap.size ? Math.round(totalCalories / dailyNutritionMap.size) : 0;
  const avgProteinG = dailyNutritionMap.size ? Math.round(totalProtein / dailyNutritionMap.size) : 0;

  // 3. Process Daily Stats (water and steps)
  let totalWater = 0;
  let totalSteps = 0;
  let waterGoalMet = 0;
  let stepsGoalMet = 0;

  dailyStats.forEach((s) => {
    totalWater += s.water_ml;
    totalSteps += s.steps;
    if (s.water_ml >= s.water_goal_ml) waterGoalMet++;
    if (s.steps >= s.steps_goal) stepsGoalMet++;
  });

  const avgWaterMl = dailyStats.length ? Math.round(totalWater / dailyStats.length) : 0;
  const avgSteps = dailyStats.length ? Math.round(totalSteps / dailyStats.length) : 0;

  // 4. Process Body Measurements (latest vs oldest weight/fat in timeframe)
  let latestWeightKg: number | null = null;
  let oldestWeightKg: number | null = null;
  let weightDiff: number | null = null;
  let latestBodyFatPct: number | null = null;
  let oldestBodyFatPct: number | null = null;
  let fatDiff: number | null = null;

  if (bodyMeasurements.length > 0) {
    const sorted = [...bodyMeasurements].sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );
    const oldest = sorted[0];
    const latest = sorted[sorted.length - 1];

    if (latest.weight_kg !== null) latestWeightKg = Number(latest.weight_kg);
    if (oldest.weight_kg !== null) oldestWeightKg = Number(oldest.weight_kg);
    if (latestWeightKg !== null && oldestWeightKg !== null) {
      weightDiff = latestWeightKg - oldestWeightKg;
    }

    if (latest.body_fat_pct !== null) latestBodyFatPct = Number(latest.body_fat_pct);
    if (oldest.body_fat_pct !== null) oldestBodyFatPct = Number(oldest.body_fat_pct);
    if (latestBodyFatPct !== null && oldestBodyFatPct !== null) {
      fatDiff = latestBodyFatPct - oldestBodyFatPct;
    }
  }

  // 5. Process Supplement Compliance
  // Supp compliance: average % of daily supplements completed
  let totalComplianceSum = 0;
  supplements.forEach((s) => {
    const list = Array.isArray(s.supplements) ? s.supplements : [];
    // Say we expect 5 supplements, or check what % are logged
    // We can assume target is 5 (default supplements count)
    const expected = 5;
    const taken = list.length;
    totalComplianceSum += Math.min(100, (taken / expected) * 100);
  });
  const compliancePct = supplements.length
    ? Math.round(totalComplianceSum / supplements.length)
    : 0;

  const stats: AggregatedStats = {
    daysCount: days,
    workouts: {
      totalLogged: workouts.length,
      daysCount: new Set(workouts.map((w) => w.logged_at)).size,
      exercises: Array.from(uniqueExercises),
      totalSets,
    },
    nutrition: {
      avgCalories,
      avgProteinG,
      loggedDays: dailyNutritionMap.size,
    },
    dailyStats: {
      avgWaterMl,
      avgSteps,
      waterGoalMetDays: waterGoalMet,
      stepsGoalMetDays: stepsGoalMet,
      loggedDays: dailyStats.length,
    },
    body: {
      latestWeightKg,
      oldestWeightKg,
      weightDiff,
      latestBodyFatPct,
      oldestBodyFatPct,
      fatDiff,
    },
    supplements: {
      loggedDays: supplements.length,
      compliancePct,
    },
  };

  // ── Construct Structured Summary ───────────────────────────────────────────
  const summaryParts = [
    `Timeframe: Last ${days} days`,
    `Workouts: ${stats.workouts.totalLogged} logged over ${stats.workouts.daysCount} active days. Exercises performed: ${
      stats.workouts.exercises.join(", ") || "None"
    }. Total working sets: ${stats.workouts.totalSets}.`,
    `Nutrition: Logged on ${stats.nutrition.loggedDays} days. Average daily intake: ${stats.nutrition.avgCalories} kcal, ${stats.nutrition.avgProteinG}g protein.`,
    `Daily Habits: Average steps: ${stats.dailyStats.avgSteps} (met daily step goal on ${stats.dailyStats.stepsGoalMetDays}/${stats.dailyStats.loggedDays} days). Average water intake: ${stats.dailyStats.avgWaterMl}ml (met water target on ${stats.dailyStats.waterGoalMetDays}/${stats.dailyStats.loggedDays} days).`,
    `Supplements: Logged compliance on ${stats.supplements.loggedDays} days. Compliance score: ${stats.supplements.compliancePct}%.`,
  ];

  if (stats.body.latestWeightKg !== null) {
    let bodyComposition = `Latest Weight: ${stats.body.latestWeightKg}kg.`;
    if (stats.body.weightDiff !== null && stats.body.weightDiff !== 0) {
      const change = stats.body.weightDiff > 0 ? "gained" : "lost";
      bodyComposition += ` Weight change over timeframe: ${change} ${Math.abs(stats.body.weightDiff).toFixed(1)}kg.`;
    }
    if (stats.body.latestBodyFatPct !== null) {
      bodyComposition += ` Body fat: ${stats.body.latestBodyFatPct}%.`;
      if (stats.body.fatDiff !== null && stats.body.fatDiff !== 0) {
        const change = stats.body.fatDiff > 0 ? "increased" : "decreased";
        bodyComposition += ` Body fat change: ${change} ${Math.abs(stats.body.fatDiff).toFixed(1)}%.`;
      }
    }
    summaryParts.push(`Body Composition: ${bodyComposition}`);
  } else {
    summaryParts.push("Body Composition: No weight data logged.");
  }

  const structuredDataSummary = summaryParts.join("\n");

  const systemPrompt = `You are a fitness coach AI for a 100-day body transformation program. 
The user is following a structured program. Be specific, encouraging, and data-driven.
Keep insights to 2–3 sentences max. Never recommend stopping the program.
Never refer to yourself by name. Label yourself as 'AI' only if asked.`;

  const userPrompt = `Here is a summary of my progress over the last ${days} days:
${structuredDataSummary}

Give me one key insight about my progress this week and one specific action for tomorrow.`;

  return { systemPrompt, userPrompt, stats };
}
