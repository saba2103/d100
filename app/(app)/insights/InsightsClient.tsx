"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Robot, Sparkle, Lightning, Fire, Drop, Pill, Barbell,
  CheckCircle, XCircle, Warning, Trophy, ArrowRight, CalendarBlank,
  Star, Target, Flame, TrendUp, TrendDown
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface InsightItem {
  id: string;
  user_id: string;
  profile_tag: "S" | "A";
  insight: string;
  created_at: string;
}

interface ParsedInsight {
  headline?: string;
  overallScore?: number;
  scoreLabel?: string;
  wins?: string[];
  improvements?: string[];
  coachNote?: string;
  focusAreas?: {
    workout?: { status: string; detail: string };
    nutrition?: { status: string; detail: string };
    hydration?: { status: string; detail: string };
    supplements?: { status: string; detail: string };
  };
  dayNumber?: number;
  date?: string;
}

interface InsightsClientProps {
  userId: string;
  profileId: "S" | "A";
  programStartDate: string | null;
  initialHistory: InsightItem[];
}

function getDayNumber(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function getDateForDay(startDate: string, day: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + day - 1);
  return d.toISOString().split("T")[0];
}

function tryParseInsight(raw: string): ParsedInsight | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#27272a" strokeWidth="8" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display font-black text-2xl text-white leading-none">{score}</span>
        <span className="font-display text-[9px] uppercase tracking-widest text-white/50 mt-0.5">{label}</span>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed" || status === "on_track" || status === "hit" || status === "taken") {
    return <CheckCircle size={16} weight="fill" className="text-emerald-400 shrink-0" />;
  }
  if (status === "partial") {
    return <Warning size={16} weight="fill" className="text-amber-400 shrink-0" />;
  }
  return <XCircle size={16} weight="fill" className="text-zinc-600 shrink-0" />;
}

const FOCUS_ICONS: Record<string, any> = {
  workout: Barbell,
  nutrition: Fire,
  hydration: Drop,
  supplements: Pill,
};

const FOCUS_LABELS: Record<string, string> = {
  workout: "Workout",
  nutrition: "Nutrition",
  hydration: "Hydration",
  supplements: "Supplements",
};

