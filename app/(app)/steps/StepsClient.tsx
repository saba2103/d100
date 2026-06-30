"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppUser } from "@/lib/contexts/AppContext";
import { triggerBadgeCheck } from "@/lib/utils/achievementsClient";
import { Gear } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { CountUp } from "@/components/ui/CountUp";
import { TimelineCalendar } from "@/components/ui/TimelineCalendar";

interface Props {
  userId: string;
  today: string;
  programStartDate: string | null;
  stepsGoal: number;
  initialSteps: number;
  historyDates: string[];
  historyStats: Record<string, { stat_date: string; steps: number; steps_goal: number }>;
  isReadOnly?: boolean;
}

// ── Circular Ring ─────────────────────────────────────────────────────
function StepsRing({ steps, goal }: { steps: number; goal: number }) {
  const pct = Math.min((steps / goal) * 100, 100);
  const goalMet = steps >= goal;
  const size = 220;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className="stroke-[var(--border)] fill-transparent"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          className={cn(
            "fill-transparent transition-all duration-500",
            goalMet ? "stroke-[var(--green)]" : "stroke-[var(--accent-start)]"
          )}
          strokeWidth={stroke}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-display text-4xl font-black text-[var(--text-primary)]">
          <CountUp value={steps} formatter={(val) => Math.round(val).toLocaleString()} />
        </p>
        <p className="text-[10px] text-[var(--text-muted)] font-body uppercase tracking-wider mt-1">
          Steps today
        </p>
      </div>
    </div>
  );
}

export function StepsTrackerClient({
  userId, today, programStartDate, stepsGoal, initialSteps, historyDates, historyStats, isReadOnly = false,
}: Props) {
  const router = useRouter();
  const { activeProfile } = useAppUser();
  const [selectedDate, setSelectedDate] = useState(today);
  const [historyStepsData, setHistoryStepsData] = useState<Record<string, number>>({});
  const [steps, setSteps] = useState(initialSteps);
  const [input, setInput] = useState(initialSteps > 0 ? String(initialSteps) : "");
  const [saving, setSaving] = useState(false);

  // Fetch all step history on mount
  useEffect(() => {
    const fetch = async () => {
      if (!activeProfile) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("daily_stats")
        .select("stat_date,steps")
        .eq("user_id", userId)
        .eq("profile_tag", activeProfile);
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((r) => { map[r.stat_date] = r.steps ?? 0; });
        map[today] = map[today] ?? initialSteps;
        setHistoryStepsData(map);
      }
    };
    fetch();
  }, [userId, activeProfile, today, initialSteps]);

  // Sync steps/input when date changes
  useEffect(() => {
    const val = historyStepsData[selectedDate] ?? (selectedDate === today ? initialSteps : 0);
    setSteps(val);
    setInput(val > 0 ? String(val) : "");
  }, [selectedDate, historyStepsData, today, initialSteps]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setSaving(true);
    const val = Number(input) || 0;
    const supabase = createClient();
    await supabase.from("daily_stats").upsert(
      { user_id: userId, stat_date: selectedDate, steps: val, steps_goal: stepsGoal, profile_tag: activeProfile },
      { onConflict: "user_id,stat_date,profile_tag" }
    );
    await triggerBadgeCheck();
    setSteps(val);
    setHistoryStepsData((prev) => ({ ...prev, [selectedDate]: val }));
    setSaving(false);
  };

  // Pull-to-refresh
  const [touchStart, setTouchStart] = useState(0);

  const chartData = historyDates.map((d) => {
    const stat = historyStats[d];
    const [y, m, dayVal] = d.split("-").map(Number);
    return {
      day: new Date(y, m - 1, dayVal).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
      steps: stat?.steps ?? (d === today ? steps : 0),
      goal: stat?.steps_goal ?? stepsGoal,
    };
  });

  const formattedDate = (() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  })();

  return (
    <div
      className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5"
      onTouchStart={(e) => { if (window.scrollY === 0) setTouchStart(e.touches[0].clientY); }}
      onTouchMove={(e) => {
        if (e.touches[0].clientY - touchStart > 100) { setTouchStart(0); router.refresh(); }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black">STEPS</h1>
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
        hasDataOnDate={(d) => (historyStepsData[d] ?? 0) > 0}
      />

      {/* Ring card */}
      <Card variant="surface" className="p-6 flex flex-col items-center gap-4">
        <StepsRing steps={steps} goal={stepsGoal} />

        <div className="flex items-center gap-2 text-xs font-body text-[var(--text-muted)]">
          <span className="font-display text-base text-[var(--text-primary)] font-black">
            {steps.toLocaleString()}
          </span>
          <span>/</span>
          <span>{stepsGoal.toLocaleString()} steps goal</span>
        </div>
      </Card>

      {/* Manual entry */}
      {!isReadOnly && (
        <Card variant="surface" className="p-4">
          <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Update Steps
          </p>
          <form onSubmit={handleSave} className="flex gap-2">
            <input
              type="number" inputMode="numeric" placeholder="Enter today's steps"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 font-body text-sm px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green)] transition-colors"
            />
            <Button type="submit" size="sm" variant="primary" disabled={saving || !input}>
              {saving ? "…" : "Save"}
            </Button>
          </form>
          <p className="mt-2 text-[10px] text-[var(--text-muted)] font-body">
            This replaces your current step count for today.
          </p>
        </Card>
      )}

      {/* 7-day chart */}
      <Card variant="surface" className="p-4">
        <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4">
          7-Day History
        </p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={chartData} barSize={22} barGap={4}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "inherit" }}
              axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, stepsGoal * 1.2]} />
            <ReferenceLine y={stepsGoal} stroke="var(--border)" strokeDasharray="4 3" />
            <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx}
                  fill={entry.steps >= entry.goal ? "#F59E0B" : "rgba(16,185,129,0.5)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
