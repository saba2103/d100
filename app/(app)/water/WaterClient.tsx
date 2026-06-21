"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppUser } from "@/lib/contexts/AppContext";
import { triggerBadgeCheck } from "@/lib/utils/achievementsClient";
import { Gear, Drop } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const QUICK_AMOUNTS = [250, 500, 750, 1000];

interface Props {
  userId: string;
  today: string;
  waterGoal: number;
  initialWaterMl: number;
  initialStatsId: string | null;
  historyDates: string[];
  historyStats: Record<string, { stat_date: string; water_ml: number; water_goal_ml: number }>;
}

// ── Bottle SVG fill visual ──────────────────────────────────────────────
function WaterBottle({ pct }: { pct: number }) {
  const clampedPct = Math.min(pct, 100);
  const fillY = 100 - clampedPct; // SVG % from top

  return (
    <svg viewBox="0 0 100 220" className="w-28 md:w-36 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60B8FF" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
        <clipPath id="bottleClip">
          {/* Bottle shape path */}
          <path d="M30 20 Q30 5 50 5 Q70 5 70 20 L78 45 Q88 55 88 70 L88 190 Q88 210 50 210 Q12 210 12 190 L12 70 Q12 55 22 45 Z" />
        </clipPath>
      </defs>

      {/* Bottle outline */}
      <path
        d="M30 20 Q30 5 50 5 Q70 5 70 20 L78 45 Q88 55 88 70 L88 190 Q88 210 50 210 Q12 210 12 190 L12 70 Q12 55 22 45 Z"
        fill="var(--bg-base)" stroke="var(--border)" strokeWidth="2"
      />

      {/* Water fill — clips to bottle shape, animated height */}
      <motion.rect
        x="0" width="100"
        initial={{ y: 210, height: 0 }}
        animate={{ y: fillY * 2.1, height: clampedPct * 2.1 }}
        transition={{ type: "spring", duration: 1.0, bounce: 0.15 }}
        fill="url(#waterGrad)" opacity="0.85"
        clipPath="url(#bottleClip)"
      />

      {/* Ripple wave overlay */}
      <motion.path
        d={`M12 ${fillY * 2.1 + 2} Q31 ${fillY * 2.1 - 4} 50 ${fillY * 2.1 + 2} Q69 ${fillY * 2.1 + 8} 88 ${fillY * 2.1 + 2}`}
        fill="none" stroke="#60B8FF" strokeWidth="2" opacity="0.5"
        clipPath="url(#bottleClip)"
        animate={{ d: [
          `M12 ${fillY * 2.1 + 2} Q31 ${fillY * 2.1 - 4} 50 ${fillY * 2.1 + 2} Q69 ${fillY * 2.1 + 8} 88 ${fillY * 2.1 + 2}`,
          `M12 ${fillY * 2.1 + 4} Q31 ${fillY * 2.1 + 8} 50 ${fillY * 2.1 + 2} Q69 ${fillY * 2.1 - 2} 88 ${fillY * 2.1 + 4}`,
          `M12 ${fillY * 2.1 + 2} Q31 ${fillY * 2.1 - 4} 50 ${fillY * 2.1 + 2} Q69 ${fillY * 2.1 + 8} 88 ${fillY * 2.1 + 2}`,
        ]}}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Shine */}
      <rect x="20" y="70" width="8" height="80" rx="4" fill="white" opacity="0.12" clipPath="url(#bottleClip)" />
    </svg>
  );
}

