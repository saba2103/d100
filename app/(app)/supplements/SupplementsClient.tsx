"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { triggerBadgeCheck } from "@/lib/utils/achievementsClient";
import {
  Gear, Plus, Trash, CaretDown, CaretRight, Sparkle,
  CheckCircle, Circle, Fire, Info, Check
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BottomSheet, Modal } from "@/components/ui/Misc";
import { cn } from "@/lib/utils/cn";

// Framer motion imports
import { motion, AnimatePresence } from "framer-motion";

import { useAppUser } from "@/lib/contexts/AppContext";

interface Props {
  userId: string;
  today: string;
  initialLogs: any[];
  isReadOnly?: boolean;
}

interface Supplement {
  name: string;
  dose: string;
  timing?: string;
  custom?: boolean;
  taken: boolean;
  taken_at?: string;
}

import { COACH_SUPPLEMENT_PLAN } from "@/lib/workoutPlan";

const COACH_SUPPLEMENTS: any[] = COACH_SUPPLEMENT_PLAN;

export function SupplementsClient({ userId, today, initialLogs, isReadOnly = false }: Props) {
  const router = useRouter();
  const { activeProfile } = useAppUser();
  const [logs, setLogs] = useState(initialLogs);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [lastCheckedSupp, setLastCheckedSupp] = useState<string | null>(null);

  // Form state for custom supplement
  const [customName, setCustomName] = useState("");
  const [customDose, setCustomDose] = useState("");
  const [customTiming, setCustomTiming] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Mobile sheet vs Desktop Modal helper
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const ContainerComponent = isMobile ? BottomSheet : Modal;

  // 1. Get today's checklist
  const todayLog = useMemo(() => logs.find(l => l.logged_at === today), [logs, today]);

  const checklist: Supplement[] = useMemo(() => {
    if (todayLog) {
      // Ensure all coach supplements are present
      const items = [...(todayLog.supplements || [])];
      COACH_SUPPLEMENTS.forEach(coach => {
        if (!items.some(i => i.name === coach.name)) {
          items.push({
            name: coach.name,
            dose: coach.dose,
            timing: coach.timing,
            custom: false,
            taken: false,
          });
        }
      });
      return items;
    }

    // Carry forward customs from the most recent log
    const prevLog = logs.find(l => l.logged_at !== today);
    const prevCustoms = prevLog
      ? (prevLog.supplements || []).filter((i: any) => i.custom)
      : [];

    const initialCustoms = prevCustoms.map((i: any) => ({
      name: i.name,
      dose: i.dose,
      timing: i.timing || "",
      custom: true,
      taken: false,
    }));

    const initialCoach = COACH_SUPPLEMENTS.map(c => ({
      name: c.name,
      dose: c.dose,
      timing: c.timing,
      custom: false,
      taken: false,
    }));

    return [...initialCoach, ...initialCustoms];
  }, [todayLog, logs, today]);

  const totalCount = checklist.length;
  const takenCount = checklist.filter(i => i.taken).length;
  const progressPct = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && takenCount === totalCount;

  const handleToggle = async (name: string) => {
    if (isReadOnly) return;
    const isChecking = checklist.find(item => item.name === name)?.taken === false;
    if (isChecking) {
      setLastCheckedSupp(name);
      setTimeout(() => setLastCheckedSupp(null), 500);
    }
    const updated = checklist.map(item => {
      if (item.name === name) {
        const nextTaken = !item.taken;
        return {
          ...item,
          taken: nextTaken,
          taken_at: nextTaken ? new Date().toISOString() : undefined,
        };
      }
      return item;
    });

    const supabase = createClient();
    if (todayLog) {
      const { error } = await supabase
        .from("supplement_logs")
        .update({ supplements: updated })
        .eq("id", todayLog.id);
      if (!error) {
        setLogs(prev => prev.map(l => l.id === todayLog.id ? { ...l, supplements: updated } : l));
      }
    } else {
      const { data, error } = await supabase
        .from("supplement_logs")
        .insert({
          user_id: userId,
          logged_at: today,
          supplements: updated,
        })
        .select()
        .single();
      if (!error && data) {
        setLogs(prev => [data, ...prev]);
      }
    }

    if (updated.length > 0 && updated.every((s) => s.taken)) {
      fetch("/api/events/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "supplements_checked",
          profileTag: activeProfile,
        }),
      }).catch(() => {});
    }

    await triggerBadgeCheck();
  };

  // 3. Add Custom Supplement
  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customDose.trim()) return;

    setSaving(true);
    const newCustom: Supplement = {
      name: customName.trim(),
      dose: customDose.trim(),
      timing: customTiming.trim(),
      custom: true,
      taken: false,
    };

    const updated = [...checklist, newCustom];
    const supabase = createClient();

    if (todayLog) {
      const { error } = await supabase
        .from("supplement_logs")
        .update({ supplements: updated })
        .eq("id", todayLog.id);
      if (!error) {
        setLogs(prev => prev.map(l => l.id === todayLog.id ? { ...l, supplements: updated } : l));
      }
    } else {
      const { data, error } = await supabase
        .from("supplement_logs")
        .insert({
          user_id: userId,
          logged_at: today,
          supplements: updated,
        })
        .select()
        .single();
      if (!error && data) {
        setLogs(prev => [data, ...prev]);
      }
    }

    setCustomName("");
    setCustomDose("");
    setCustomTiming("");
    setCustomNotes("");
    setSheetOpen(false);
    setSaving(false);
    await triggerBadgeCheck();
  };

  // 4. Delete Custom Supplement
  const handleDeleteCustom = async (name: string) => {
    const updated = checklist.filter(item => item.name !== name);
    const supabase = createClient();

    if (todayLog) {
      const { error } = await supabase
        .from("supplement_logs")
        .update({ supplements: updated })
        .eq("id", todayLog.id);
      if (!error) {
        setLogs(prev => prev.map(l => l.id === todayLog.id ? { ...l, supplements: updated } : l));
      }
    } else {
      const { data, error } = await supabase
        .from("supplement_logs")
        .insert({
          user_id: userId,
          logged_at: today,
          supplements: updated,
        })
        .select()
        .single();
      if (!error && data) {
        setLogs(prev => [data, ...prev]);
      }
    }
  };

  // 5. Streak calculation
  const streak = useMemo(() => {
    let currentStreak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const log = logs.find(l => l.logged_at === dateStr);

      const allCoachTaken = log && COACH_SUPPLEMENTS.every(coach =>
        log.supplements?.some((s: any) => s.name === coach.name && (s.taken || s.taken_at))
      );

      if (allCoachTaken) {
        currentStreak++;
      } else {
        if (dateStr === today) {
          // today is allowed to be incomplete
        } else {
          break;
        }
      }

      currentDate.setDate(currentDate.getDate() - 1);
      if (currentStreak > 30) break; // limit to local history scope
    }

    return currentStreak;
  }, [logs, today]);

  // 6. 7-Day Compliance Grid (Monday-Sunday of current week)
  const weekDays = useMemo(() => {
    const d = new Date(today);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split("T")[0];
    });
  }, [today]);

  const gridSupplements = useMemo(() => {
    const coachNames = COACH_SUPPLEMENTS.map(c => c.name);
    const customNames = new Set<string>();

    checklist.forEach(item => {
      if (item.custom) {
        customNames.add(item.name);
      }
    });

    logs.forEach(log => {
      log.supplements?.forEach((s: any) => {
        if (s.custom && !coachNames.includes(s.name)) {
          customNames.add(s.name);
        }
      });
    });

    return [
      ...COACH_SUPPLEMENTS.map(c => ({ name: c.name, isCoach: true })),
      ...Array.from(customNames).map(name => ({ name, isCoach: false })),
    ];
  }, [checklist, logs]);

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
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide">
            SUPPLEMENTS
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">{formattedDate}</p>
        </div>
        <button onClick={() => router.push("/settings")}
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <Gear size={18} />
        </button>
      </div>

      {/* Streak and compliance widgets */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="font-body text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            Streak
          </span>
          <div className="flex items-center gap-2 mt-2">
            <Fire size={24} className="text-[var(--accent-text)] animate-pulse" />
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              {streak} {streak === 1 ? "Day" : "Days"}
            </span>
          </div>
          <span className="font-body text-[9px] text-[var(--text-muted)] mt-1">
            Coach supplements streak
          </span>
        </Card>

        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="font-body text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            Progress
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              {takenCount}
            </span>
            <span className="font-body text-xs text-[var(--text-muted)]">/ {totalCount} taken</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[var(--green)] rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </Card>
      </div>

      {/* Checklist Card */}
      <Card variant="surface" className="p-5 space-y-4">
        <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider">
          Daily Checklist
        </p>

        <div className="space-y-2">
          {checklist.map((item, idx) => {
            const isCoach = !item.custom;
            const coachInfo = COACH_SUPPLEMENTS.find(c => c.name === item.name);
            const isExpanded = expandedIndex === idx;

            return (
              <div key={item.name} className={cn(
                "border border-[var(--border)] rounded-xl bg-[var(--bg-base)] overflow-hidden",
                lastCheckedSupp === item.name && "row-flash-green"
              )}>
                <div className="flex items-center justify-between px-3 py-3 select-none">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox button */}
                    <div
                      onClick={() => handleToggle(item.name)}
                      className={cn(
                        "relative h-[22px] w-[22px] rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 overflow-hidden cursor-pointer",
                        item.taken ? "border-[var(--green)] text-white" : "border-[var(--border)] bg-transparent"
                      )}
                    >
                      {/* Sweep green fill from left to right */}
                      <span className={cn(
                        "absolute inset-0 bg-[var(--green)] transition-transform duration-300 origin-left scale-x-0",
                        item.taken && "scale-x-100"
                      )} />
                      <span className="relative z-10 flex items-center justify-center">
                        {item.taken && <Check size={12} weight="bold" className="text-white" />}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className={cn(
                        "font-body font-body-bold text-xs text-[var(--text-primary)] truncate",
                        item.taken && "line-through text-[var(--text-muted)]"
                      )}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">
                        {item.dose} · <span className="text-[var(--accent-text)]">{item.timing}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.custom && (
                      <button onClick={() => handleDeleteCustom(item.name)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors rounded-lg hover:bg-[var(--bg-elevated)]">
                        <Trash size={14} />
                      </button>
                    )}
                    <button onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg">
                      {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expandable details */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[var(--border)]/50 bg-[var(--bg-surface)] px-4 py-3 text-xs font-body space-y-2"
                    >
                      <div>
                        <span className="font-body-bold text-[var(--text-muted)] uppercase text-[9px] block">Why it matters</span>
                        <p className="text-[var(--text-secondary)] mt-0.5">
                          {isCoach ? coachInfo?.why : "Custom added supplement"}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <span className="font-body-bold text-[var(--text-muted)] uppercase text-[9px] block">Best time</span>
                          <span className="text-[var(--text-secondary)]">
                            {isCoach ? coachInfo?.bestTime : item.timing || "Any time"}
                          </span>
                        </div>

                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-body-bold border",
                          isCoach
                            ? "border-[var(--accent-start)]/30 text-[var(--accent-text)] bg-[rgba(249,115,22,0.08)]"
                            : "border-[var(--border)] text-[var(--text-muted)]"
                        )}>
                          {isCoach ? "📋 Coach" : "✏️ Custom"}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Celebration row */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="p-3 rounded-xl bg-[var(--green-soft)] border border-[var(--green)]/20 text-center"
            >
              <p className="font-body-bold text-xs text-[var(--green)]">
                All done! 💪 You have taken all your supplements for today.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Coach note card */}
      <Card variant="surface" className="p-4 bg-[rgba(249,115,22,0.03)] border-l-4 border-l-[var(--accent-start)] border-[var(--border)]">
        <div className="flex items-start gap-2.5 text-xs font-body leading-relaxed text-[var(--text-secondary)]">
          <span className="font-body-bold text-[var(--accent-text)] shrink-0">📋 Coach:</span>
          <p>
            Supplements are the last 5% — food and training are 95%. These are optional but recommended. Don&apos;t waste money on fat burners, testosterone boosters, pre-workouts, BCAAs, or mass gainers.
          </p>
        </div>
      </Card>

      {/* 7-Day Compliance Grid */}
      <Card variant="surface" className="p-4 space-y-3">
        <div>
          <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Weekly Grid
          </p>
          <p className="text-[9px] text-[var(--text-muted)] font-body mt-0.5">
            Compliance for Coach supplements this week
          </p>
        </div>

        <div className="overflow-x-auto pb-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-1 pr-2 text-[9px] font-body-bold text-[var(--text-muted)] uppercase">Supplement</th>
                {weekDays.map(d => {
                  const [y, m, dayVal] = d.split("-").map(Number);
                  const label = new Date(y, m - 1, dayVal).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
                  return (
                    <th key={d} className="py-1 px-1.5 text-center text-[9px] font-body-bold text-[var(--text-muted)] uppercase">
                      {label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {gridSupplements.map((supp) => (
                <tr key={supp.name} className="border-b border-[var(--border)]/35 last:border-0">
                  <td className="py-1.5 pr-2 font-body text-[10px] text-[var(--text-secondary)] font-body-bold truncate max-w-[120px]">
                    {supp.name}
                  </td>
                  {weekDays.map(dayStr => {
                    const isFuture = dayStr > today;
                    const log = logs.find(l => l.logged_at === dayStr);
                    const taken = log?.supplements?.some((s: any) => s.name === supp.name && (s.taken || s.taken_at));

                    return (
                      <td key={dayStr} className="py-1.5 px-1.5 text-center">
                        <div className={cn(
                          "w-5 h-5 mx-auto rounded-md border transition-colors",
                          isFuture
                            ? "bg-[var(--bg-elevated)]/40 border-dashed border-[var(--border)]"
                            : taken
                              ? "bg-[var(--green)] border-[var(--green)] text-white flex items-center justify-center"
                              : "bg-[var(--bg-base)] border-[var(--border)]"
                        )}>
                          {!isFuture && taken && <Check size={10} weight="bold" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add custom supplement trigger */}
      <Button variant="secondary" fullWidth className="py-3 border-dashed" onClick={() => setSheetOpen(true)}>
        <Plus size={16} weight="bold" className="mr-1" /> Add Custom Supplement
      </Button>

      {/* Add Custom Supplement Bottom Sheet / Modal */}
      <ContainerComponent
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add Supplement"
      >
        <form onSubmit={handleAddCustom} className="space-y-4 pt-1">
          <Input
            label="Supplement Name"
            id="supp-name"
            type="text"
            placeholder="e.g. Ashwagandha"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Dose"
              id="supp-dose"
              type="text"
              placeholder="e.g. 500mg"
              value={customDose}
              onChange={(e) => setCustomDose(e.target.value)}
              required
            />
            <Input
              label="Timing"
              id="supp-timing"
              type="text"
              placeholder="e.g. Night / Morning"
              value={customTiming}
              onChange={(e) => setCustomTiming(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving || !customName.trim() || !customDose.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </ContainerComponent>
    </div>
  );
}
