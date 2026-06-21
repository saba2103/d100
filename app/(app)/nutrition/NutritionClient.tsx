"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppUser } from "@/lib/contexts/AppContext";
import { triggerBadgeCheck } from "@/lib/utils/achievementsClient";
import {
  Plus, Trash, CaretDown, CaretRight, ChartDonut,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BottomSheet, Modal } from "@/components/ui/Misc";

// ── Types ──────────────────────────────────────────────────────────────
type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "pre_workout" | "post_workout";

// Mirrors database.ts NutritionItem — quantity is a number
interface FoodItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  quantity: number;
  unit: string;
}

interface NutritionLog {
  id: string;
  meal_type: MealType | null;
  items: FoodItem[];
  logged_at: string;
}

interface Props {
  profile: any;
  settings: any;
  initialLogs: NutritionLog[];
  initialDailyStats: any;
  today: string;
}

// ── Meal Config ────────────────────────────────────────────────────────
const MEALS: { key: MealType; label: string; emoji: string }[] = [
  { key: "breakfast",   label: "Breakfast",    emoji: "🌅" },
  { key: "lunch",       label: "Lunch",         emoji: "☀️" },
  { key: "dinner",      label: "Dinner",         emoji: "🌙" },
  { key: "snack",       label: "Snack",          emoji: "🍎" },
  { key: "pre_workout", label: "Pre-Workout",    emoji: "⚡" },
  { key: "post_workout",label: "Post-Workout",   emoji: "💪" },
];