export function WaterTrackerClient({
  userId, today, waterGoal, initialWaterMl, historyDates, historyStats,
}: Props) {
  const router = useRouter();
  const { activeProfile } = useAppUser();
  const [waterMl, setWaterMl] = useState(initialWaterMl);
  const [customAmt, setCustomAmt] = useState("");
  const [saving, setSaving] = useState(false);

  const pct = Math.min((waterMl / waterGoal) * 100, 100);
  const remaining = Math.max(waterGoal - waterMl, 0);
  const goalMet = waterMl >= waterGoal;

  // Save to DB (upsert daily_stats)
  const saveWater = async (newMl: number) => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("daily_stats").upsert(
      { user_id: userId, stat_date: today, water_ml: newMl, water_goal_ml: waterGoal, profile_tag: activeProfile },
      { onConflict: "user_id,stat_date,profile_tag" }
    );
    await triggerBadgeCheck();
    setSaving(false);
  };

  const handleQuickAdd = async (amt: number) => {
    const newMl = waterMl + amt;
    setWaterMl(newMl);
    await saveWater(newMl);
  };

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(customAmt, 10);
    if (!amt || amt <= 0) return;
    const newMl = waterMl + amt;
    setWaterMl(newMl);
    setCustomAmt("");
    await saveWater(newMl);
  };

  // Pull-to-refresh
  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) setTouchStart(e.touches[0].clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    if (e.touches[0].clientY - touchStart > 100) {
      setTouchStart(0);
      router.refresh();
    }
  };

  // Build chart data
  const chartData = historyDates.map((d) => {
    const stat = historyStats[d];
    const label = new Date(d).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
    return {
      day: label,
      water: stat?.water_ml ?? (d === today ? waterMl : 0),
      goal: stat?.water_goal_ml ?? waterGoal,
    };
  });

  const formattedDate = new Date(today).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div
      className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black">WATER</h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">{formattedDate}</p>
        </div>
        <button onClick={() => router.push("/settings")}
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <Gear size={18} />
        </button>
      </div>

      {/* Main visual card */}
      <Card variant="surface" className="p-6">
        <div className="flex flex-col items-center gap-6">
          {/* Bottle + text */}
          <div className="relative flex flex-col items-center">
            <WaterBottle pct={pct} />

            {/* Overlay text */}
            <div className="mt-4 text-center">
              <motion.p
                key={waterMl}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display text-5xl font-black text-[var(--text-primary)]"
              >
                {waterMl.toLocaleString()}
                <span className="font-body text-base text-[var(--text-muted)] ml-1">ml</span>
              </motion.p>
              <p className="font-body text-xs text-[var(--text-muted)] mt-1">
                of {waterGoal.toLocaleString()} ml
              </p>

              <AnimatePresence>
                {goalMet ? (
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm font-body-bold text-[var(--green)]">
                    🎯 Daily goal reached!
                  </motion.p>
                ) : (
                  <p className="mt-1 text-xs text-[var(--text-muted)] font-body">
                    {remaining.toLocaleString()} ml remaining
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-[10px] font-body text-[var(--text-muted)]">
              <span>Hydration</span><span>{Math.round(pct)}%</span>
            </div>
            <div className="h-2.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #60B8FF, #2196F3)" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick add buttons */}
      <Card variant="surface" className="p-4">
        <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Quick Add
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button key={amt} onClick={() => handleQuickAdd(amt)} disabled={saving}
              className="py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-xs font-body font-body-bold text-[var(--text-primary)] hover:border-[#60B8FF]/60 hover:bg-[rgba(33,150,243,0.06)] transition-all active:scale-95">
              +{amt}ml
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <form onSubmit={handleCustomAdd} className="mt-3 flex gap-2">
          <input
            type="number" inputMode="numeric" placeholder="Custom ml"
            value={customAmt}
            onChange={(e) => setCustomAmt(e.target.value)}
            className="flex-1 font-body text-sm px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none focus:border-[#60B8FF] transition-colors"
          />
          <Button type="submit" size="sm" variant="primary" disabled={saving || !customAmt}>
            Add
          </Button>
        </form>
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
            <YAxis hide domain={[0, waterGoal * 1.2]} />
            <ReferenceLine y={waterGoal} stroke="var(--border)" strokeDasharray="4 3" />
            <Bar dataKey="water" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx}
                  fill={entry.water >= entry.goal ? "#2196F3" : "rgba(33,150,243,0.35)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
