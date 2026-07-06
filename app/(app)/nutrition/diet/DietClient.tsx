"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkle,
  Info,
  CheckCircle,
  ForkKnife,
  Flame,
  Warning,
  ListChecks,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DietClientProps {
  userWeight: number | null;
}

interface MealItem {
  food: string;
  qty: string;
  protein: string;
  calories: string;
}

interface SampleOption {
  optionName: string;
  meals: {
    meal1: { name: string; items: MealItem[]; totalP: string; totalCal: string };
    snack: { name: string; items: MealItem[]; totalP: string; totalCal: string };
    meal2: { name: string; items: MealItem[]; totalP: string; totalCal: string };
  };
  dailyTotal: { calories: string; protein: string; fat: string; carbs: string };
}

interface DietData {
  type: string;
  label: string;
  emoji: string;
  targets: { calories: string; protein: string; fat: string; carbs: string };
  options: SampleOption[];
  tips: string[];
  arsenal?: { food: string; serving: string; protein: string }[];
  adjustmentRules: {
    under70: string;
    normal: string;
    to90: string;
    above90: string;
  };
}

const DIET_PLANS: Record<string, DietData> = {
  veg: {
    type: "veg",
    label: "Vegetarian",
    emoji: "🥗",
    targets: { calories: "~1,820", protein: "160g", fat: "72g", carbs: "133g" },
    options: [
      {
        optionName: "Option A (Day 1)",
        meals: {
          meal1: {
            name: "Meal 1 — Break-Fast (12:00 PM)",
            items: [
              { food: "Paneer Bhurji", qty: "200g paneer", protein: "36g", calories: "~400" },
              { food: "Chole / Rajma (thick)", qty: "1 big bowl", protein: "15g", calories: "~250" },
              { food: "Whole Wheat Roti", qty: "2 rotis", protein: "6g", calories: "~200" },
              { food: "Salad", qty: "1 bowl", protein: "1g", calories: "~30" },
            ],
            totalP: "~58g",
            totalCal: "~880",
          },
          snack: {
            name: "Snack (3:00 - 4:00 PM)",
            items: [
              { food: "Double Whey Protein Shake", qty: "2 scoops (water)", protein: "50g", calories: "~240" },
              { food: "Roasted Peanuts", qty: "30g", protein: "8g", calories: "~170" },
            ],
            totalP: "~58g",
            totalCal: "~410",
          },
          meal2: {
            name: "Meal 2 — Dinner (7:00 - 8:00 PM)",
            items: [
              { food: "Tofu / Soy Chunks Curry", qty: "150g tofu / 50g dry soy", protein: "25g", calories: "~200" },
              { food: "Moong Dal (thick)", qty: "1 big bowl", protein: "12g", calories: "~180" },
              { food: "Rice (cooked)", qty: "1 small cup", protein: "3g", calories: "~180" },
              { food: "Sabzi (any vegetable)", qty: "1 bowl", protein: "3g", calories: "~80" },
            ],
            totalP: "~43g",
            totalCal: "~640",
          },
        },
        dailyTotal: { calories: "~1,930", protein: "~159g", fat: "~78g", carbs: "~145g" },
      },
      {
        optionName: "Option B (Day 2)",
        meals: {
          meal1: {
            name: "Meal 1 — Break-Fast (12:00 PM)",
            items: [
              { food: "Soy Chunks Dry Sabzi", qty: "50g dry soy chunks", protein: "25g", calories: "~170" },
              { food: "Paneer Paratha", qty: "2 parathas (150g paneer)", protein: "30g", calories: "~450" },
              { food: "Curd / Raita", qty: "200g", protein: "8g", calories: "~100" },
            ],
            totalP: "~63g",
            totalCal: "~720",
          },
          snack: {
            name: "Snack (3:00 - 4:00 PM)",
            items: [
              { food: "Double Whey Protein Shake", qty: "2 scoops (water)", protein: "50g", calories: "~240" },
              { food: "Soy Milk", qty: "1 glass (200ml)", protein: "7g", calories: "~80" },
              { food: "Peanut Butter", qty: "1 tbsp", protein: "4g", calories: "~100" },
            ],
            totalP: "~61g",
            totalCal: "~420",
          },
          meal2: {
            name: "Meal 2 — Dinner (7:00 - 8:00 PM)",
            items: [
              { food: "Tofu Tikka / Grilled Tofu", qty: "200g tofu", protein: "20g", calories: "~200" },
              { food: "Dal Makhani (thick)", qty: "1 big bowl", protein: "12g", calories: "~200" },
              { food: "Rice (cooked)", qty: "1 small cup", protein: "3g", calories: "~180" },
              { food: "Buttermilk / Chaas", qty: "1 glass", protein: "3g", calories: "~40" },
            ],
            totalP: "~38g",
            totalCal: "~620",
          },
        },
        dailyTotal: { calories: "~1,760", protein: "~162g", fat: "~72g", carbs: "~130g" },
      },
    ],
    tips: [
      "Double scoop whey is NON-NEGOTIABLE for vegetarians — don't skip it.",
      "Combine dal + rice = complete protein (all amino acids).",
      "Soy chunks are the cheapest and highest protein veg source — use them daily.",
      "Add paneer to every meal if possible.",
      "Sprouts as side dish adds easy 7-8g protein.",
      "Soy milk instead of regular milk = more protein.",
    ],
    arsenal: [
      { food: "Paneer", serving: "100g", protein: "18g" },
      { food: "Tofu", serving: "100g", protein: "10g" },
      { food: "Soy Chunks (dry)", serving: "50g", protein: "25g" },
      { food: "Moong Dal (cooked)", serving: "1 bowl", protein: "8-10g" },
      { food: "Rajma / Chole (cooked)", serving: "1 bowl", protein: "12-15g" },
      { food: "Curd / Yogurt", serving: "200g", protein: "8g" },
      { food: "Greek Yogurt / Hung Curd", serving: "150g", protein: "10-12g" },
      { food: "Whey Protein", serving: "1 scoop", protein: "25g" },
      { food: "Peanuts / Peanut Butter", serving: "30g / 1 tbsp", protein: "8g / 4g" },
      { food: "Soy Milk", serving: "200ml", protein: "7g" },
      { food: "Cottage Cheese (Chenna)", serving: "100g", protein: "14g" },
      { food: "Sprouts (Moong)", serving: "1 bowl", protein: "7-8g" },
    ],
    adjustmentRules: {
      under70: "Remove 1 roti OR reduce rice, and reduce paneer to 100g.",
      normal: "Follow the plan as is.",
      to90: "Add 1 extra roti OR more rice.",
      above90: "Add 50g more paneer + 1 roti.",
    },
  },
  egg: {
    type: "egg",
    label: "Egg-etarian",
    emoji: "🍳",
    targets: { calories: "~1,820", protein: "160g", fat: "72g", carbs: "133g" },
    options: [
      {
        optionName: "Option A (Day 1)",
        meals: {
          meal1: {
            name: "Meal 1 — Break-Fast (12:00 PM)",
            items: [
              { food: "Egg Omelette", qty: "4 whole eggs + 2 whites", protein: "32g", calories: "~320" },
              { food: "Paneer Bhurji", qty: "150g paneer", protein: "27g", calories: "~300" },
              { food: "Whole Wheat Roti", qty: "2 rotis", protein: "6g", calories: "~200" },
              { food: "Salad", qty: "1 bowl", protein: "1g", calories: "~30" },
            ],
            totalP: "~66g",
            totalCal: "~850",
          },
          snack: {
            name: "Snack (3:00 - 4:00 PM)",
            items: [
              { food: "Whey Protein Shake (water)", qty: "1 scoop", protein: "25g", calories: "~120" },
              { food: "Boiled Eggs", qty: "2 eggs", protein: "14g", calories: "~160" },
              { food: "Curd / Yogurt", qty: "150g", protein: "6g", calories: "~80" },
            ],
            totalP: "~45g",
            totalCal: "~360",
          },
          meal2: {
            name: "Meal 2 — Dinner (7:00 - 8:00 PM)",
            items: [
              { food: "Egg Curry", qty: "4 eggs", protein: "28g", calories: "~350" },
              { food: "Paneer (in dal or sabzi)", qty: "100g paneer", protein: "18g", calories: "~200" },
              { food: "Rice (cooked)", qty: "1 small cup", protein: "3g", calories: "~180" },
            ],
            totalP: "~49g",
            totalCal: "~730",
          },
        },
        dailyTotal: { calories: "~1,940", protein: "~160g", fat: "~95g", carbs: "~120g" },
      },
      {
        optionName: "Option B (Day 2)",
        meals: {
          meal1: {
            name: "Meal 1 — Break-Fast (12:00 PM)",
            items: [
              { food: "Egg Bhurji (with veggies)", qty: "5 whole eggs", protein: "35g", calories: "~400" },
              { food: "Whole Wheat Roti", qty: "2 rotis", protein: "6g", calories: "~200" },
              { food: "Curd / Raita", qty: "200g", protein: "8g", calories: "~100" },
            ],
            totalP: "~49g",
            totalCal: "~700",
          },
          snack: {
            name: "Snack (3:00 - 4:00 PM)",
            items: [
              { food: "Double Whey Protein Shake", qty: "2 scoops (water)", protein: "50g", calories: "~240" },
              { food: "Almonds", qty: "10 pieces", protein: "3g", calories: "~70" },
            ],
            totalP: "~53g",
            totalCal: "~310",
          },
          meal2: {
            name: "Meal 2 — Dinner (7:00 - 8:00 PM)",
            items: [
              { food: "Paneer Tikka (grilled)", qty: "200g paneer", protein: "36g", calories: "~400" },
              { food: "Egg Fried Rice", qty: "1 cup rice + 3 eggs", protein: "24g", calories: "~350" },
              { food: "Green Chutney / Salad", qty: "1 serving", protein: "1g", calories: "~30" },
            ],
            totalP: "~61g",
            totalCal: "~780",
          },
        },
        dailyTotal: { calories: "~1,790", protein: "~163g", fat: "~82g", carbs: "~128g" },
      },
    ],
    tips: [
      "Egg whites are your best friend — add 2-3 extra whites to any omelette for +10g protein, minimal calories.",
      "Paneer is your #1 protein source — use it in every meal if possible.",
      "Double scoop whey shake on days you can't hit protein through food.",
      "Greek yogurt / hung curd has 2x the protein of regular curd.",
      "Cottage cheese (chenna) is another excellent paneer alternative.",
      "You can swap paneer ↔ cottage cheese ↔ tofu freely.",
    ],
    adjustmentRules: {
      under70: "Remove 1 roti OR reduce rice, and reduce paneer to 100g.",
      normal: "Follow the plan as is.",
      to90: "Add 1 extra roti OR more rice, and add 1 more egg.",
      above90: "Add 50g more paneer + 2 extra egg whites + 1 roti.",
    },
  },
  nonveg: {
    type: "nonveg",
    label: "Non-Veg",
    emoji: "🍗",
    targets: { calories: "~1,820", protein: "160g", fat: "72g", carbs: "133g" },
    options: [
      {
        optionName: "Option A (Day 1)",
        meals: {
          meal1: {
            name: "Meal 1 — Break-Fast (12:00 PM)",
            items: [
              { food: "Chicken Curry (boneless)", qty: "200g chicken", protein: "46g", calories: "~350" },
              { food: "Whole Wheat Roti", qty: "2 rotis", protein: "6g", calories: "~200" },
              { food: "Whole Eggs (boiled/omelette)", qty: "2 eggs", protein: "14g", calories: "~160" },
              { food: "Mixed Salad + 1 tsp olive oil", qty: "1 bowl", protein: "2g", calories: "~80" },
            ],
            totalP: "~68g",
            totalCal: "~790",
          },
          snack: {
            name: "Snack (3:00 - 4:00 PM)",
            items: [
              { food: "Whey Protein Shake (water)", qty: "1 scoop", protein: "25g", calories: "~120" },
              { food: "Boiled Egg", qty: "1 egg", protein: "7g", calories: "~80" },
              { food: "Almonds", qty: "10 pieces", protein: "3g", calories: "~70" },
            ],
            totalP: "~35g",
            totalCal: "~270",
          },
          meal2: {
            name: "Meal 2 — Dinner (7:00 - 8:00 PM)",
            items: [
              { food: "Grilled Chicken Breast", qty: "200g chicken", protein: "50g", calories: "~330" },
              { food: "Rice (cooked)", qty: "1 small cup", protein: "3g", calories: "~180" },
              { food: "Dal (moong/masoor)", qty: "1 bowl", protein: "8g", calories: "~150" },
              { food: "Sabzi (any vegetable)", qty: "1 bowl", protein: "3g", calories: "~100" },
            ],
            totalP: "~64g",
            totalCal: "~760",
          },
        },
        dailyTotal: { calories: "~1,820", protein: "~167g", fat: "~68g", carbs: "~135g" },
      },
      {
        optionName: "Option B (Day 2)",
        meals: {
          meal1: {
            name: "Meal 1 — Break-Fast (12:00 PM)",
            items: [
              { food: "Fish Curry (Rohu/Pomfret)", qty: "250g fish", protein: "45g", calories: "~300" },
              { food: "Rice (cooked)", qty: "1 small cup", protein: "3g", calories: "~180" },
              { food: "Egg Bhurji", qty: "3 eggs", protein: "21g", calories: "~250" },
              { food: "Cucumber + Onion Salad", qty: "1 bowl", protein: "1g", calories: "~30" },
            ],
            totalP: "~70g",
            totalCal: "~760",
          },
          snack: {
            name: "Snack (3:00 - 4:00 PM)",
            items: [
              { food: "Whey Protein Shake (water)", qty: "1 scoop", protein: "25g", calories: "~120" },
              { food: "Peanut Butter", qty: "1 tbsp", protein: "4g", calories: "~100" },
              { food: "Greek Yogurt / Hung Curd", qty: "150g", protein: "10g", calories: "~90" },
            ],
            totalP: "~39g",
            totalCal: "~310",
          },
          meal2: {
            name: "Meal 2 — Dinner (7:00 - 8:00 PM)",
            items: [
              { food: "Tandoori Chicken (boneless)", qty: "200g chicken", protein: "46g", calories: "~300" },
              { food: "Whole Wheat Roti", qty: "1 roti", protein: "3g", calories: "~100" },
              { food: "Mixed Dal (thick)", qty: "1 bowl", protein: "10g", calories: "~150" },
              { food: "Palak / Green Sabzi", qty: "1 bowl", protein: "3g", calories: "~80" },
            ],
            totalP: "~62g",
            totalCal: "~630",
          },
        },
        dailyTotal: { calories: "~1,700", protein: "~171g", fat: "~62g", carbs: "~118g" },
      },
    ],
    tips: [
      "PROTEIN FIRST — always hit your protein target, reduce carbs/fat if needed.",
      "Drink 3-4 liters of water daily (especially during fasting window).",
      "Black coffee or green tea during fasting window is allowed.",
      "Cook with minimal oil — 1-2 tsp per meal maximum.",
      "No sugar, junk food, maida, or alcohol (same as Phase 1).",
      "Rotate between Option A and Option B for variety.",
      "You can swap chicken ↔ fish ↔ mutton (lean cuts only) freely.",
    ],
    adjustmentRules: {
      under70: "Remove 1 roti OR reduce rice to half cup.",
      normal: "Follow the plan as is.",
      to90: "Add 1 extra roti OR increase rice slightly.",
      above90: "Add 50g more chicken/fish + 1 roti.",
    },
  },
};

