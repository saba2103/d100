"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { triggerBadgeCheck } from "@/lib/utils/achievementsClient";
import {
  Barbell,
  ForkKnife,
  ChartLineUp,
  Flame,
  Warning,
  Sparkle,
  Plus,
  CheckCircle,
  Clock,
  NavigationArrow,
  Drop,
  Check,
  Robot,
  Trophy,
  ArrowRight,
  Pill,
  Scales,
  BowlFood,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Card, HeroCard } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/Stats";
import { StreakWidget } from "@/components/ui/StreakWidget";
import { ProgramBadge } from "@/components/ui/ProgramBadge";
import { Modal, BottomSheet, SectionHeader } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AIInsightCard } from "@/components/features/AIInsightCard";
import { StoriesBar } from "@/components/features/StoriesBar";
import { useAppUser } from "@/lib/contexts/AppContext";

interface DashboardClientProps {
  profile: any;
  settings: any;
  initialDailyStats: any;
  initialWorkoutLog: any;
  initialSupplementLog: any;
  bodyMeasurements: any[];
  userBadges: any[];
  workoutStreak: number;
  today: string;
  initialInsights: any[];
  initialNutritionLogs: any[];
  isReadOnly?: boolean;
}

import { COACH_SUPPLEMENT_PLAN, COACH_WORKOUT_PLAN, getWorkoutPlanForDay } from "@/lib/workoutPlan";

const DEFAULT_SUPPLEMENTS: any[] = COACH_SUPPLEMENT_PLAN;

