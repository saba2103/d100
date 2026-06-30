"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppUser } from "@/lib/contexts/AppContext";
import { triggerBadgeCheck } from "@/lib/utils/achievementsClient";
import { Gear, ArrowRight, Lightning, ForkKnife, Fire } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { CountUp } from "@/components/ui/CountUp";
import { TimelineCalendar } from "@/components/ui/TimelineCalendar";

interface Props {
  userId: string;
  today: string;
  programStartDate: string | null;
  caloriesGoal: number;
  consumed: number;
  initialBurned: number;
  bmrKcal: number | null;
  isReadOnly?: boolean;
}

export function CaloriesTrackerClient({
  userId, today, programStartDate, caloriesGoal, consumed, initialBurned, bmrKcal, isReadOnly = false,
}: Props) {
  const router = useRouter();
  const { activeProfile } = useAppUser();
  const [selectedDate, setSelectedDate] = useState(today);
  const [consumedState, setConsumedState] = useState(consumed);
  const [burned, setBurned] = useState(initialBurned);
  const [burnedInput, setBurnedInput] = useState(initialBurned > 0 ? String(initialBurned) : "");
  const [saving, setSaving] = useState(false);
  const [historyData, setHistoryData] = useState<Record<string, { consumed: number; burned: number }>>({});

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!activeProfile) return;
      const supabase = createClient();
      const [statsRes, nutritionRes] = await Promise.all([
        supabase.from("daily_stats")
          .select("stat_date, calories_consumed, calories_burned")
          .eq("user_id", userId)
          .eq("profile_tag", activeProfile),
        supabase.from("nutrition_logs")
          .select("logged_at, items")
          .eq("user_id", userId)
          .eq("profile_tag", activeProfile)
      ]);

      const cache: Record<string, { consumed: number; burned: number }> = {};
      
      // Initialize default today values
      cache[today] = { consumed, burned: initialBurned };

      if (statsRes.data) {
        statsRes.data.forEach((row) => {
          if (!cache[row.stat_date]) cache[row.stat_date] = { consumed: 0, burned: 0 };
          cache[row.stat_date].burned = row.calories_burned ?? 0;
        });
      }

      if (nutritionRes.data) {
        nutritionRes.data.forEach((row) => {
          const items = (row.items as any[]) || [];
          const logCal = items.reduce((s, i) => s + (Number(i.calories) || 0), 0);
          if (!cache[row.logged_at]) cache[row.logged_at] = { consumed: 0, burned: 0 };
          cache[row.logged_at].consumed += logCal;
        });
      }

      setHistoryData(cache);
    };
    fetchHistory();
  }, [userId, activeProfile, today, consumed, initialBurned]);

  // Update displayed values when selected date or history cache changes
  useEffect(() => {
    const dayData = historyData[selectedDate] || { consumed: 0, burned: 0 };
    setConsumedState(dayData.consumed);
    setBurned(dayData.burned);
    setBurnedInput(dayData.burned > 0 ? String(dayData.burned) : "");
  }, [selectedDate, historyData]);

  // Derived values
  const net = consumedState - burned;
  const deficit = caloriesGoal - net;
  const isDeficit = net <= caloriesGoal;
  const netPct = Math.min(Math.abs(net / caloriesGoal) * 100, 100);

  const totalBurnedEstimate = (bmrKcal ?? 1600) + burned;

  const handleSaveBurned = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const val = parseInt(burnedInput, 10) || 0;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("daily_stats").upsert(
      { user_id: userId, stat_date: selectedDate, calories_burned: val, calories_goal: caloriesGoal, profile_tag: activeProfile },
      { onConflict: "user_id,stat_date,profile_tag" }
    );
    await triggerBadgeCheck();
    setBurned(val);
    
    // Update local cache
    setHistoryData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || { consumed: 0 }),
        burned: val
      }
    }));
    setSaving(false);
  };

  const formattedDate = (() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  })();

  const hasDataOnDate = (dateStr: string) => {
    const dayData = historyData[dateStr];
    return !!dayData && (dayData.consumed > 0 || dayData.burned > 0);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black">CALORIES</h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">{formattedDate}</p>
        </div>
        <button onClick={() => router.push("/settings")}
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <Gear size={18} />
        </button>
      </div>

      {/* Timeline Calendar */}
      <TimelineCalendar
        selectedDate={selectedDate}
        today={today}
        programStartDate={programStartDate}
        onSelectDate={setSelectedDate}
        hasDataOnDate={hasDataOnDate}
      />

      {/* ── Main split display ── */}
      <Card variant="surface" className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-0 divide-x divide-[var(--border)]">
          {/* Consumed — left */}
          <div className="flex flex-col items-center pr-4 gap-1">
            <div className="flex items-center gap-1.5 mb-1">
              <ForkKnife size={14} className="text-[var(--amber)]" />
              <span className="font-body text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Consumed
              </span>
            </div>
            <span
              className="font-display text-4xl font-black leading-none"
              style={{ color: "var(--amber)" }}
            >
              <CountUp value={consumedState} formatter={(val) => Math.round(val).toLocaleString()} />
            </span>
            <span className="font-body text-[10px] text-[var(--text-muted)]">kcal</span>
            <span className="mt-1 text-[10px] font-body text-[var(--text-muted)] italic">
              from Nutrition log
            </span>
          </div>

          {/* Burned — right */}
          <div className="flex flex-col items-center pl-4 gap-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Fire size={14} className="text-[var(--red)]" />
              <span className="font-body text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Burned
              </span>
            </div>
            <span
              className="font-display text-4xl font-black leading-none"
              style={{ color: "var(--red)" }}
            >
              <CountUp value={burned} formatter={(val) => Math.round(val).toLocaleString()} />
            </span>
            <span className="font-body text-[10px] text-[var(--text-muted)]">kcal</span>
            <span className="mt-1 text-[10px] font-body text-[var(--text-muted)] italic">
              activity + exercise
            </span>
          </div>
        </div>

        {/* Net calories — center hero */}
        <div className="flex flex-col items-center py-3 border-t border-[var(--border)]">
          <span className="font-body text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
            Net Calories
          </span>
          <span
            className="font-display text-5xl sm:text-6xl font-black leading-none text-[var(--text-primary)]"
          >
            <CountUp value={net} formatter={(val) => Math.round(val).toLocaleString()} />
          </span>
          <span className={cn(
            "mt-2 px-3 py-0.5 rounded-full text-xs font-body-bold",
            isDeficit
              ? "bg-[var(--green-soft)] text-[var(--green)]"
              : "bg-[var(--amber-soft)] text-[var(--amber)]"
          )}>
            {isDeficit
              ? `${Math.abs(deficit).toLocaleString()} kcal Deficit`
              : `${Math.abs(deficit).toLocaleString()} kcal Surplus`}
          </span>
        </div>

        {/* Goal progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-body text-[var(--text-muted)]">
            <span>Net vs Goal ({caloriesGoal.toLocaleString()} kcal)</span>
            <span>{Math.round((net / caloriesGoal) * 100)}%</span>
          </div>
          <div className="h-2.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${netPct}%` }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: isDeficit
                  ? "linear-gradient(90deg, var(--green), #34d399)"
                  : "linear-gradient(90deg, var(--amber), #fbbf24)",
              }}
            />
          </div>
        </div>
      </Card>

      {/* Manual burned input */}
      {!isReadOnly && (
        <Card variant="surface" className="p-4">
          <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Log Activity Calories Burned
          </p>
          <form onSubmit={handleSaveBurned} className="flex gap-2">
            <input
              type="number" inputMode="numeric" placeholder="e.g. 400"
              value={burnedInput}
              onChange={(e) => setBurnedInput(e.target.value)}
              className="flex-1 font-body text-sm px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--red)] transition-colors"
            />
            <Button type="submit" size="sm" variant="primary" loading={saving} disabled={saving}>
              Save
            </Button>
          </form>
        </Card>
      )}

      {/* Breakdown card */}
      <Card variant="surface" className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lightning size={16} className="text-[var(--accent-text)]" />
          <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Energy Breakdown
          </p>
        </div>
        <div className="space-y-2">
          {[
            { label: "Basal Metabolic Rate (BMR)", value: bmrKcal ?? "—", unit: bmrKcal ? "kcal" : "" },
            { label: "Activity & Exercise", value: burned.toLocaleString(), unit: "kcal" },
            { label: "Total Estimated Burn", value: totalBurnedEstimate.toLocaleString(), unit: "kcal", bold: true },
          ].map(({ label, value, unit, bold }) => (
            <div key={label} className="flex justify-between items-center text-xs font-body py-1 border-b border-[var(--border)]/40 last:border-0">
              <span className={cn("text-[var(--text-secondary)]", bold && "font-body-bold text-[var(--text-primary)]")}>
                {label}
              </span>
              <span className={cn("font-body-bold text-[var(--text-primary)]", bold && "text-[var(--accent-text)]")}>
                {value}{unit ? ` ${unit}` : ""}
              </span>
            </div>
          ))}
        </div>
        {!bmrKcal && (
          <button onClick={() => router.push("/body-stats")}
            className="flex items-center gap-1 text-[10px] text-[var(--accent-text)] hover:underline font-body mt-1">
            Log body stats to unlock BMR estimate <ArrowRight size={10} />
          </button>
        )}
      </Card>

      {/* Link to nutrition */}
      <button onClick={() => router.push("/nutrition")}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] text-xs font-body text-[var(--text-muted)] hover:border-[var(--accent-start)]/50 transition-colors">
        <span>Consumed calories auto-synced from <strong className="text-[var(--accent-text)]">Nutrition</strong></span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