export function DietClient({ userWeight }: DietClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("veg");
  const [selectedOption, setSelectedOption] = useState<number>(0);

  // Weight Category State
  const [weightCategory, setWeightCategory] = useState<string>(() => {
    if (userWeight === null) return "normal";
    if (userWeight < 70) return "under70";
    if (userWeight <= 80) return "normal";
    if (userWeight <= 90) return "to90";
    return "above90";
  });

  const activePlan = DIET_PLANS[activeTab];
  const option = activePlan.options[selectedOption];

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      
      {/* Back & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/nutrition")}
          className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#3f3f46] transition-all"
        >
          <ArrowLeft size={16} weight="bold" />
        </button>
        <div>
          <h1 className="font-display text-2xl text-[var(--text-primary)] font-black tracking-wide uppercase">
            Coach Diet Plan
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)]">
            Phase 2 | Fat Burning Mode (Intermittent Fasting)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#18181b] rounded-2xl border border-[#27272a]">
        {Object.values(DIET_PLANS).map((p) => {
          const isActive = activeTab === p.type;
          return (
            <button
              key={p.type}
              onClick={() => setActiveTab(p.type)}
              className={cn(
                "py-3 text-xs font-body font-bold rounded-xl transition-all relative flex items-center justify-center gap-1.5",
                isActive
                  ? "bg-[#09090b] text-[var(--accent-text)] shadow-sm font-black"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeDietTab"
                  className="absolute inset-0 border border-[#3f3f46]/50 rounded-xl pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Macro Targets Banner */}
      <Card variant="surface" className="p-4 border-[#27272a] bg-gradient-to-br from-[#18181b] to-[rgba(249,115,22,0.02)]">
        <div className="flex justify-between items-center border-b border-[#27272a]/60 pb-2 mb-3">
          <span className="text-[10px] font-display font-black text-[var(--accent-text)] uppercase tracking-wider">
            Sample Macro Targets (80kg Man)
          </span>
          <span className="text-[9px] text-[var(--text-muted)] font-body font-semibold uppercase">
            16:8 Fasting Window
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Calories", val: activePlan.targets.calories, unit: "kcal", color: "text-[var(--accent-text)]" },
            { label: "Protein", val: activePlan.targets.protein, unit: "g", color: "text-[var(--blue)]" },
            { label: "Fat", val: activePlan.targets.fat, unit: "g", color: "text-[var(--purple)]" },
            { label: "Carbs", val: activePlan.targets.carbs, unit: "g", color: "text-[var(--amber)]" },
          ].map((col) => (
            <div key={col.label} className="p-2 rounded-xl bg-[#09090b] border border-[#27272a]/40">
              <p className={cn("font-display text-base font-black leading-none", col.color)}>
                {col.val.replace("g", "").replace("~", "")}
              </p>
              <p className="text-[8px] text-[var(--text-muted)] font-body uppercase mt-1">
                {col.label} {col.unit && `(${col.unit})`}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1.5 p-2 rounded-xl bg-[rgba(249,115,22,0.04)] text-[10px] text-[var(--text-muted)] font-body">
          <Info size={14} className="text-[var(--accent-start)] shrink-0" />
          <span>Fasting: 8:00 PM to 12:00 PM next day. Eating: 12:00 PM to 8:00 PM.</span>
        </div>
      </Card>

      {/* Dynamic Weight Calculator Widget */}
      <Card variant="surface" className="p-4 border-[#27272a] bg-[#18181b]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-[var(--accent-start)]/10 text-[var(--accent-text)]">
            <ListChecks size={18} />
          </div>
          <div>
            <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wide">
              Portion Adjustment Calculator
            </h3>
            {userWeight && (
              <p className="text-[9px] text-[var(--green)] font-body font-bold mt-0.5">
                ⚡ Auto-detected your latest weight: {userWeight} kg
              </p>
            )}
          </div>
        </div>

        {/* Category buttons */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#09090b] rounded-xl border border-[#27272a]/80 mb-3">
          {[
            { key: "under70", label: "< 70 kg" },
            { key: "normal", label: "70 - 80 kg" },
            { key: "to90", label: "80 - 90 kg" },
            { key: "above90", label: "> 90 kg" },
          ].map((cat) => {
            const isSelected = weightCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setWeightCategory(cat.key)}
                className={cn(
                  "py-1.5 text-[10px] font-body font-bold rounded-lg transition-all",
                  isSelected
                    ? "bg-[#18181b] text-[var(--text-primary)] shadow-sm font-black border border-[#3f3f46]/40"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Rule Display */}
        <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]/60">
          <p className="text-[10px] text-[var(--text-muted)] font-body uppercase tracking-wider">Adjustment Guideline</p>
          <p className="text-xs text-[var(--text-primary)] font-body font-semibold mt-1">
            {weightCategory === "under70" && activePlan.adjustmentRules.under70}
            {weightCategory === "normal" && `No modifications required. ${activePlan.adjustmentRules.normal}`}
            {weightCategory === "to90" && activePlan.adjustmentRules.to90}
            {weightCategory === "above90" && activePlan.adjustmentRules.above90}
          </p>
        </div>
      </Card>

      {/* Option Toggles */}
      <div className="flex gap-2">
        {activePlan.options.map((opt, idx) => (
          <button
            key={opt.optionName}
            onClick={() => setSelectedOption(idx)}
            className={cn(
              "flex-1 py-2 px-3 text-xs font-body font-bold rounded-xl border transition-all",
              selectedOption === idx
                ? "bg-gradient-to-br from-[var(--accent-start)]/10 to-[var(--accent-end)]/10 border-[var(--accent-start)] text-[var(--accent-text)]"
                : "bg-[#18181b] border-[#27272a] text-[var(--text-secondary)] hover:border-[#3f3f46]"
            )}
          >
            {opt.optionName}
          </button>
        ))}
      </div>

      {/* Meals Plan Display */}
      <div className="space-y-4">
        {[option.meals.meal1, option.meals.snack, option.meals.meal2].map((m, mIdx) => (
          <Card key={mIdx} variant="surface" className="p-4 border-[#27272a] bg-[#18181b] space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                <span>{mIdx === 0 ? "🌅" : mIdx === 1 ? "🍎" : "🌙"}</span>
                <span>{m.name}</span>
              </h4>
              <span className="text-[10px] font-body-bold px-2 py-0.5 rounded-full bg-[#09090b] border border-[#27272a] text-[var(--text-secondary)]">
                {m.totalP} Protein · {m.totalCal} kcal
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-body">
                <thead>
                  <tr className="border-b border-[#27272a] text-[var(--text-muted)] font-semibold uppercase text-[9px] tracking-wider">
                    <th className="pb-2">Food Item</th>
                    <th className="pb-2 text-right">Quantity</th>
                    <th className="pb-2 text-right">Protein</th>
                    <th className="pb-2 text-right">Calories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]/45">
                  {m.items.map((it, itIdx) => (
                    <tr key={itIdx} className="hover:bg-[#09090b]/20 transition-colors">
                      <td className="py-2.5 font-bold text-[var(--text-primary)]">{it.food}</td>
                      <td className="py-2.5 text-right text-[var(--text-secondary)]">{it.qty}</td>
                      <td className="py-2.5 text-right font-medium text-[var(--blue)]">{it.protein}</td>
                      <td className="py-2.5 text-right font-medium text-[var(--text-secondary)]">{it.calories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

      {/* Daily Summary totals banner */}
      <Card variant="surface" className="p-4 border-[#27272a] bg-[#09090b] flex justify-between items-center">
        <span className="font-display text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">
          Daily Estimated Totals ({option.optionName.split(" ")[0]})
        </span>
        <div className="text-right space-y-1">
          <p className="font-display text-lg font-black text-[var(--accent-text)] leading-none">
            {option.dailyTotal.calories.replace("~", "")} kcal
          </p>
          <p className="text-[9px] text-[var(--text-muted)] font-body uppercase">
            P: <strong className="text-[var(--text-primary)]">{option.dailyTotal.protein}</strong> &nbsp;•&nbsp; 
            F: <strong className="text-[var(--text-primary)]">{option.dailyTotal.fat}</strong> &nbsp;•&nbsp; 
            C: <strong className="text-[var(--text-primary)]">{option.dailyTotal.carbs}</strong>
          </p>
        </div>
      </Card>

      {/* Vegetarian protein arsenal */}
      {activePlan.arsenal && (
        <Card variant="surface" className="p-4 border-[#27272a] bg-[#18181b] space-y-3">
          <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
            <div className="p-1.5 rounded-lg bg-[var(--blue)]/10 text-[var(--blue)]">
              <ForkKnife size={16} />
            </div>
            <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
              Vegetarian Protein Arsenal
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activePlan.arsenal.map((ars, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-[#09090b] border border-[#27272a]/60 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-primary)] leading-tight">{ars.food}</p>
                  <p className="text-[8px] text-[var(--text-muted)] mt-0.5">{ars.serving}</p>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-[var(--blue)]/10 text-[var(--blue)] font-display text-[10px] font-black shrink-0">
                  {ars.protein}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tips and Golden Rules list */}
      <Card variant="surface" className="p-4 border-[#27272a] bg-[#18181b] space-y-3">
        <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
          <div className="p-1.5 rounded-lg bg-[var(--accent-start)]/10 text-[var(--accent-text)]">
            <Flame size={16} />
          </div>
          <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
            {activeTab === "nonveg" ? "Golden Nutrition Rules" : "Coach Protein Boosting Tips"}
          </h4>
        </div>

        <div className="space-y-2">
          {activePlan.tips.map((tip, idx) => (
            <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-[#09090b] border border-[#27272a]/40">
              <span className="w-5 h-5 rounded-lg bg-[var(--accent-start)]/10 text-[var(--accent-start)] flex items-center justify-center font-display text-xs font-black shrink-0">
                {idx + 1}
              </span>
              <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