export default function DashboardClient({
  profile,
  settings,
  initialDailyStats,
  initialWorkoutLog,
  initialSupplementLog,
  bodyMeasurements,
  userBadges,
  workoutStreak,
  today,
  initialInsights,
  initialNutritionLogs,
  isReadOnly = false,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { isPartnerConnected } = useAppUser();
  const [refreshing, setRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  // States
  const [workoutLog, setWorkoutLog] = useState(initialWorkoutLog);
  const [supplementLogId, setSupplementLogId] = useState(initialSupplementLog?.id || null);
  const [supplements, setSupplements] = useState<any[]>(() => {
    const items = initialSupplementLog?.supplements
      ? [...(initialSupplementLog.supplements as any[])]
      : [];
      
    // Ensure all coach supplements are present
    COACH_SUPPLEMENT_PLAN.forEach(coach => {
      const existing = items.find(i => i.name === coach.name);
      if (!existing) {
        items.push({
          name: coach.name,
          dose: coach.dose,
          timing: coach.timing || "",
          custom: false,
          taken: false,
        });
      } else {
        if (existing.taken === undefined) {
          existing.taken = true;
        }
      }
    });

    items.forEach(item => {
      if (item.taken === undefined) {
        item.taken = true;
      }
    });

    return items;
  });

  // Modal States
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  
  // Log Forms
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("45");
  const [workoutNotes, setWorkoutNotes] = useState("");
  
  const [weightInput, setWeightInput] = useState("");
  const [fatInput, setFatInput] = useState("");
  const [muscleInput, setMuscleInput] = useState("");
  const [loggingStats, setLoggingStats] = useState(false);
  const [lastCheckedSupp, setLastCheckedSupp] = useState<string | null>(null);

  const activeProfileTag = settings?.active_profile === "P" ? "P" : "S";
  const latestInsightForProfile = initialInsights.find((i) => i.profile_tag === activeProfileTag) || null;

  // Day Number & Phase Calculation
  let dayNumber = 1;
  if (profile?.program_start_date) {
    const start = new Date(profile.program_start_date);
    start.setHours(0, 0, 0, 0);
    const now = new Date(today);
    now.setHours(0, 0, 0, 0);
    const diffTime = now.getTime() - start.getTime();
    dayNumber = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  let phaseNumber = 1;
  let phaseTitle = "Foundation Week";
  if (dayNumber > 91) {
    phaseNumber = 5;
    phaseTitle = "Peak Week";
  } else if (dayNumber > 63) {
    phaseNumber = 4;
    phaseTitle = "Shredding Phase";
  } else if (dayNumber > 35) {
    phaseNumber = 3;
    phaseTitle = "Muscle Building Mode";
  } else if (dayNumber > 7) {
    phaseNumber = 2;
    phaseTitle = "Building the Base";
  }

  // Phase-specific data
  const getWorkoutPlanName = (day: number) => {
    const plan = getWorkoutPlanForDay(day);
    if (plan) {
      return plan.name;
    }
    if (day % 7 === 0) {
      return "Active Recovery & Rest";
    }
    return "No Active Plan (Custom Workout)";
  };

  const scheduledWorkout = getWorkoutPlanName(dayNumber);

  const nutritionReminders = [
    `Consume ${settings?.calories_goal || 2000} kcal with prioritised protein macros`,
    "Drink at least 3 liters of water throughout the day",
    "Log all meals and stay within your targeted carbohydrate cap",
  ];

  // Daily Stats calculations
  const waterConsumed = initialDailyStats?.water_ml || 0;
  const waterGoal = initialDailyStats?.water_goal_ml || settings?.water_goal_ml || 3000;
  const stepsTaken = initialDailyStats?.steps || 0;
  const stepsGoal = initialDailyStats?.steps_goal || settings?.steps_goal || 10000;
  const caloriesConsumed = initialDailyStats?.calories_consumed || 0;
  const caloriesGoal = initialDailyStats?.calories_goal || settings?.calories_goal || 2000;

  // Weight measurements trends
  const latestWeightLog = bodyMeasurements[0];
  const prevWeightLog = bodyMeasurements[1];

  const takenSupps = supplements.filter(s => s.taken).length;
  const totalSupps = supplements.length;

  const totalProtein = initialNutritionLogs.reduce(
    (sum: number, log: any) => sum + (log.items || []).reduce((s: number, i: any) => s + (i.protein_g || 0), 0),
    0
  );

  const compareLog = (key: string) => {
    if (!latestWeightLog || !prevWeightLog) return null;
    const latVal = Number(latestWeightLog[key]);
    const prevVal = Number(prevWeightLog[key]);
    if (isNaN(latVal) || isNaN(prevVal)) return null;
    return latVal - prevVal;
  };

  const weightDiff = compareLog("weight_kg");
  const fatDiff = compareLog("body_fat_pct");
  const muscleDiff = compareLog("skeletal_muscle_mass_kg");

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = async (e: React.TouchEvent) => {
    if (touchStart === 0 || refreshing) return;
    const current = e.touches[0].clientY;
    const diff = current - touchStart;
    if (diff > 120) {
      setRefreshing(true);
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setTouchStart(0);
      }, 1200);
    }
  };

  const handleSupplementToggle = async (suppName: string) => {
    if (isReadOnly) return;
    const supabase = createClient();
    const isChecking = supplements.find(item => item.name === suppName)?.taken === false;
    if (isChecking) {
      setLastCheckedSupp(suppName);
      setTimeout(() => setLastCheckedSupp(null), 500);
    }
    const updated = supplements.map(item => {
      if (item.name === suppName) {
        const nextTaken = !item.taken;
        return {
          ...item,
          taken: nextTaken,
          taken_at: nextTaken ? new Date().toISOString() : undefined,
        };
      }
      return item;
    });

    setSupplements(updated);

    if (supplementLogId) {
      await supabase
        .from("supplement_logs")
        .update({ supplements: updated })
        .eq("id", supplementLogId);
    } else {
      const { data, error } = await supabase
        .from("supplement_logs")
        .insert({
          user_id: profile.id,
          logged_at: today,
          supplements: updated,
          profile_tag: activeProfileTag,
        })
        .select()
        .single();
      if (data) {
        setSupplementLogId(data.id);
      }
    }

    if (updated.length > 0 && updated.every((s) => s.taken)) {
      fetch("/api/events/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "supplements_checked",
          profileTag: activeProfileTag,
        }),
      }).catch(() => {});
    }

    await triggerBadgeCheck();
    router.refresh();
  };

  // Workout Logging
  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingStats(true);
    const supabase = createClient();

    const name = workoutName.trim() || scheduledWorkout;
    const duration = parseInt(workoutDuration, 10) || 45;

    const { data, error } = await supabase
      .from("workout_logs")
      .insert({
        user_id: profile.id,
        logged_at: today,
        phase: phaseNumber,
        duration_minutes: duration,
        notes: workoutNotes.trim() || undefined,
        exercises: [{ name, sets: [] }],
        profile_tag: activeProfileTag,
      })
      .select()
      .single();

    if (!error) {
      setWorkoutLog(data);
      setIsWorkoutModalOpen(false);
      setWorkoutName("");
      setWorkoutNotes("");
    }
    await triggerBadgeCheck();
    setLoggingStats(false);
    router.refresh();
  };

  // Weight Logging
  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingStats(true);
    const supabase = createClient();

    const weight = parseFloat(weightInput);
    const fat = fatInput ? parseFloat(fatInput) : null;
    const muscle = muscleInput ? parseFloat(muscleInput) : null;

    if (!isNaN(weight)) {
      await supabase.from("body_measurements").insert({
        user_id: profile.id,
        measured_at: today,
        weight_kg: weight,
        body_fat_pct: fat,
        skeletal_muscle_mass_kg: muscle,
        source: "manual",
        profile_tag: activeProfileTag,
      });

      setIsWeightModalOpen(false);
      setWeightInput("");
      setFatInput("");
      setMuscleInput("");
    }
    setLoggingStats(false);
    router.refresh();
  };


  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-6"
    >
      {/* Pull-To-Refresh Indicator */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center items-center gap-2 text-gradient font-display text-sm font-bold py-2"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-[var(--accent-start)]" />
            Updating Feed...
          </motion.div>
        )}
      </AnimatePresence>

      {/* 0. STORIES BUBBLES BAR */}
      <StoriesBar
        activeProfile={activeProfileTag}
        programDay={dayNumber}
        workoutStreak={workoutStreak}
        profileName={profile?.full_name || "Athlete"}
        userId={profile?.id || ""}
        programStartDate={profile?.program_start_date || null}
        isPartnerConnected={isPartnerConnected}
      />

      {/* 1. HERO CARD */}
      <HeroCard className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1 select-none">
            <span className="font-body font-body-bold text-[10px] sm:text-xs uppercase tracking-widest text-white/80">
              PHASE {phaseNumber} — {phaseTitle} · DAY {dayNumber}
            </span>
            <div className="flex items-baseline gap-2">
              <h1 className="font-display text-7xl sm:text-8xl leading-none text-white font-black">
                DAY {dayNumber}
              </h1>
              <span className="font-body font-body-bold text-sm text-white/70">
                / 100
              </span>
            </div>
            <p className="font-body text-xs sm:text-sm text-white/90">
              {(() => {
                const [y, m, d] = today.split("-").map(Number);
                return new Date(y, m - 1, d).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                });
              })()}
            </p>
          </div>

          <div className="w-full md:w-auto">
            {/* Glass variant for white styling inside gradient bg */}
            <StreakWidget streak={workoutStreak} variant="glass" className="w-full md:w-56" />
          </div>
        </div>

        {/* Day/100 Progress bar */}
        <div className="mt-8 space-y-1">
          <div className="flex justify-between text-[10px] text-white/70 font-body">
            <span>Overall Progress</span>
            <span>{dayNumber}% Complete</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dayNumber}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-white rounded-full shadow-lg"
            />
          </div>
        </div>
      </HeroCard>

      {/* Grid Layout: Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Calories */}
        <Link href="/calories" className="block group">
          <StatCard
            label="Calories"
            value={caloriesConsumed}
            unit="kcal"
            icon={ForkKnife}
            color="amber"
            trend={`Goal: ${caloriesGoal}`}
            className="hover:border-[var(--accent-start)]/50 cursor-pointer transition-all duration-200"
          />
        </Link>
        {/* Nutrition */}
        <Link href="/nutrition" className="block group">
          <StatCard
            label="Nutrition"
            value={Math.round(totalProtein)}
            unit="g prot"
            icon={BowlFood}
            color="green"
            trend="Macro tracking"
            className="hover:border-[var(--accent-start)]/50 cursor-pointer transition-all duration-200"
          />
        </Link>
        {/* Workout */}
        <Link href="/workout" className="block group">
          <StatCard
            label="Workout"
            value={workoutLog ? "Done" : "Pending"}
            unit=""
            icon={Barbell}
            color={workoutLog ? "green" : "amber"}
            trend={workoutLog ? "Completed" : "Goal: 1 workout"}
            className="hover:border-[var(--accent-start)]/50 cursor-pointer transition-all duration-200"
          />
        </Link>
        {/* Water */}
        <Link href="/water" className="block group">
          <StatCard
            label="Water"
            value={waterConsumed}
            unit="ml"
            icon={Drop}
            color="blue"
            trend={`Goal: ${waterGoal}`}
            className="hover:border-[var(--accent-start)]/50 cursor-pointer transition-all duration-200"
          />
        </Link>
        {/* Steps */}
        <Link href="/steps" className="block group">
          <StatCard
            label="Steps"
            value={stepsTaken}
            unit="steps"
            icon={NavigationArrow}
            color="green"
            trend={`Goal: ${stepsGoal}`}
            className="hover:border-[var(--accent-start)]/50 cursor-pointer transition-all duration-200"
          />
        </Link>
        {/* Supplements */}
        <Link href="/supplements" className="block group">
          <StatCard
            label="Supplements"
            value={takenSupps}
            unit={`/${totalSupps}`}
            icon={Pill}
            color={takenSupps === totalSupps && totalSupps > 0 ? "green" : "amber"}
            trend="Daily list"
            className="hover:border-[var(--accent-start)]/50 cursor-pointer transition-all duration-200"
          />
        </Link>
        {/* Body Stats */}
        <Link href="/body-stats" className="block group">
          <StatCard
            label="Weight"
            value={latestWeightLog?.weight_kg ? Number(latestWeightLog.weight_kg).toFixed(1) : "--"}
            unit={latestWeightLog?.weight_kg ? "kg" : ""}
            icon={Scales}
            color="purple"
            trend={
              weightDiff !== null
                ? `${weightDiff > 0 ? "+" : ""}${weightDiff.toFixed(1)} kg vs prev`
                : "Body composition"
            }
            className="hover:border-[var(--accent-start)]/50 cursor-pointer transition-all duration-200"
          />
        </Link>
      </div>

      {/* Main Sections responsive column split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 3. TODAY'S PLAN */}
          <Card variant="surface" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)]">
                TODAY&apos;S PLAN
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-[rgba(249,115,22,0.12)] text-[var(--accent-text)] border border-[rgba(249,115,22,0.2)]">
                COACH TIPS
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[rgba(249,115,22,0.1)] text-[var(--accent-text)]">
                      <Barbell size={20} weight="fill" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] font-body uppercase tracking-wider">Scheduled Workout</p>
                      <h4 className="font-body-bold text-sm text-[var(--text-primary)]">{scheduledWorkout}</h4>
                    </div>
                  </div>

                  {workoutLog ? (
                    <div className="flex items-center gap-1.5 text-[var(--green)]">
                      <CheckCircle size={18} weight="fill" />
                      <span className="font-body-bold text-xs">Logged</span>
                    </div>
                  ) : isReadOnly ? (
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <span className="font-body-bold text-xs">Pending</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setIsWorkoutModalOpen(true)}
                    >
                      <Plus size={14} weight="bold" /> Log
                    </Button>
                  )}
                </div>
              </div>

              {/* Nutrition Reminders */}
              <div className="space-y-2.5">
                <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider">Nutrition Focus</p>
                {nutritionReminders.map((reminder, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--accent-start)]" />
                    <p className="font-body text-xs text-[var(--text-secondary)]">{reminder}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 4. BODY STATS SNAPSHOT */}
          <Card variant="surface" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)]">
                  BODY STATS SNAPSHOT
                </h2>
                <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">Last Logged Composition</p>
              </div>

              {!isReadOnly && (
                <Button size="sm" variant="secondary" onClick={() => setIsWeightModalOpen(true)}>
                  Log Today
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Weight */}
              <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl relative">
                <p className="text-[10px] text-[var(--text-muted)] font-body uppercase">Weight</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display text-2xl text-[var(--text-primary)]">
                    {latestWeightLog?.weight_kg ? Number(latestWeightLog.weight_kg).toFixed(1) : "--"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-body">kg</span>
                </div>
                {weightDiff !== null && (
                  <span
                    className={cn(
                      "absolute top-2 right-2 text-[10px] font-body-bold flex items-center gap-0.5",
                      weightDiff > 0 ? "text-[var(--red)]" : "text-[var(--green)]"
                    )}
                  >
                    {weightDiff > 0 ? "▲" : "▼"} {Math.abs(weightDiff).toFixed(1)}
                  </span>
                )}
              </div>

              {/* Body Fat % */}
              <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl relative">
                <p className="text-[10px] text-[var(--text-muted)] font-body uppercase">Body Fat</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display text-2xl text-[var(--text-primary)]">
                    {latestWeightLog?.body_fat_pct ? Number(latestWeightLog.body_fat_pct).toFixed(1) : "--"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-body">%</span>
                </div>
                {fatDiff !== null && (
                  <span
                    className={cn(
                      "absolute top-2 right-2 text-[10px] font-body-bold flex items-center gap-0.5",
                      fatDiff > 0 ? "text-[var(--red)]" : "text-[var(--green)]"
                    )}
                  >
                    {fatDiff > 0 ? "▲" : "▼"} {Math.abs(fatDiff).toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Skeletal Muscle Mass */}
              <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl relative">
                <p className="text-[10px] text-[var(--text-muted)] font-body uppercase">Muscle Mass</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display text-2xl text-[var(--text-primary)]">
                    {latestWeightLog?.skeletal_muscle_mass_kg
                      ? Number(latestWeightLog.skeletal_muscle_mass_kg).toFixed(1)
                      : "--"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-body">kg</span>
                </div>
                {muscleDiff !== null && (
                  <span
                    className={cn(
                      "absolute top-2 right-2 text-[10px] font-body-bold flex items-center gap-0.5",
                      muscleDiff > 0 ? "text-[var(--green)]" : "text-[var(--red)]"
                    )}
                  >
                    {muscleDiff > 0 ? "▲" : "▼"} {Math.abs(muscleDiff).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </Card>

        </div>

        {/* Column 3: Secondary Panels */}
        <div className="space-y-6">
          
          {/* 5. SUPPLEMENTS */}
          <Card variant="surface" className="p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)]">
                DAILY SUPPLEMENTS
              </h2>
              <span className="text-xs font-body font-body-bold text-[var(--accent-text)]">
                {supplements.filter(s => s.taken).length}/{supplements.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {supplements.map((supp) => {
                const isChecked = supp.taken;
                return (
                  <button
                    key={supp.name}
                    onClick={() => handleSupplementToggle(supp.name)}
                    disabled={isReadOnly}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150",
                      isReadOnly && "cursor-default",
                      isChecked
                        ? "bg-[rgba(16,185,129,0.06)] border-[var(--border)] text-[var(--text-primary)]"
                        : "bg-[var(--bg-base)] border-[var(--border)] text-[var(--text-secondary)]" + (!isReadOnly ? " hover:border-[var(--accent-start)]/50" : ""),
                      lastCheckedSupp === supp.name && "row-flash-green"
                    )}
                  >
                    <div
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-all duration-150 overflow-hidden relative",
                        isChecked ? "border-[var(--green)] text-white" : "border-[var(--border)] bg-transparent"
                      )}
                    >
                      {/* Sweep green fill from left to right */}
                      <span className={cn(
                        "absolute inset-0 bg-[var(--green)] transition-transform duration-300 origin-left scale-x-0",
                        isChecked && "scale-x-100"
                      )} />
                      <span className="relative z-10 flex items-center justify-center">
                        {isChecked && <Check size={12} weight="bold" />}
                      </span>
                    </div>
                    <span className="font-body text-xs font-medium capitalize">{supp.name}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 6. RECENT BADGES */}
          <Card variant="surface" className="p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)]">
                RECENT BADGES
              </h2>
              <span onClick={() => router.push("/badges")} className="text-xs font-body text-[var(--text-muted)] hover:text-[var(--accent-text)] cursor-pointer">
                View all ({userBadges.length})
              </span>
            </div>

            {userBadges.length > 0 ? (
              <div className="flex items-center gap-4 overflow-x-auto py-2 scrollbar-none">
                {userBadges.slice(0, 3).map((b, index) => (
                  <ProgramBadge
                    key={b.badge_id}
                    badgeId={b.badge_id}
                    earned={true}
                    size={72}
                    delay={index * 0.4}
                    className="shrink-0"
                  />
                ))}
                {userBadges.length > 3 && (
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border border-dashed border-[var(--border)] bg-[var(--bg-base)] shrink-0 text-center cursor-pointer">
                    <span className="font-display text-lg text-[var(--accent-text)] font-bold">
                      +{userBadges.length - 3}
                    </span>
                    <span className="text-[8px] text-[var(--text-muted)] font-body uppercase">More</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-base)]">
                <Trophy size={24} className="mx-auto text-[var(--text-muted)]" />
                <p className="text-xs font-body text-[var(--text-secondary)] mt-2">No badges earned yet</p>
                <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">Finish Day 1 to spark your journey!</p>
              </div>
            )}
          </Card>

          {/* 7. AI INSIGHT */}
          <AIInsightCard
            userId={profile.id}
            profileId={activeProfileTag}
            initialInsight={latestInsightForProfile?.insight || null}
            initialGeneratedAt={latestInsightForProfile?.created_at || null}
            hasApiKey={true}
          />

        </div>
      </div>

      {/* ── MODALS ── */}

      {/* 1. Log Workout Modal */}
      <Modal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        title="LOG TODAY'S WORKOUT"
      >
        <form onSubmit={handleLogWorkout} className="space-y-4 pt-2">
          <Input
            label="Workout Name"
            id="workout-name-input"
            type="text"
            placeholder={scheduledWorkout}
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />

          <Input
            label="Duration (Minutes)"
            id="workout-duration-input"
            type="number"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="font-body text-xs text-[var(--text-muted)]" htmlFor="workout-notes-input">
              Training Notes
            </label>
            <textarea
              id="workout-notes-input"
              rows={3}
              placeholder="Felt strong, sets completed, etc."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="w-full font-body text-sm p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => setIsWorkoutModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant="primary"
              type="submit"
              disabled={loggingStats}
            >
              {loggingStats ? "Saving..." : "Log Workout"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Log Body Stats Modal */}
      <Modal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        title="RECORD BODY COMPOSITION"
      >
        <form onSubmit={handleLogWeight} className="space-y-4 pt-2">
          <Input
            label="Weight (kg)"
            id="weight-stats-input"
            type="number"
            step="0.01"
            placeholder={latestWeightLog?.weight_kg ? Number(latestWeightLog.weight_kg).toFixed(1) : "75.0"}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            required
          />

          <Input
            label="Body Fat (%)"
            id="fat-stats-input"
            type="number"
            step="0.01"
            placeholder={latestWeightLog?.body_fat_pct ? Number(latestWeightLog.body_fat_pct).toFixed(1) : "18.5"}
            value={fatInput}
            onChange={(e) => setFatInput(e.target.value)}
          />

          <Input
            label="Skeletal Muscle Mass (kg)"
            id="muscle-stats-input"
            type="number"
            step="0.01"
            placeholder={latestWeightLog?.skeletal_muscle_mass_kg ? Number(latestWeightLog.skeletal_muscle_mass_kg).toFixed(1) : "35.0"}
            value={muscleInput}
            onChange={(e) => setMuscleInput(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => setIsWeightModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant="primary"
              type="submit"
              disabled={loggingStats}
            >
              {loggingStats ? "Saving..." : "Log Stats"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
