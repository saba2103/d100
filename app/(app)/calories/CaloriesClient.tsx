"use client";

import React, { useState } from "react";
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

interface Props {
  userId: string;
  today: string;
  caloriesGoal: number;
  consumed: number;
  initialBurned: number;
  bmrKcal: number | null;
}

export function CaloriesTrackerClient({
  userId, today, caloriesGoal, consumed, initialBurned, bmrKcal,
}: Props) {
  const router = useRouter();
  const { activeProfile } = useAppUser();
  const [burned, setBurned] = useState(initialBurned);
  const [burnedInput, setBurnedInput] = useState(initialBurned > 0 ? String(initialBurned) : "");
  const [saving, setSaving] = useState(false);

  // Derived values
  const net = consumed - burned;
  const deficit = caloriesGoal - net;
  const isDeficit = net <= caloriesGoal;
  const netPct = Math.min(Math.abs(net / caloriesGoal) * 100, 100);

  const totalBurnedEstimate = (bmrKcal ?? 1600) + burned;

  const handleSaveBurned = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(burnedInput, 10) || 0;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("daily_stats").upsert(
      { user_id: userId, stat_date: today, calories_burned: val, calories_goal: caloriesGoal, profile_tag: activeProfile },
      { onConflict: "user_id,stat_date,profile_tag" }
    );
    await triggerBadgeCheck();
    setBurned(val);
    setSaving(false);
  };

  const formattedDate = (() => {
    const [y, m, d] = today.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  })();

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
              <CountUp value={consumed} formatter={(val) => Math.round(val).toLocaleString()} />
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
          <Button type="submit" size="sm" variant="primary" disabled={saving}>
            {saving ? "…" : "Save"}
          </Button>
        </form>
      </Card>

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
