"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Scales,
  Sparkle,
  Info,
  Calendar,
  Flame,
  Plus,
  Minus,
  Warning,
  ListChecks,
  CheckCircle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CalculatorClientProps {
  initialWeight: number | null;
}

export function CalculatorClient({ initialWeight }: CalculatorClientProps) {
  const router = useRouter();
  const [weightInput, setWeightInput] = useState<string>(
    initialWeight ? String(Math.round(initialWeight)) : "80"
  );

  const weight = parseFloat(weightInput) || 80;

  // 1. Maintenance Calories (Weight * 29)
  const maintenance = Math.round(weight * 29);

  // 2. Fat Loss Target (Maintenance - 500)
  const dailyCalorieTarget = Math.round(maintenance - 500);

  // 3. Protein (Weight * 2)
  const proteinG = Math.round(weight * 2);
  const proteinCal = proteinG * 4;

  // 4. Fat (Weight * 0.9)
  const fatG = Math.round(weight * 0.9 * 10) / 10;
  const fatCal = Math.round(fatG * 9);

  // 5. Carbs (Remaining / 4)
  const carbsCal = Math.max(0, dailyCalorieTarget - proteinCal - fatCal);
  const carbsG = Math.round((carbsCal / 4) * 10) / 10;

  // Percentages for visualization
  const totalCalCalculated = proteinCal + fatCal + carbsCal;
  const proteinPct = totalCalCalculated > 0 ? Math.round((proteinCal / totalCalCalculated) * 100) : 0;
  const fatPct = totalCalCalculated > 0 ? Math.round((fatCal / totalCalCalculated) * 100) : 0;
  const carbsPct = totalCalCalculated > 0 ? 100 - proteinPct - fatPct : 0;

  const handleIncrement = () => {
    setWeightInput((prev) => String(Math.min(250, (parseFloat(prev) || 80) + 1)));
  };

  const handleDecrement = () => {
    setWeightInput((prev) => String(Math.max(30, (parseFloat(prev) || 80) - 1)));
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide uppercase">
          Calculator
        </h1>
        <p className="font-body text-xs text-[var(--text-muted)] mt-1">
          Calculate your personalized calorie and macro targets for Phase 2
        </p>
      </div>

      {/* Input Section */}
      <Card variant="surface" className="p-5 border-[#27272a] bg-gradient-to-br from-[#18181b] to-[rgba(249,115,22,0.01)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent-start)]/10 text-[var(--accent-text)]">
            <Scales size={24} weight="fill" />
          </div>
          <div>
            <h2 className="font-display text-base font-black text-[var(--text-primary)] uppercase tracking-wide">
              Your Current Weight
            </h2>
            <p className="font-body text-[10px] text-[var(--text-muted)]">
              Used to calculate custom target metrics
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 p-2 bg-[#09090b] rounded-2xl border border-[#27272a] max-w-md mx-auto">
          <button
            onClick={handleDecrement}
            className="w-10 h-10 rounded-xl bg-[#18181b] text-[var(--text-secondary)] flex items-center justify-center hover:text-[var(--text-primary)] transition-colors border border-[#27272a]"
            type="button"
          >
            <Minus size={16} weight="bold" />
          </button>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-20 bg-transparent text-center font-display text-3xl font-black text-[var(--text-primary)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="80"
              min="30"
              max="250"
            />
            <span className="font-display text-base font-bold text-[var(--text-muted)]">kg</span>
          </div>

          <button
            onClick={handleIncrement}
            className="w-10 h-10 rounded-xl bg-[#18181b] text-[var(--text-secondary)] flex items-center justify-center hover:text-[var(--text-primary)] transition-colors border border-[#27272a]"
            type="button"
          >
            <Plus size={16} weight="bold" />
          </button>
        </div>

        {initialWeight && (
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--green)]/10 text-[var(--green)] font-body text-[9px] font-body-bold">
              ✔ Auto-filled from your profile stats
            </span>
          </div>
        )}
      </Card>

      {/* Target Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Step 1: Maintenance */}
        <Card variant="surface" className="p-4 border-[#27272a] bg-[#18181b] flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">Step 1 — Baseline</span>
            <h3 className="font-display text-sm font-black text-[var(--text-secondary)] uppercase mt-0.5">Maintenance Calories</h3>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-3xl font-black text-[var(--text-primary)]">{maintenance.toLocaleString()}</span>
            <span className="text-xs text-[var(--text-muted)] font-body">kcal / day</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-body mt-2 border-t border-[#27272a]/60 pt-2">
            Formula: {weight} kg × 29 kcal
          </p>
        </Card>

        {/* Step 2: Calorie Target */}
        <Card variant="surface" className="p-4 border-[#27272a] bg-gradient-to-br from-[#18181b] to-[rgba(249,115,22,0.02)] flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-body-bold text-[var(--accent-text)] uppercase tracking-wider">Step 2 — Deficit</span>
            <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase mt-0.5">Fat Loss Target</h3>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-3xl font-black text-[var(--accent-text)]">{dailyCalorieTarget.toLocaleString()}</span>
            <span className="text-xs text-[var(--accent-text)] font-body">kcal / day</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-body mt-2 border-t border-[#27272a]/60 pt-2">
            Formula: {maintenance} kcal − 500 kcal
          </p>
        </Card>
      </div>

      {/* Step 3: Macronutrient Allocations */}
      <Card variant="surface" className="p-5 border-[#27272a] bg-[#18181b] space-y-5">
        <div>
          <span className="text-[9px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">Step 3 — Macro Split</span>
          <h2 className="font-display text-base font-black text-[var(--text-primary)] uppercase mt-0.5">Macronutrient Targets</h2>
        </div>

        {/* Macro Bars Graph */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-[#09090b] overflow-hidden flex">
            <motion.div
              style={{ width: `${proteinPct}%` }}
              className="h-full bg-[var(--blue)]"
              animate={{ width: `${proteinPct}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              style={{ width: `${fatPct}%` }}
              className="h-full bg-[var(--purple)]"
              animate={{ width: `${fatPct}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              style={{ width: `${carbsPct}%` }}
              className="h-full bg-[var(--amber)]"
              animate={{ width: `${carbsPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between text-[9px] font-body text-[var(--text-muted)] px-1">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--blue)]" /> Protein ({proteinPct}%)</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--purple)]" /> Fat ({fatPct}%)</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" /> Carbs ({carbsPct}%)</span>
          </div>
        </div>

        {/* Macros Detail List */}
        <div className="space-y-3">
          {/* Protein Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#09090b] border border-[#27272a]/60">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--blue)] shrink-0" />
              <div>
                <h4 className="font-display text-xs font-black text-[var(--text-primary)] uppercase tracking-wide">Protein Target</h4>
                <p className="text-[9px] text-[var(--text-muted)] font-body mt-0.5">Formula: {weight} kg × 2g</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-lg font-black text-[var(--blue)]">{proteinG}g</span>
              <p className="text-[8px] text-[var(--text-muted)] font-body uppercase mt-0.5">{proteinCal} kcal</p>
            </div>
          </div>

          {/* Fat Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#09090b] border border-[#27272a]/60">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--purple)] shrink-0" />
              <div>
                <h4 className="font-display text-xs font-black text-[var(--text-primary)] uppercase tracking-wide">Fat Target</h4>
                <p className="text-[9px] text-[var(--text-muted)] font-body mt-0.5">Formula: {weight} kg × 0.9g</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-lg font-black text-[var(--purple)]">{fatG}g</span>
              <p className="text-[8px] text-[var(--text-muted)] font-body uppercase mt-0.5">{fatCal} kcal</p>
            </div>
          </div>

          {/* Carbs Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#09090b] border border-[#27272a]/60">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--amber)] shrink-0" />
              <div>
                <h4 className="font-display text-xs font-black text-[var(--text-primary)] uppercase tracking-wide">Carbohydrates Target</h4>
                <p className="text-[9px] text-[var(--text-muted)] font-body mt-0.5">Remaining deficit calories</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-lg font-black text-[var(--amber)]">{carbsG}g</span>
              <p className="text-[8px] text-[var(--text-muted)] font-body uppercase mt-0.5">{carbsCal} kcal</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Dynamic Adjustment Tips */}
      <Card variant="surface" className="p-4 border-[#27272a] bg-[#18181b] space-y-3">
        <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
          <div className="p-1.5 rounded-lg bg-[var(--accent-start)]/10 text-[var(--accent-text)]">
            <Info size={16} />
          </div>
          <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
            How to use this with your meal plan
          </h4>
        </div>

        <div className="space-y-2 font-body text-xs text-[var(--text-secondary)] leading-relaxed">
          <p>
            The sample meal plans in the course guides are designed for an <strong>80kg man</strong> (~1,820 kcal, 160g protein).
          </p>
          <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]/60 font-body text-xs text-[var(--text-primary)]">
            {dailyCalorieTarget < 1820 ? (
              <p className="flex items-start gap-1.5 text-[var(--amber)]">
                <Warning size={16} className="shrink-0 mt-0.5" />
                <span>Since your fat loss calorie target is <strong>lower than 1,820 kcal</strong>, you should reduce carbohydrate portions (less rice or roti) from the sample plans.</span>
              </p>
            ) : dailyCalorieTarget > 1820 ? (
              <p className="flex items-start gap-1.5 text-[var(--green)]">
                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                <span>Since your fat loss calorie target is <strong>higher than 1,820 kcal</strong>, you can increase carbohydrate portions (more rice or roti) from the sample plans.</span>
              </p>
            ) : (
              <p className="flex items-start gap-1.5 text-[var(--green)]">
                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                <span>Your calorie target perfectly matches the baseline sample plans. Follow them as is.</span>
              </p>
            )}
          </div>
          <p className="flex items-start gap-1.5 text-[var(--text-muted)] text-[10px]">
            <Sparkle size={14} className="text-[var(--accent-start)] shrink-0 mt-0.5" />
            <span>NEVER reduce your protein target. Protein is vital for retaining muscle and satiety during a deficit.</span>
          </p>
        </div>
      </Card>

    </div>
  );
}
