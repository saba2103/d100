"use client";

import React, { useState } from "react";
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

interface Props {
  userId: string;
  today: string;
  stepsGoal: number;
  initialSteps: number;
  historyDates: string[];
  historyStats: Record<string, { stat_date: string; steps: number; steps_goal: number }>;
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

  const color = goalMet ? "#F59E0B" : "var(--green)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span
          className="font-display text-5xl font-black leading-none"
          style={{ color: goalMet ? "#F59E0B" : "var(--text-primary)" }}
        >
          <CountUp value={steps} formatter={(val) => Math.round(val).toLocaleString()} />
        </span>
        <span className="font-body text-xs text-[var(--text-muted)] mt-1">steps</span>
        {goalMet ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-2 text-sm font-body-bold" style={{ color: "#F59E0B" }}>
            🎯 Goal Met!
          </motion.span>
        ) : (
          <span className="mt-1.5 font-body text-[10px] text-[var(--text-muted)]">
            {Math.round(pct)}% of goal
          </span>
        )}
      </div>
    </div>
  );
}

export function StepsTrackerClient({
  userId, today, stepsGoal, initialSteps, historyDates, historyStats,
}: Props) {
  const router = useRouter();
  const { activeProfile } = useAppUser();
  const [steps, setSteps] = useState(initialSteps);
  const [input, setInput] = useState(initialSteps > 0 ? String(initialSteps) : "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(input, 10);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("daily_stats").upsert(
      { user_id: userId, stat_date: today, steps: val, steps_goal: stepsGoal, profile_tag: activeProfile },
      { onConflict: "user_id,stat_date,profile_tag" }
    );
    await triggerBadgeCheck();
    setSteps(val);
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
    const [y, m, d] = today.split("-").map(Number);
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
