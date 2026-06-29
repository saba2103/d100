"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Fire, SealCheck, Lightning, Crown, Trophy, Flag, Rocket, Star,
  Scales, TrendDown, Barbell, Pill, Lock, Check, ArrowRight, CameraPlus, Sparkle, Drop,
  ChartLineUp, Footprints, ForkKnife, ChartBar, CheckCircle, XCircle, Calendar, Image as ImageIcon
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine, Cell
} from "recharts";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { PHASES, MILESTONES, MOTIVATIONAL_QUOTES, Phase, Milestone } from "@/lib/milestones";

interface Props {
  profile: any;
  activeProfile: string;
  dailyStats: any[];
  workoutLogs: any[];
  supplementLogs: any[];
  bodyMeasurements: any[];
  userBadges: any[];
  nutritionLogs: any[];
  collectionPhotos: any[];
}

function daysBetween(startDateStr?: string): number {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - start.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  fire: Fire,
  "seal-check": SealCheck,
  lightning: Lightning,
  crown: Crown,
  trophy: Trophy,
  flag: Flag,
  rocket: Rocket,
  star: Star,
};

// Custom Tooltip for Recharts
function CustomTooltip({ active, payload, label, unit = "" }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-xl shadow-xl text-xs font-body">
        <p className="font-bold text-[var(--text-muted)] border-b border-[#27272a] pb-1 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-bold flex items-center gap-2" style={{ color: entry.color || "#FF6B00" }}>
            <span>{entry.name}:</span>
            <span>{entry.value} {unit}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function JourneyClient({
  profile,
  activeProfile,
  dailyStats,
  workoutLogs,
  supplementLogs,
  bodyMeasurements,
  userBadges,
  nutritionLogs,
  collectionPhotos,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Tab State: "ALL" or day number 1..100
  const [selectedTab, setSelectedTab] = useState<number | "ALL">("ALL");

  // Program Day calculation (1-indexed, capped 1-100)
  const daysDiff = daysBetween(profile?.program_start_date);
  const programDay = Math.min(Math.max(daysDiff + 1, 1), 100);
  const progressPct = Math.round((programDay / 100) * 100);

  // Program Start Date for Day 1..100 calendar calculation
  const programStartDate = profile?.program_start_date ? new Date(profile.program_start_date) : new Date();

  function getDateForDayNum(dayNum: number): string {
    const d = new Date(programStartDate);
    d.setDate(d.getDate() + (dayNum - 1));
    return d.toISOString().split("T")[0];
  }

  function getFormattedDateForDayNum(dayNum: number): string {
    const d = new Date(programStartDate);
    d.setDate(d.getDate() + (dayNum - 1));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Animated Counter on Mount
  const [counterVal, setCounterVal] = useState(0);
  useEffect(() => {
    setMounted(true);
    let start = 0;
    const duration = 800; // ms
    const stepTime = Math.abs(Math.floor(duration / programDay));
    const timer = setInterval(() => {
      start += 1;
      setCounterVal(start);
      if (start >= programDay) clearInterval(timer);
    }, Math.max(stepTime, 15));
    return () => clearInterval(timer);
  }, [programDay]);

  // Rotating quote
  const quoteTemplate = MOTIVATIONAL_QUOTES[(programDay - 1) % MOTIVATIONAL_QUOTES.length];
  const currentQuote = quoteTemplate.replace("{day}", String(programDay));

  // Current Phase
  const currentPhase = PHASES.find((p) => programDay >= p.days[0] && programDay <= p.days[1]) || PHASES[0];

  // Transformation Calculations
  const firstMeasurement = bodyMeasurements[0];
  const latestMeasurement = bodyMeasurements.length > 1 ? bodyMeasurements[bodyMeasurements.length - 1] : null;

  const weightDelta = (firstMeasurement?.weight_kg != null && latestMeasurement?.weight_kg != null)
    ? (latestMeasurement.weight_kg - firstMeasurement.weight_kg).toFixed(1)
    : null;

  const fatDelta = (firstMeasurement?.body_fat_pct != null && latestMeasurement?.body_fat_pct != null)
    ? (latestMeasurement.body_fat_pct - firstMeasurement.body_fat_pct).toFixed(1)
    : null;

  // Habit Counts Across All 6 Modules
  const workoutDaysCount = workoutLogs.length;
  const stepsGoalDaysCount = dailyStats.filter((s) => (s.steps || 0) >= (s.steps_goal || 10000)).length;
  const nutritionDaysCount = nutritionLogs.length;
  const waterGoalDaysCount = dailyStats.filter((s) => (s.water_ml || 0) >= (s.water_goal_ml || 3000)).length;
  const supplementDaysCount = supplementLogs.length;
  const bodyStatsDaysCount = bodyMeasurements.length;
  const supplementCompliancePct = Math.min(Math.round((supplementDaysCount / programDay) * 100), 100);

  // Chart Datasets Preparation
  const bodyTrendData = bodyMeasurements.map((b) => ({
    date: b.measured_at ? b.measured_at.slice(5) : "Day",
    weight: b.weight_kg,
    bodyFat: b.body_fat_pct,
  }));

  const stepsTrendData = dailyStats.map((s) => ({
    date: s.stat_date ? s.stat_date.slice(5) : "",
    steps: s.steps || 0,
    goal: s.steps_goal || 10000,
  }));

  const waterTrendData = dailyStats.map((s) => ({
    date: s.stat_date ? s.stat_date.slice(5) : "",
    water: s.water_ml || 0,
    goal: s.water_goal_ml || 3000,
  }));

  // 14-Day Activity Heatmap & Multi-Habit Breakdown Data
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<any | null>(null);
  const heatmapSquares = Array.from({ length: 14 }).map((_, idx) => {
    const dayNum = Math.max(1, programDay - 13 + idx);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - (13 - idx));
    const dateStr = dateObj.toISOString().split("T")[0];

    const isFuture = dayNum > programDay;
    const isToday = dayNum === programDay;

    const hasWorkout = workoutLogs.some((w) => w.logged_at === dateStr || (w.created_at && w.created_at.startsWith(dateStr)));
    const hasNutrition = nutritionLogs.some((n) => n.logged_at === dateStr || (n.created_at && n.created_at.startsWith(dateStr)));
    const statRow = dailyStats.find((s) => s.stat_date === dateStr);
    const hasSteps = (statRow?.steps || 0) >= (statRow?.steps_goal || 10000);
    const hasWater = (statRow?.water_ml || 0) >= (statRow?.water_goal_ml || 3000);
    const hasSupplements = supplementLogs.some((s) => s.logged_at === dateStr);
    const hasBodyStats = bodyMeasurements.some((b) => b.measured_at === dateStr || (b.created_at && b.created_at.startsWith(dateStr)));

    const completedHabitsCount = [hasWorkout, hasSteps, hasNutrition, hasWater, hasSupplements, hasBodyStats].filter(Boolean).length;

    return {
      dayNum,
      dateStr,
      isFuture,
      isToday,
      hasWorkout,
      hasSteps,
      hasNutrition,
      hasWater,
      hasSupplements,
      hasBodyStats,
      completedHabitsCount,
    };
  });

  // Photo URLs from Supabase Storage signed URLs
  const [day1PhotoUrl, setDay1PhotoUrl] = useState<string | null>(null);
  const [latestPhotoUrl, setLatestPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const supabase = createClient();
      if (collectionPhotos.length > 0) {
        const first = collectionPhotos[0];
        if (first.file_url.startsWith("http")) setDay1PhotoUrl(first.file_url);
        else {
          const { data } = await supabase.storage.from("collection").createSignedUrl(first.file_url, 3600);
          if (data?.signedUrl) setDay1PhotoUrl(data.signedUrl);
        }
      }
      if (collectionPhotos.length > 1) {
        const last = collectionPhotos[collectionPhotos.length - 1];
        if (last.file_url.startsWith("http")) setLatestPhotoUrl(last.file_url);
        else {
          const { data } = await supabase.storage.from("collection").createSignedUrl(last.file_url, 3600);
          if (data?.signedUrl) setLatestPhotoUrl(data.signedUrl);
        }
      }
    };
    fetchPhotos();
  }, [collectionPhotos]);

  // Single Day View Data when selectedTab !== "ALL"
  const singleDayNum = typeof selectedTab === "number" ? selectedTab : 1;
  const singleDayDateStr = getDateForDayNum(singleDayNum);
  const singleDayFormattedDate = getFormattedDateForDayNum(singleDayNum);

  const singleDayWorkout = workoutLogs.find((w) => w.logged_at === singleDayDateStr || (w.created_at && w.created_at.startsWith(singleDayDateStr)));
  const singleDayNutrition = nutritionLogs.filter((n) => n.logged_at === singleDayDateStr || (n.created_at && n.created_at.startsWith(singleDayDateStr)));
  const singleDayStats = dailyStats.find((s) => s.stat_date === singleDayDateStr);
  const singleDaySupplements = supplementLogs.find((s) => s.logged_at === singleDayDateStr);
  const singleDayBody = bodyMeasurements.find((b) => b.measured_at === singleDayDateStr || (b.created_at && b.created_at.startsWith(singleDayDateStr)));
  const singleDayPhotos = collectionPhotos.filter((c) => (c.taken_at && c.taken_at.startsWith(singleDayDateStr)) || (c.created_at && c.created_at.startsWith(singleDayDateStr)));

  // Single Day signed photo URLs
  const [singleDayPhotoUrls, setSingleDayPhotoUrls] = useState<string[]>([]);
  useEffect(() => {
    if (selectedTab === "ALL") return;
    const fetchSingleDayPhotos = async () => {
      const supabase = createClient();
      const urls: string[] = [];
      for (const p of singleDayPhotos) {
        if (p.file_url.startsWith("http")) urls.push(p.file_url);
        else {
          const { data } = await supabase.storage.from("collection").createSignedUrl(p.file_url, 3600);
          if (data?.signedUrl) urls.push(data.signedUrl);
        }
      }
      setSingleDayPhotoUrls(urls);
    };
    fetchSingleDayPhotos();
  }, [selectedTab, singleDayPhotos]);

  // Earned Badges Set
  const earnedBadgeSet = new Set(userBadges.map((b) => b.badge_id));
  const nextMilestone = MILESTONES.find((m) => programDay < m.day) || MILESTONES[MILESTONES.length - 1];

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-8">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TOP 100-DAY TIMELINE TAB BAR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={16} className="text-[var(--accent-text)]" /> Program Timeline
          </span>
          {selectedTab !== "ALL" && (
            <button
              onClick={() => setSelectedTab("ALL")}
              className="font-body text-xs font-bold text-[var(--accent-text)] hover:underline flex items-center gap-1"
            >
              View Full Story Dashboard →
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* ALL Tab */}
          <button
            onClick={() => setSelectedTab("ALL")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-display uppercase font-black tracking-wider transition-all shrink-0 flex flex-col items-center border",
              selectedTab === "ALL"
                ? "bg-gradient-to-r from-[#FF6B00] to-[#FFAA00] text-white border-transparent shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                : "bg-[#18181b] text-[var(--text-secondary)] border-[#27272a] hover:text-[var(--text-primary)]"
            )}
          >
            <span>ALL</span>
            <span className="text-[9px] font-body font-normal opacity-80 mt-0.5">Overview</span>
          </button>

          {/* Days 1 to 100 Tabs */}
          {Array.from({ length: 100 }).map((_, idx) => {
            const dayNum = idx + 1;
            const isSelected = selectedTab === dayNum;
            const isPastOrToday = dayNum <= programDay;
            const dateLabel = getFormattedDateForDayNum(dayNum);

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedTab(dayNum)}
                className={cn(
                  "px-3.5 py-1.5 rounded-2xl text-xs font-body transition-all shrink-0 flex flex-col items-center border min-w-[64px]",
                  isSelected
                    ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                    : isPastOrToday
                    ? "bg-[#18181b] text-[var(--text-primary)] border-[#27272a] hover:border-[#FF6B00]/50"
                    : "bg-[#09090b] text-[var(--text-muted)] border-[#27272a]/40 opacity-50"
                )}
              >
                <span className="font-bold">Day {dayNum}</span>
                <span className="text-[9px] opacity-75">{dateLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          VIEW MODE 1: SINGLE DAY DETAILED VIEW
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {selectedTab !== "ALL" ? (
        <div className="space-y-6 animate-fade-in">
          {/* Day Header */}
          <Card variant="surface" className="p-6 rounded-3xl bg-[#18181B] border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-body font-bold text-[#FF6B00] uppercase tracking-widest block">
                  TIMELINE DAY INSPECTOR
                </span>
                <h1 className="font-display text-4xl text-[var(--text-primary)] font-black uppercase tracking-wide">
                  DAY {singleDayNum}
                </h1>
              </div>
              <div className="text-right">
                <p className="font-body text-xs font-bold text-[var(--text-muted)]">{singleDayFormattedDate}</p>
                <p className="font-body text-[10px] text-[var(--text-muted)]">{singleDayDateStr}</p>
              </div>
            </div>
          </Card>

          {/* 1. Transformation / Activity Photo First */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={18} className="text-[#FF6B00]" /> 1. Photos &amp; Visual Logs
            </h3>

            {singleDayPhotoUrls.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {singleDayPhotoUrls.map((url, i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#27272a] bg-black">
                    <img src={url} alt={`Day ${singleDayNum} Photo`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <Card variant="surface" className="p-8 rounded-2xl border-[#27272a] text-center space-y-3 bg-[#09090b]">
                <CameraPlus size={36} className="text-[var(--text-muted)] mx-auto" />
                <p className="font-body text-xs text-[var(--text-muted)]">No photos were logged on Day {singleDayNum}.</p>
                <button
                  onClick={() => router.push("/collection/upload")}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 text-xs font-bold hover:bg-[#FF6B00]/20 transition-colors"
                >
                  Upload Progress Photo
                </button>
              </Card>
            )}
          </div>

          {/* 2. Grouped Tracking Logs Below */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle size={18} className="text-emerald-400" /> 2. Daily Tracking Logs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Workout Log Card */}
              <Card variant="surface" className="p-5 rounded-2xl border-[#27272a] bg-[#09090b] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
                  <Barbell size={20} className="text-[#FF6B00]" />
                  <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase">Workout Log</h4>
                </div>
                {singleDayWorkout ? (
                  <div className="space-y-2 text-xs font-body">
                    <p className="text-emerald-400 font-bold">✓ Workout Crushed ({singleDayWorkout.duration_minutes || 45} mins)</p>
                    {Array.isArray(singleDayWorkout.exercises) && (
                      <div className="space-y-1 pt-1 border-t border-[#27272a]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Exercises Executed:</p>
                        {singleDayWorkout.exercises.map((ex: any, idx: number) => (
                          <p key={idx} className="text-[var(--text-secondary)] font-medium">
                            • {ex.name || ex.exerciseName || "Exercise"} ({ex.sets?.length || 3} sets)
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-body text-xs text-[var(--text-muted)] italic">No workout logged for this date.</p>
                )}
              </Card>

              {/* Nutrition & Meals Card */}
              <Card variant="surface" className="p-5 rounded-2xl border-[#27272a] bg-[#09090b] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
                  <ForkKnife size={20} className="text-emerald-400" />
                  <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase">Nutrition &amp; Meals</h4>
                </div>
                {singleDayNutrition.length > 0 ? (
                  <div className="space-y-2 text-xs font-body">
                    <p className="text-emerald-400 font-bold">✓ {singleDayNutrition.length} Meals Logged</p>
                    <div className="space-y-1 pt-1 border-t border-[#27272a]">
                      {singleDayNutrition.map((mealLog: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[var(--text-secondary)]">
                          <span className="capitalize font-bold">{mealLog.meal_type}:</span>
                          <span>{mealLog.items?.map((i: any) => i.name).join(", ") || "Meals logged"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-xs text-[var(--text-muted)] italic">No meals logged for this date.</p>
                )}
              </Card>

              {/* Hydration Card */}
              <Card variant="surface" className="p-5 rounded-2xl border-[#27272a] bg-[#09090b] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
                  <Drop size={20} className="text-blue-400" />
                  <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase">Water Hydration</h4>
                </div>
                {singleDayStats?.water_ml ? (
                  <div className="space-y-1 text-xs font-body">
                    <p className="text-blue-400 font-bold">{singleDayStats.water_ml} ml / {singleDayStats.water_goal_ml || 3000} ml</p>
                    <p className="text-[var(--text-muted)] text-[10px]">
                      {singleDayStats.water_ml >= (singleDayStats.water_goal_ml || 3000) ? "✓ Hydration Goal Reached!" : "Target partially logged"}
                    </p>
                  </div>
                ) : (
                  <p className="font-body text-xs text-[var(--text-muted)] italic">No water intake logged.</p>
                )}
              </Card>

              {/* Steps Card */}
              <Card variant="surface" className="p-5 rounded-2xl border-[#27272a] bg-[#09090b] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
                  <Footprints size={20} className="text-amber-400" />
                  <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase">Daily Steps</h4>
                </div>
                {singleDayStats?.steps ? (
                  <div className="space-y-1 text-xs font-body">
                    <p className="text-amber-400 font-bold">{singleDayStats.steps} steps</p>
                    <p className="text-[var(--text-muted)] text-[10px]">Target: {singleDayStats.steps_goal || 10000} steps</p>
                  </div>
                ) : (
                  <p className="font-body text-xs text-[var(--text-muted)] italic">No steps logged for this date.</p>
                )}
              </Card>

              {/* Supplements Card */}
              <Card variant="surface" className="p-5 rounded-2xl border-[#27272a] bg-[#09090b] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
                  <Pill size={20} className="text-purple-400" />
                  <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase">Supplements</h4>
                </div>
                {singleDaySupplements ? (
                  <p className="font-body text-xs text-purple-400 font-bold">✓ Daily Supplements Checked</p>
                ) : (
                  <p className="font-body text-xs text-[var(--text-muted)] italic">No supplement checklist saved.</p>
                )}
              </Card>

              {/* Body Stats Card */}
              <Card variant="surface" className="p-5 rounded-2xl border-[#27272a] bg-[#09090b] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
                  <Scales size={20} className="text-cyan-400" />
                  <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase">Body Measurements</h4>
                </div>
                {singleDayBody ? (
                  <div className="space-y-1 text-xs font-body text-[var(--text-secondary)]">
                    {singleDayBody.weight_kg && <p>• Weight: <strong className="text-white">{singleDayBody.weight_kg} kg</strong></p>}
                    {singleDayBody.body_fat_pct && <p>• Body Fat: <strong className="text-white">{singleDayBody.body_fat_pct}%</strong></p>}
                    {singleDayBody.muscle_mass_kg && <p>• Muscle Mass: <strong className="text-white">{singleDayBody.muscle_mass_kg} kg</strong></p>}
                  </div>
                ) : (
                  <p className="font-body text-xs text-[var(--text-muted)] italic">No body measurements recorded.</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      ) : (

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            VIEW MODE 2: FULL STORY OVERVIEW (ALL TAB)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        <>
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 1 — HERO COUNTER
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Card
            variant="surface"
            className="p-6 rounded-3xl bg-[#18181B] border-[#27272a] shadow-[0_0_30px_rgba(255,107,0,0.12)] relative overflow-hidden space-y-6"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#27272a]/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-start)]/20 text-[var(--accent-text)] border border-[var(--accent-start)]/40 flex items-center justify-center font-display font-black text-xs">
                  {activeProfile}
                </span>
                <span className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  Profile {activeProfile}
                </span>
              </div>
              <p className="font-body text-xs text-[var(--text-muted)] italic text-right max-w-xs truncate">
                &ldquo;{currentQuote}&rdquo;
              </p>
            </div>

            <div className="text-center space-y-1">
              <p className="font-body text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">DAY</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-7xl sm:text-8xl lg:text-9xl font-black bg-gradient-to-r from-[#FF6B00] to-[#FFAA00] bg-clip-text text-transparent leading-none">
                  {counterVal}
                </span>
                <span className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-muted)] leading-none">
                  /100
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FFAA00]"
                />
              </div>
              <div className="flex items-center justify-between font-body text-xs text-[var(--text-muted)]">
                <span>{programDay} days in</span>
                <span>{100 - programDay} days to go</span>
              </div>
            </div>
          </Card>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 2 — TRANSFORMATION PHOTOS
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wider text-[var(--text-secondary)] uppercase">
                TRANSFORMATION PHOTOS
              </h2>
              <Link href="/collection" className="font-body text-xs font-bold text-[var(--accent-text)] hover:underline flex items-center gap-1">
                VIEW ALL <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-body text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">DAY 1</p>
                {day1PhotoUrl ? (
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#27272a] bg-black">
                    <img src={day1PhotoUrl} alt="Day 1 Baseline" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button
                    onClick={() => router.push("/collection")}
                    className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-[#27272a] hover:border-[var(--accent-start)]/50 bg-[#09090b] flex flex-col items-center justify-center gap-2 p-4 text-center transition-all group"
                  >
                    <CameraPlus size={28} className="text-[var(--text-muted)] group-hover:text-[var(--accent-text)] transition-colors" />
                    <span className="font-body text-xs text-[var(--text-muted)] font-medium">Add Progress Photo</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-body text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">DAY {programDay}</p>
                {latestPhotoUrl ? (
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#27272a] bg-black">
                    <img src={latestPhotoUrl} alt={`Day ${programDay}`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button
                    onClick={() => router.push("/collection")}
                    className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-[#27272a] hover:border-[var(--accent-start)]/50 bg-[#09090b] flex flex-col items-center justify-center gap-2 p-4 text-center transition-all group"
                  >
                    <CameraPlus size={28} className="text-[var(--text-muted)] group-hover:text-[var(--accent-text)] transition-colors" />
                    <span className="font-body text-xs text-[var(--text-muted)] font-medium">Add Progress Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 3 — PHASE JOURNEY
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-[var(--text-secondary)] uppercase">
              YOUR JOURNEY
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {PHASES.map((p) => {
                const isCompleted = programDay > p.days[1];
                const isActive = programDay >= p.days[0] && programDay <= p.days[1];
                const isLocked = programDay < p.days[0];

                const phaseTotalDays = p.days[1] - p.days[0] + 1;
                const phaseCurrentDays = isActive ? Math.max(0, programDay - p.days[0] + 1) : isCompleted ? phaseTotalDays : 0;
                const phasePct = Math.round((phaseCurrentDays / phaseTotalDays) * 100);

                return (
                  <Card
                    key={p.number}
                    variant="surface"
                    className={cn(
                      "p-5 rounded-2xl transition-all relative flex flex-col justify-between space-y-4",
                      isActive && "border-2 border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.2)] bg-[#18181B]",
                      isCompleted && "border-emerald-500/40 bg-[#09090b]/80",
                      isLocked && "bg-[var(--bg-elevated)]/40 opacity-60 border-[#27272a]"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-black text-[var(--text-primary)] uppercase">
                          {p.label}
                        </span>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-[rgba(255,107,0,0.15)] text-[#FF6B00] border border-[#FF6B00]/30 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check size={12} weight="bold" /> COMPLETE
                          </span>
                        )}
                        {isLocked && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-[#27272a] text-[var(--text-muted)] flex items-center gap-1">
                            <Lock size={10} /> LOCKED
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="font-body text-xs font-bold text-[var(--text-primary)]">{p.theme}</p>
                        <p className="font-body text-[11px] text-[var(--text-muted)]">Days {p.days[0]}–{p.days[1]}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="w-full h-1.5 rounded-full bg-[var(--bg-base)] overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isCompleted ? "bg-emerald-400" : isActive ? "bg-[#FF6B00]" : "bg-transparent"
                          )}
                          style={{ width: `${phasePct}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 3 — TRANSFORMATION STATS
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-[var(--text-secondary)] uppercase">
              TRANSFORMATION
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="surface" className="p-4 rounded-2xl border-[#27272a] bg-[#09090b]/60 space-y-2">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Scales size={16} weight="bold" className="text-[var(--accent-text)]" />
                  <span className="font-body text-[11px] font-bold uppercase tracking-wider">Weight Lost</span>
                </div>
                <p className="font-display text-3xl font-black text-[var(--text-primary)]">
                  {weightDelta !== null ? `${Math.abs(Number(weightDelta))}kg` : "—"}
                </p>
                <p className="font-body text-xs font-bold">
                  {weightDelta !== null ? (
                    Number(weightDelta) <= 0 ? (
                      <span className="text-emerald-400">↓ {Math.abs(Number(weightDelta))}kg since Day 1</span>
                    ) : (
                      <span className="text-orange-400">↑ {weightDelta}kg gain</span>
                    )
                  ) : (
                    <span className="text-[var(--text-muted)] font-normal">Log to track</span>
                  )}
                </p>
              </Card>

              <Card variant="surface" className="p-4 rounded-2xl border-[#27272a] bg-[#09090b]/60 space-y-2">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <TrendDown size={16} weight="bold" className="text-emerald-400" />
                  <span className="font-body text-[11px] font-bold uppercase tracking-wider">Body Fat</span>
                </div>
                <p className="font-display text-3xl font-black text-[var(--text-primary)]">
                  {fatDelta !== null ? `${Math.abs(Number(fatDelta))}%` : "—"}
                </p>
                <p className="font-body text-xs font-bold">
                  {fatDelta !== null ? (
                    Number(fatDelta) <= 0 ? (
                      <span className="text-emerald-400">↓ {Math.abs(Number(fatDelta))}% since Day 1</span>
                    ) : (
                      <span className="text-orange-400">↑ {fatDelta}% body fat</span>
                    )
                  ) : (
                    <span className="text-[var(--text-muted)] font-normal">Log to track</span>
                  )}
                </p>
              </Card>

              <Card variant="surface" className="p-4 rounded-2xl border-[#27272a] bg-[#09090b]/60 space-y-2">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Barbell size={16} weight="bold" className="text-blue-400" />
                  <span className="font-body text-[11px] font-bold uppercase tracking-wider">Workouts Done</span>
                </div>
                <p className="font-display text-3xl font-black text-[var(--text-primary)]">
                  {workoutDaysCount}
                </p>
                <p className="font-body text-xs text-[var(--text-muted)] font-normal">
                  of {programDay} days
                </p>
              </Card>

              <Card variant="surface" className="p-4 rounded-2xl border-[#27272a] bg-[#09090b]/60 space-y-2">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Pill size={16} weight="bold" className="text-purple-400" />
                  <span className="font-body text-[11px] font-bold uppercase tracking-wider">Supplement Rate</span>
                </div>
                <p className="font-display text-3xl font-black text-[var(--text-primary)]">
                  {supplementCompliancePct}%
                </p>
                <p className="font-body text-xs text-purple-400 font-bold">
                  {supplementDaysCount} days logged
                </p>
              </Card>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 4 — SEPARATE 100-DOT HABIT MATRICES
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wider text-[var(--text-secondary)] uppercase">
                100-DAY HABIT MATRICES
              </h2>
              <span className="text-xs font-body text-[var(--text-muted)]">Tap any day dot to inspect that day</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  key: "workout",
                  label: "Gym Workouts",
                  icon: Barbell,
                  color: "#EF4444", // Vibrant Red like reference
                  count: workoutDaysCount,
                  checkFn: (dayStr: string) => workoutLogs.some((w) => w.logged_at === dayStr || (w.created_at && w.created_at.startsWith(dayStr))),
                },
                {
                  key: "water",
                  label: "Drink 3L Water",
                  icon: Drop,
                  color: "#06B6D4", // Teal Blue like reference
                  count: waterGoalDaysCount,
                  checkFn: (dayStr: string) => {
                    const row = dailyStats.find((s) => s.stat_date === dayStr);
                    return (row?.water_ml || 0) >= (row?.water_goal_ml || 3000);
                  },
                },
                {
                  key: "nutrition",
                  label: "Clean Nutrition",
                  icon: ForkKnife,
                  color: "#10B981", // Emerald Green like reference
                  count: nutritionDaysCount,
                  checkFn: (dayStr: string) => nutritionLogs.some((n) => n.logged_at === dayStr || (n.created_at && n.created_at.startsWith(dayStr))),
                },
                {
                  key: "steps",
                  label: "10k Daily Steps",
                  icon: Footprints,
                  color: "#3B82F6", // Vibrant Blue like reference
                  count: stepsGoalDaysCount,
                  checkFn: (dayStr: string) => {
                    const row = dailyStats.find((s) => s.stat_date === dayStr);
                    return (row?.steps || 0) >= (row?.steps_goal || 10000);
                  },
                },
                {
                  key: "supplements",
                  label: "Daily Supplements",
                  icon: Pill,
                  color: "#A855F7", // Purple like reference
                  count: supplementDaysCount,
                  checkFn: (dayStr: string) => supplementLogs.some((s) => s.logged_at === dayStr),
                },
                {
                  key: "body",
                  label: "Body Stats Logged",
                  icon: Scales,
                  color: "#EC4899", // Pink like reference
                  count: bodyStatsDaysCount,
                  checkFn: (dayStr: string) => bodyMeasurements.some((b) => b.measured_at === dayStr || (b.created_at && b.created_at.startsWith(dayStr))),
                },
              ].map((matrix) => (
                <Card key={matrix.key} variant="surface" className="p-5 rounded-3xl border-[#27272a] bg-[#18181b]/90 space-y-4 shadow-xl">
                  {/* Card Header matching reference image */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <matrix.icon size={18} weight="fill" style={{ color: matrix.color }} />
                      <h3 className="font-display text-base font-black text-white tracking-wide">
                        {matrix.label}
                      </h3>
                    </div>
                    <p className="font-body text-[11px] text-[var(--text-muted)] font-medium">
                      {matrix.count} days completed • {100 - matrix.count} days remaining
                    </p>
                  </div>

                  {/* Clean 100-Box Matrix Grid (10 Columns x 10 Rows) */}
                  <div className="grid grid-cols-10 gap-1.5 pt-1">
                    {Array.from({ length: 100 }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dateStr = getDateForDayNum(dayNum);
                      const isPastOrToday = dayNum <= programDay;
                      const isToday = dayNum === programDay;
                      const isDone = isPastOrToday && matrix.checkFn(dateStr);

                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => setSelectedTab(dayNum)}
                          title={`Day ${dayNum} (${getFormattedDateForDayNum(dayNum)}) - ${isDone ? "Completed" : "Missed"}`}
                          className={cn(
                            "aspect-square rounded-md transition-all border relative group",
                            isDone
                              ? "shadow-sm hover:scale-115"
                              : isPastOrToday
                              ? "bg-[#09090b] border-[#27272a]/60 hover:border-[#27272a]"
                              : "bg-[#09090b]/40 border-[#27272a]/20 opacity-40 cursor-not-allowed",
                            isToday && "ring-2 ring-[#3f3f46] scale-110 z-10"
                          )}
                          style={{
                            backgroundColor: isDone ? matrix.color : undefined,
                            borderColor: isDone ? matrix.color : undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 5 — PROGRESS TREND GRAPHS
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wider text-[var(--text-secondary)] uppercase">
                PROGRESS TRENDS &amp; ANALYTICS
              </h2>
              <Link href="/body-stats/trends" className="font-body text-xs font-bold text-[var(--accent-text)] hover:underline flex items-center gap-1">
                ALL BODY TRENDS <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="surface" className="p-5 rounded-3xl border-[#27272a] bg-[#09090b]/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scales size={18} className="text-[var(--accent-text)]" />
                    <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                      Weight Progression (kg)
                    </h3>
                  </div>
                </div>
                {bodyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={bodyTrendData}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} domain={["dataMin - 1", "dataMax + 1"]} />
                      <Tooltip content={<CustomTooltip unit="kg" />} />
                      <Line type="monotone" dataKey="weight" name="Weight" stroke="#FF6B00" strokeWidth={2.5} dot={{ fill: "#FF6B00", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)] italic">
                    Log body measurements to view weight trend line
                  </div>
                )}
              </Card>

              <Card variant="surface" className="p-5 rounded-3xl border-[#27272a] bg-[#09090b]/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendDown size={18} className="text-emerald-400" />
                    <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                      Body Fat Trend (%)
                    </h3>
                  </div>
                </div>
                {bodyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={bodyTrendData}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} domain={["dataMin - 1", "dataMax + 1"]} />
                      <Tooltip content={<CustomTooltip unit="%" />} />
                      <Line type="monotone" dataKey="bodyFat" name="Body Fat" stroke="#10B981" strokeWidth={2.5} dot={{ fill: "#10B981", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)] italic">
                    Log body fat % to view fat loss trajectory
                  </div>
                )}
              </Card>

              <Card variant="surface" className="p-5 rounded-3xl border-[#27272a] bg-[#09090b]/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Footprints size={18} className="text-amber-400" />
                    <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                      Daily Steps vs Target
                    </h3>
                  </div>
                </div>
                {stepsTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={stepsTrendData}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} />
                      <Tooltip content={<CustomTooltip unit="steps" />} />
                      <ReferenceLine y={10000} stroke="#F59E0B" strokeDasharray="3 3" />
                      <Bar dataKey="steps" name="Steps" radius={[4, 4, 0, 0]}>
                        {stepsTrendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.steps >= 10000 ? "#F59E0B" : "#3F3F46"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)] italic">
                    Log daily steps to view activity chart
                  </div>
                )}
              </Card>

              <Card variant="surface" className="p-5 rounded-3xl border-[#27272a] bg-[#09090b]/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Drop size={18} className="text-blue-400" />
                    <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                      Hydration Target (ml)
                    </h3>
                  </div>
                </div>
                {waterTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={waterTrendData}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} />
                      <Tooltip content={<CustomTooltip unit="ml" />} />
                      <ReferenceLine y={3000} stroke="#3B82F6" strokeDasharray="3 3" />
                      <Bar dataKey="water" name="Water Intake" radius={[4, 4, 0, 0]}>
                        {waterTrendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.water >= 3000 ? "#3B82F6" : "#27272A"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-[var(--text-muted)] italic">
                    Log water intake to view hydration trends
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 6 — MILESTONES
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wider text-[var(--text-secondary)] uppercase">
              MILESTONES
            </h2>

            <Card variant="surface" className="p-6 rounded-3xl border-[#27272a] bg-[#09090b]/60">
              <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#27272a]">
                {MILESTONES.map((m) => {
                  const isReached = programDay >= m.day;
                  const isNext = m.id === nextMilestone.id && !isReached;
                  const IconComp = MILESTONE_ICONS[m.icon] || Star;
                  const hasBadge = m.badge_id && earnedBadgeSet.has(m.badge_id);

                  return (
                    <div key={m.id} className="relative flex items-center justify-between gap-4">
                      <div
                        className={cn(
                          "absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
                          isReached ? "bg-[#FF6B00] text-white" : isNext ? "bg-[#09090b] border-2 border-[#FF6B00] text-[#FF6B00] animate-pulse" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                        )}
                      >
                        {isReached ? <Check size={12} weight="bold" /> : <IconComp size={12} weight="bold" />}
                      </div>

                      <div className="min-w-0 flex-1 pl-2">
                        <p className={cn("font-body text-sm font-bold truncate", isReached ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                          {m.label}
                        </p>
                        <div className="flex items-center gap-2 font-body text-xs">
                          <span className="text-[var(--text-muted)]">Day {m.day}</span>
                          {isReached && <span className="text-emerald-400 font-bold">Reached</span>}
                          {isNext && <span className="text-[#FF6B00] font-bold">{m.day - programDay} days away</span>}
                        </div>
                      </div>

                      {hasBadge && (
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-start)]/10 border border-[var(--accent-start)]/30 flex items-center justify-center text-[var(--accent-text)] shrink-0 shadow-sm">
                          <IconComp size={22} weight="fill" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>



          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 8 — AI INSIGHT CARD
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Card variant="surface" className="p-6 rounded-3xl border-[#27272a] bg-[#09090b]/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-[rgba(249,115,22,0.12)] text-[var(--accent-text)] border border-[rgba(249,115,22,0.2)] flex items-center gap-1">
                <Sparkle size={12} weight="fill" /> Coach Trajectory
              </span>
            </div>
            <h3 className="font-display text-lg font-black tracking-wider text-[var(--text-primary)] uppercase">
              100-DAY TRANSFORMATION STORY
            </h3>
            <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
              You are currently on <strong>Day {programDay}</strong> of your 100-day journey in <strong>{currentPhase.label} ({currentPhase.theme})</strong>. You have completed {workoutDaysCount} workouts and achieved {supplementCompliancePct}% supplement compliance. Keep driving consistency each day to unlock your full potential!
            </p>
          </Card>
        </>
      )}

    </div>
  );
}