function InsightDisplay({ insight, dayNumber }: { insight: ParsedInsight; dayNumber: number }) {
  const score = insight.overallScore ?? 0;
  const scoreColor = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : score >= 40 ? "text-orange-400" : "text-red-400";
  const scoreBg = score >= 80 ? "from-emerald-500/10 to-teal-500/10 border-emerald-500/20" : score >= 60 ? "from-amber-500/10 to-orange-500/10 border-amber-500/20" : "from-red-500/10 to-orange-500/10 border-red-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Hero banner — score + headline */}
      <div className={cn("relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6", scoreBg)}>
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-5">
          <ScoreRing score={score} label={insight.scoreLabel ?? "Score"} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display text-[10px] font-black uppercase tracking-widest text-white/40">Day {dayNumber} · AI Summary</span>
            </div>
            <h2 className="font-display font-black text-white text-xl leading-tight uppercase">
              {insight.headline ?? "Your Daily Breakdown"}
            </h2>
          </div>
        </div>
      </div>

      {/* Focus Areas Grid */}
      {insight.focusAreas && (
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-white/30 mb-3">Focus Areas</p>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(insight.focusAreas).map(([key, val]) => {
              if (!val) return null;
              const Icon = FOCUS_ICONS[key] || Target;
              const isGood = val.status === "completed" || val.status === "on_track" || val.status === "hit" || val.status === "taken";
              const isMid = val.status === "partial";
              return (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col gap-2 p-3.5 rounded-2xl border",
                    isGood ? "bg-emerald-500/8 border-emerald-500/15" :
                    isMid ? "bg-amber-500/8 border-amber-500/15" :
                    "bg-zinc-800/40 border-zinc-700/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", isGood ? "bg-emerald-500/15" : isMid ? "bg-amber-500/15" : "bg-zinc-700/40")}>
                      <Icon size={14} weight="bold" className={isGood ? "text-emerald-400" : isMid ? "text-amber-400" : "text-zinc-500"} />
                    </div>
                    <span className="font-display text-[10px] font-black uppercase tracking-wider text-white/60">
                      {FOCUS_LABELS[key]}
                    </span>
                    <StatusIcon status={val.status} />
                  </div>
                  {val.detail && (
                    <p className="font-body text-[11px] text-white/50 leading-snug">{val.detail}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wins */}
      {insight.wins && insight.wins.length > 0 && (
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-white/30 mb-3 flex items-center gap-1.5">
            <Trophy size={11} className="text-amber-400" /> Wins
          </p>
          <div className="space-y-2">
            {insight.wins.map((win, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15"
              >
                <CheckCircle size={15} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="font-body text-sm text-white/80 leading-snug">{win}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {insight.improvements && insight.improvements.length > 0 && (
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-white/30 mb-3 flex items-center gap-1.5">
            <TrendUp size={11} className="text-blue-400" /> Areas to Improve
          </p>
          <div className="space-y-2">
            {insight.improvements.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/8 border border-blue-500/15"
              >
                <ArrowRight size={15} weight="bold" className="text-blue-400 shrink-0 mt-0.5" />
                <p className="font-body text-sm text-white/80 leading-snug">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Coach Note */}
      {insight.coachNote && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-[#FF6B00]/20 bg-gradient-to-br from-[#FF6B00]/10 to-[#FFAA00]/5 p-5"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#FF6B00]/10 blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#FF6B00]/15 shrink-0">
              <Robot size={18} weight="bold" className="text-[#FF6B00]" />
            </div>
            <div>
              <p className="font-display text-[10px] font-black uppercase tracking-widest text-[#FF6B00]/70 mb-1.5">Coach Note</p>
              <p className="font-body text-sm text-white/80 leading-relaxed italic">&ldquo;{insight.coachNote}&rdquo;</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function EmptyDay({ dayNumber, isPast }: { dayNumber: number; isPast: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center">
        <Robot size={28} weight="duotone" className="text-zinc-500" />
      </div>
      <div>
        <p className="font-display font-black text-white/40 uppercase tracking-wider text-sm">
          {isPast ? "No summary yet" : "Upcoming"}
        </p>
        <p className="font-body text-xs text-white/25 mt-1 max-w-[200px]">
          {isPast
            ? `Generate a coaching summary for Day ${dayNumber} using the button below.`
            : `Day ${dayNumber} hasn't started yet. Keep going!`}
        </p>
      </div>
    </div>
  );
}

export function InsightsClient({
  userId,
  profileId,
  programStartDate,
  initialHistory,
}: InsightsClientProps) {
  const programDay = programStartDate ? getDayNumber(programStartDate) : 1;
  const [selectedDay, setSelectedDay] = useState(Math.min(programDay, 100));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Build a map of dayNumber → ParsedInsight from history
  const insightsByDay = useMemo(() => {
    const map: Record<number, ParsedInsight> = {};
    for (const item of initialHistory) {
      const parsed = tryParseInsight(item.insight);
      if (parsed?.dayNumber) {
        // Only keep the most recent per day (history is ordered desc)
        if (!map[parsed.dayNumber]) {
          map[parsed.dayNumber] = parsed;
        }
      }
    }
    return map;
  }, [initialHistory]);

  // Runtime-added insights (generated this session)
  const [sessionInsights, setSessionInsights] = useState<Record<number, ParsedInsight>>({});

  const allInsights = useMemo(() => ({ ...insightsByDay, ...sessionInsights }), [insightsByDay, sessionInsights]);

  const currentInsight = allInsights[selectedDay] ?? null;

  // Scroll tabs to selected day on mount / change
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const btn = container.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement;
    if (btn) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedDay]);

  const handleGenerate = async () => {
    if (!programStartDate) {
      setError("Program start date not set. Go to Settings to configure your start date.");
      return;
    }
    setGenerating(true);
    setError(null);
    const date = getDateForDay(programStartDate, selectedDay);
    try {
      const res = await fetch("/api/insights/generate-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, profileId, dayNumber: selectedDay }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed. Try again.");
      } else if (data.error === "no_data") {
        setError(data.message || "No data logged for this day.");
      } else if (data.insight) {
        setSessionInsights(prev => ({ ...prev, [selectedDay]: { ...data.insight, dayNumber: selectedDay, date } }));
      }
    } catch {
      setError("Something went wrong. Check your connection.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-36 pt-4 px-4 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[#FF6B00]/15">
            <Robot size={16} weight="bold" className="text-[#FF6B00]" />
          </div>
          <h1 className="font-display text-3xl text-white font-black tracking-wide uppercase">
            AI Insights
          </h1>
        </div>
        <p className="font-body text-xs text-white/30 uppercase tracking-wider">
          Daily coaching summaries · Profile {profileId}
          {!programStartDate && (
            <span className="text-amber-400 ml-2">· Set start date in Settings</span>
          )}
        </p>
      </div>

      {/* Day Tabs — journey-style horizontal scroll */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
          ref={tabsRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Array.from({ length: 100 }).map((_, idx) => {
            const day = idx + 1;
            const isSelected = selectedDay === day;
            const isPastOrToday = day <= programDay;
            const hasInsight = !!allInsights[day];

            const baseDate = programStartDate ? new Date(programStartDate) : new Date();
            const tabDate = new Date(baseDate);
            tabDate.setDate(tabDate.getDate() + (day - 1));
            const dateLabel = tabDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <button
                key={day}
                data-day={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "px-3.5 py-1.5 rounded-2xl text-xs font-body transition-all shrink-0 flex flex-col items-center border min-w-[64px] relative",
                  isSelected
                    ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                    : isPastOrToday
                    ? "bg-[#18181b] text-[var(--text-primary)] border-[#27272a] hover:border-[#FF6B00]/50"
                    : "bg-[#09090b] text-[var(--text-muted)] border-[#27272a]/40 opacity-50"
                )}
              >
                <span className="font-bold">Day {day}</span>
                <span className="text-[9px] opacity-75">{dateLabel}</span>
                {/* Green dot for days with a generated insight */}
                {hasInsight && !isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#09090b]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day label */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-black text-white text-2xl uppercase">Day {selectedDay}</h2>
          {programStartDate && (
            <p className="font-body text-xs text-white/30 mt-0.5">
              {new Date(getDateForDay(programStartDate, selectedDay)).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </p>
          )}
        </div>
        {allInsights[selectedDay] && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-display text-[10px] font-black uppercase tracking-widest">
            <CheckCircle size={12} weight="fill" /> Generated
          </span>
        )}
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-body text-xs flex items-start gap-2"
          >
            <Warning size={14} weight="bold" className="shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {generating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center">
                <Robot size={28} weight="duotone" className="text-[#FF6B00] animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B00] animate-ping opacity-60" />
            </div>
            <div className="text-center">
              <p className="font-display font-black text-white/80 text-sm uppercase tracking-widest">Analyzing Day {selectedDay}</p>
              <p className="font-body text-xs text-white/30 mt-1">Coach AI is reviewing your data…</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#FF6B00]/60"
                  style={{ animation: `bounce 1.2s ease infinite ${i * 0.2}s` }}
                />
              ))}
            </div>
          </motion.div>
        ) : currentInsight ? (
          <motion.div key={`insight-${selectedDay}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InsightDisplay insight={currentInsight} dayNumber={selectedDay} />
          </motion.div>
        ) : (
          <motion.div key={`empty-${selectedDay}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyDay dayNumber={selectedDay} isPast={selectedDay <= programDay} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom Generate CTA */}
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 max-w-2xl mx-auto">
        <div className="bg-[#09090b]/90 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-3 shadow-2xl">
          <button
            onClick={handleGenerate}
            disabled={generating || selectedDay > programDay}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-display font-black text-sm uppercase tracking-widest transition-all duration-200",
              selectedDay > programDay
                ? "bg-zinc-800/60 text-zinc-600 border border-zinc-700/40 cursor-not-allowed"
                : generating
                ? "bg-[#FF6B00]/60 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-[#FF6B00] to-[#FFAA00] text-white shadow-lg shadow-[#FF6B00]/30 hover:shadow-[#FF6B00]/50 hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : selectedDay > programDay ? (
              <>
                <CalendarBlank size={18} weight="bold" />
                Day {selectedDay} hasn&apos;t started yet
              </>
            ) : (
              <>
                <Sparkle size={18} weight="fill" />
                {currentInsight ? "Regenerate" : "Generate"} Day {selectedDay} Summary
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