// ── Macro Ring SVG ─────────────────────────────────────────────────────
function MacroRing({ pct, size = 180, stroke = 14, color }: {
  pct: number; size?: number; stroke?: number; color: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - Math.min(pct / 100, 1) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--border)" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

// ── Add Food Form ──────────────────────────────────────────────────────
function AddFoodForm({
  initialMeal,
  onSave,
  onClose,
}: {
  initialMeal: MealType;
  onSave: (meal: MealType, item: FoodItem) => Promise<void>;
  onClose: () => void;
}) {
  const [meal, setMeal] = useState<MealType>(initialMeal);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("serving");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !calories) return;
    setSaving(true);
    await onSave(meal, {
      name: name.trim(),
      calories: parseFloat(calories) || 0,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
      quantity: parseFloat(qty) || 1,
      unit,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-1">
      {/* Meal selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {MEALS.map((m) => (
          <button key={m.key} type="button"
            onClick={() => setMeal(m.key)}
            className={cn(
              "py-1.5 px-2 rounded-xl border text-[10px] font-body font-body-bold transition-all",
              meal === m.key
                ? "bg-[var(--accent-start)]/10 border-[var(--accent-start)] text-[var(--accent-text)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-start)]/40"
            )}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <Input label="Food Name" id="food-name" type="text"
        placeholder="e.g. Oats, Chicken Breast" value={name}
        onChange={(e) => setName(e.target.value)} required />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Quantity" id="food-qty" type="text"
          placeholder="1" value={qty}
          onChange={(e) => setQty(e.target.value)} />
        <Input label="Unit" id="food-unit" type="text"
          placeholder="cup / g / serving" value={unit}
          onChange={(e) => setUnit(e.target.value)} />
      </div>

      <Input label="Calories (kcal)" id="food-cal" type="number"
        inputMode="numeric" placeholder="300" value={calories}
        onChange={(e) => setCalories(e.target.value)} required />

      <div className="grid grid-cols-3 gap-3">
        <Input label="Protein (g)" id="food-prot" type="number"
          inputMode="decimal" placeholder="25" value={protein}
          onChange={(e) => setProtein(e.target.value)} />
        <Input label="Carbs (g)" id="food-carbs" type="number"
          inputMode="decimal" placeholder="40" value={carbs}
          onChange={(e) => setCarbs(e.target.value)} />
        <Input label="Fat (g)" id="food-fat" type="number"
          inputMode="decimal" placeholder="8" value={fat}
          onChange={(e) => setFat(e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1"
          disabled={saving || !name.trim() || !calories}>
          {saving ? "Saving…" : "Add Food"}
        </Button>
      </div>
    </form>
  );
}

// ── Meal Accordion ─────────────────────────────────────────────────────
function MealSection({
  meal, items, onAdd, onDelete,
}: {
  meal: { key: MealType; label: string; emoji: string };
  items: FoodItem[];
  onAdd: () => void;
  onDelete: (idx: number) => void;
}) {
  const [open, setOpen] = useState(items.length > 0);
  const totalCal = items.reduce((s, i) => s + (i.calories || 0), 0);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-base)] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{meal.emoji}</span>
          <span className="font-body font-body-bold text-sm text-[var(--text-primary)]">
            {meal.label}
          </span>
          {totalCal > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-base)] border border-[var(--border)] text-[10px] font-body text-[var(--text-muted)]">
              {totalCal} kcal
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--accent-text)] transition-colors"
            aria-label={`Add food to ${meal.label}`}
          >
            <Plus size={16} weight="bold" />
          </button>
          {open ? <CaretDown size={14} className="text-[var(--text-muted)]" />
                : <CaretRight size={14} className="text-[var(--text-muted)]" />}
        </div>
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1 border-t border-[var(--border)]/50 pt-2">
              {items.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] font-body py-2 text-center">
                  Tap + to log your {meal.label.toLowerCase()}
                </p>
              ) : (
                items.map((item, idx) => (
                  <div key={idx}
                    className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-[var(--bg-base)] group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-body font-body-bold text-xs text-[var(--text-primary)] truncate">
                        {item.name}
                        <span className="ml-1 font-normal text-[var(--text-muted)]">
                          · {item.quantity} {item.unit}
                        </span>
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">
                        {item.calories} kcal
                        {item.protein_g > 0 && ` · P ${item.protein_g}g`}
                        {item.carbs_g > 0  && ` · C ${item.carbs_g}g`}
                        {item.fat_g > 0    && ` · F ${item.fat_g}g`}
                      </p>
                    </div>
                    <button
                      onClick={() => onDelete(idx)}
                      className="ml-2 p-1 text-[var(--text-muted)] hover:text-[var(--red)] opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete item"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Client Component ──────────────────────────────────────────────
export function NutritionClient({ profile, settings, initialLogs, initialDailyStats, today }: Props) {
  const router = useRouter();
  const { activeProfile } = useAppUser();
  const [selectedDate, setSelectedDate] = useState(today);

  // Logs keyed by meal type
  const [logs, setLogs] = useState<NutritionLog[]>(initialLogs);

  // Add food sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>("breakfast");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // ── Derived totals ─────────────────────────────────────────────────
  const allItems = useMemo(() =>
    logs.flatMap((l) => l.items), [logs]);

  const totalCal  = useMemo(() => allItems.reduce((s, i) => s + (i.calories  || 0), 0), [allItems]);
  const totalProt = useMemo(() => allItems.reduce((s, i) => s + (i.protein_g || 0), 0), [allItems]);
  const totalCarb = useMemo(() => allItems.reduce((s, i) => s + (i.carbs_g   || 0), 0), [allItems]);
  const totalFat  = useMemo(() => allItems.reduce((s, i) => s + (i.fat_g     || 0), 0), [allItems]);

  const calGoal   = settings?.calories_goal || 2000;
  const protGoal  = Math.round(calGoal * 0.30 / 4);
  const carbGoal  = Math.round(calGoal * 0.45 / 4);
  const fatGoal   = Math.round(calGoal * 0.25 / 9);
  const calPct    = Math.min((totalCal / calGoal) * 100, 100);

  // ── Item helpers ───────────────────────────────────────────────────
  const getItemsForMeal = (meal: MealType): FoodItem[] =>
    logs.find((l) => l.meal_type === meal)?.items || [];

  const openSheet = (meal: MealType) => {
    setActiveMeal(meal);
    setSheetOpen(true);
  };

  // ── Upsert to DB and sync daily_stats ─────────────────────────────
  const handleSaveFood = async (meal: MealType, item: FoodItem) => {
    const supabase = createClient();

    const existing = logs.find((l) => l.meal_type === meal);
    let updatedLogs: NutritionLog[];

    if (existing) {
      const newItems = [...existing.items, item];
      const { error } = await supabase
        .from("nutrition_logs")
        .update({ items: newItems })
        .eq("id", existing.id);
      if (error) { alert(error.message); return; }
      updatedLogs = logs.map((l) =>
        l.id === existing.id ? { ...l, items: newItems } : l
      );
    } else {
      const { data, error } = await supabase
        .from("nutrition_logs")
        .insert({
          user_id: profile.id,
          logged_at: selectedDate,
          meal_type: meal,
          items: [item],
          profile_tag: activeProfile,
        })
        .select()
        .single();
      if (error || !data) { alert(error?.message); return; }
      updatedLogs = [...logs, data as unknown as NutritionLog];
    }

    setLogs(updatedLogs);
    setSheetOpen(false);

    // Sync daily_stats.calories_consumed
    const newTotal = updatedLogs.flatMap((l) => l.items)
      .reduce((s, i) => s + (i.calories || 0), 0);

    if (initialDailyStats?.id) {
      await supabase
        .from("daily_stats")
        .update({ calories_consumed: newTotal })
        .eq("id", initialDailyStats.id);
    } else {
      await supabase.from("daily_stats").upsert({
        user_id: profile.id,
        stat_date: selectedDate,
        calories_consumed: newTotal,
        profile_tag: activeProfile,
      }, { onConflict: "user_id,stat_date,profile_tag" });
    }

    await triggerBadgeCheck();
  };

  const handleDeleteItem = async (meal: MealType, itemIdx: number) => {
    const supabase = createClient();
    const existing = logs.find((l) => l.meal_type === meal);
    if (!existing) return;

    const newItems = existing.items.filter((_, i) => i !== itemIdx);
    const { error } = await supabase
      .from("nutrition_logs")
      .update({ items: newItems })
      .eq("id", existing.id);
    if (error) return;

    const updatedLogs = logs.map((l) =>
      l.id === existing.id ? { ...l, items: newItems } : l
    );
    setLogs(updatedLogs);

    // Sync calories
    const newTotal = updatedLogs.flatMap((l) => l.items)
      .reduce((s, i) => s + (i.calories || 0), 0);
    await supabase.from("daily_stats").upsert({
      user_id: profile.id,
      stat_date: selectedDate,
      calories_consumed: newTotal,
      profile_tag: activeProfile,
    }, { onConflict: "user_id,stat_date,profile_tag" });

    await triggerBadgeCheck();
  };

  // ── Date navigation (today only for now, but scaffold for history) ─
  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const AddFoodContainer = isMobile ? BottomSheet : Modal;

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide">
            NUTRITION
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">
            Fuel your transformation
          </p>
        </div>
        {/* Date selector */}
        <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3 py-2">
          <span className="font-body text-xs text-[var(--text-primary)] font-body-bold">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* ── Macro Summary Ring ── */}
      <Card variant="surface" className="p-5">
        <div className="flex flex-col items-center gap-4">
          {/* Ring + centre text */}
          <div className="relative">
            <MacroRing pct={calPct} color="var(--accent-start)" size={180} stroke={14} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <span className="font-display text-4xl font-black text-[var(--text-primary)] leading-none">
                {totalCal}
              </span>
              <span className="font-body text-[10px] text-[var(--text-muted)] uppercase mt-1">
                of {calGoal} kcal
              </span>
              <span className="font-body text-[10px] text-[var(--accent-text)] mt-0.5 font-body-bold">
                {calGoal - totalCal > 0 ? `${calGoal - totalCal} remaining` : "Goal reached!"}
              </span>
            </div>
          </div>

          {/* Macro pills */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {[
              { label: "Protein", val: totalProt, goal: protGoal, color: "var(--blue)" },
              { label: "Carbs",   val: totalCarb, goal: carbGoal, color: "var(--amber)" },
              { label: "Fat",     val: totalFat,  goal: fatGoal,  color: "var(--purple)" },
            ].map(({ label, val, goal, color }) => (
              <div key={label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-base)]"
              >
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="font-body text-xs text-[var(--text-primary)]">
                  <span className="font-body-bold">{Math.round(val)}g</span>
                  <span className="text-[var(--text-muted)]"> / {goal}g</span>
                </span>
                <span className="font-body text-[10px] text-[var(--text-muted)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Meal Sections ── */}
      <div className="space-y-3">
        <h2 className="font-display text-base tracking-wider text-[var(--text-muted)] uppercase">
          Meals
        </h2>
        {MEALS.map((meal) => (
          <MealSection
            key={meal.key}
            meal={meal}
            items={getItemsForMeal(meal.key)}
            onAdd={() => openSheet(meal.key)}
            onDelete={(idx) => handleDeleteItem(meal.key, idx)}
          />
        ))}
      </div>

      {/* ── Coach Guidance Card ── */}
      <Card variant="surface" className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-[rgba(249,115,22,0.12)] text-[var(--accent-text)] border border-[rgba(249,115,22,0.2)]">
            📋 Coach
          </span>
          <h3 className="font-display text-sm tracking-wider text-[var(--text-primary)] uppercase">
            Phase 1 Nutrition Guidelines
          </h3>
        </div>

        <div className="space-y-2">
          {[
            { label: "AVOID",    text: "Maida, refined sugar, processed food, refined carbs, alcohol" },
            { label: "EAT",      text: "Complex carbs (oats, brown rice, sweet potato), lean protein, healthy fats" },
            { label: "TIMING",   text: "Consume protein within 45 min of your workout" },
            { label: "APPROACH", text: "Slight caloric deficit for fat loss · Maintenance calories for muscle gain" },
          ].map(({ label, text }) => (
            <div key={label} className="flex gap-3 text-xs font-body">
              <span className="shrink-0 font-body-bold text-[var(--accent-text)] w-16">{label}</span>
              <span className="text-[var(--text-secondary)] leading-relaxed">{text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Add Food Sheet / Modal ── */}
      <AddFoodContainer
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="ADD FOOD"
      >
        <AddFoodForm
          initialMeal={activeMeal}
          onSave={handleSaveFood}
          onClose={() => setSheetOpen(false)}
        />
      </AddFoodContainer>

      {/* ── FAB (mobile quick add) ── */}
      <button
        onClick={() => openSheet("breakfast")}
        className="fixed bottom-24 right-4 z-30 h-14 w-14 rounded-full bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] text-white shadow-lg shadow-[var(--accent-start)]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Add food"
      >
        <Plus size={24} weight="bold" />
      </button>
    </div>
  );
}
