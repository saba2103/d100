"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Barbell,
  Calendar,
  CheckCircle,
  Plus,
  ArrowRight,
  Clock,
  Circle,
  Sparkle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface WorkoutHomeClientProps {
  profile: any;
  initialWorkouts: any[];
  today: string;
}

import { COACH_WORKOUT_PLAN } from "@/lib/workoutPlan";

// Centralized Phase 1 Workout Plan Exercises
const PHASE1_EXERCISES = COACH_WORKOUT_PLAN;

export function WorkoutHomeClient({
  profile,
  initialWorkouts,
  today,
}: WorkoutHomeClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(today);

  // Generate 15 weeks of the program starting from the program start date
  const programWeeks = useMemo(() => {
    const start = new Date(profile?.program_start_date || today);
    start.setHours(0, 0, 0, 0);

    const weeks = [];
    for (let w = 0; w < 15; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dayIdx = w * 7 + d;
        if (dayIdx >= 100) break; // Limit to 100 days of the program

        const currentDay = new Date(start);
        currentDay.setDate(start.getDate() + dayIdx);
        
        days.push({
          dayIndex: dayIdx + 1,
          dateStr: currentDay.toISOString().split("T")[0],
          dayName: currentDay.toLocaleDateString("en-US", { weekday: "short" }),
          dayNum: currentDay.getDate(),
        });
      }
      if (days.length > 0) {
        weeks.push({
          weekNum: w + 1,
          days,
        });
      }
    }
    return weeks;
  }, [profile?.program_start_date, today]);

  // Scroll the active week into view on mount
  useEffect(() => {
    const activeWeek = programWeeks.find((w) =>
      w.days.some((d) => d.dateStr === selectedDate)
    );
    if (activeWeek) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`week-card-${activeWeek.weekNum}`);
        if (el) {
          el.scrollIntoView({
            behavior: "auto",
            block: "nearest",
            inline: "center",
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  // Find workout logged on selected date
  const selectedWorkoutLog = initialWorkouts.find(
    (w) => w.logged_at === selectedDate
  );

  // Check if workout is logged on specific date
  const hasWorkoutOnDate = (dateStr: string) => {
    return initialWorkouts.some((w) => w.logged_at === dateStr);
  };

  // Calculate day and phase for selected date
  const getSelectedDayProgress = (targetDateStr: string) => {
    if (!profile?.program_start_date) return { day: 1, phase: 1 };
    const start = new Date(profile.program_start_date);
    start.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - start.getTime();
    const day = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    let phase = 1;
    if (day > 7) phase = 2;

    return { day, phase };
  };

  const { day: selectedDayNum, phase: selectedPhaseNum } =
    getSelectedDayProgress(selectedDate);

  // Total Volume calculation helper
  const calculateVolume = (exercises: any[]) => {
    let total = 0;
    exercises.forEach((ex) => {
      if (ex.sets && Array.isArray(ex.sets)) {
        ex.sets.forEach((set: any) => {
          const reps = Number(set.reps) || 0;
          const weight = Number(set.weight_kg) || 0;
          total += reps * weight;
        });
      }
    });
    return total;
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide">
            WORKOUTS
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">
            Build your muscle, keep your momentum
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => router.push(`/workout/log?date=${today}`)}
        >
          <Plus size={16} weight="bold" /> Log Today
        </Button>
      </div>

      {/* Weekly strip - horizontal scrollable weeks */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
        {programWeeks.map((week) => {
          const hasActiveDate = week.days.some((d) => d.dateStr === selectedDate);
          return (
            <Card
              key={week.weekNum}
              variant="surface"
              id={`week-card-${week.weekNum}`}
              className={cn(
                "p-3 w-[290px] sm:w-[360px] shrink-0 snap-center rounded-2xl border transition-all duration-200",
                hasActiveDate
                  ? "border-[#3f3f46] bg-gradient-to-br from-[var(--bg-surface)] to-[rgba(249,115,22,0.02)] shadow-sm"
                  : "border-[#27272a] hover:border-[#3f3f46]"
              )}
            >
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-display font-black text-[var(--accent-text)] uppercase tracking-wider">
                  Week {week.weekNum}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] font-body font-semibold">
                  Days {week.days[0].dayIndex}–{week.days[week.days.length - 1].dayIndex}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {week.days.map((d) => {
                  const isSelected = d.dateStr === selectedDate;
                  const isCurrentToday = d.dateStr === today;
                  const hasWorkout = hasWorkoutOnDate(d.dateStr);

                  return (
                    <button
                      key={d.dateStr}
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={cn(
                        "flex flex-col items-center py-2.5 rounded-xl transition-all relative border",
                        isSelected
                          ? "bg-gradient-to-br from-[var(--accent-start)]/10 to-[var(--accent-end)]/10 border-[var(--accent-start)] text-[var(--accent-text)] font-bold"
                          : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-base)]",
                        isCurrentToday && !isSelected && "border-[#27272a]"
                      )}
                    >
                      <span className="text-[8px] uppercase font-body font-body-bold tracking-wider opacity-85">
                        {d.dayName}
                      </span>
                      <span className="font-display text-base font-black mt-1 leading-none">
                        {d.dayNum}
                      </span>

                      {/* Workout indicator dot/check */}
                      {hasWorkout ? (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--green)]" />
                      ) : isCurrentToday && !isSelected ? (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--accent-start)]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Today's / Selected Day Plan Card */}
      <div className="space-y-3">
        <h2 className="font-display text-base tracking-wider text-[var(--text-muted)] uppercase">
          {selectedDate === today ? "Today's Plan" : `Plan for ${new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        </h2>

        {selectedWorkoutLog ? (
          /* WORKOUT LOGGED STATE */
          <Card variant="surface" className="p-6 border-l-4 border-[var(--green)] border-[#27272a]">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} weight="fill" className="text-[var(--green)]" />
                  <span className="font-body font-body-bold text-xs uppercase tracking-wider text-[var(--green)]">
                    Workout Completed
                  </span>
                </div>
                <h3 className="font-display text-2xl text-[var(--text-primary)] font-black mt-1">
                  {selectedWorkoutLog.exercises?.[0]?.name || "Daily Session"}
                </h3>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-secondary)] font-body">
                  <span className="flex items-center gap-1">
                    <Clock size={16} /> {selectedWorkoutLog.duration_minutes || "--"} mins
                  </span>
                  <span>
                    • &nbsp; {selectedWorkoutLog.exercises?.length || 0} exercises
                  </span>
                  {calculateVolume(selectedWorkoutLog.exercises) > 0 && (
                    <span>
                      • &nbsp; Volume: {calculateVolume(selectedWorkoutLog.exercises).toLocaleString()} kg
                    </span>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push(`/workout/${selectedDate}`)}
              >
                View Log <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </Card>
        ) : (
          /* NO WORKOUT LOGGED STATE */
          <Card variant="surface" className="p-6 border-[#27272a]">
            {selectedDayNum >= 1 && selectedDayNum <= 6 && PHASE1_EXERCISES.length > 0 ? (
              /* ACTIVE TRAINING PLAN (MON/WED/FRI or PHASE 1 WORKOUT DAYS) */
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-[rgba(249,115,22,0.12)] text-[var(--accent-text)] border border-[rgba(249,115,22,0.2)]">
                        📋 Coach
                      </span>
                      <span className="text-[10px] font-body text-[var(--text-muted)] uppercase tracking-wider">
                        Phase {selectedPhaseNum} · Day {selectedDayNum}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-[var(--text-primary)] font-black mt-1.5">
                      PHASE 1 — FULL BODY
                    </h3>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => router.push(`/workout/log?date=${selectedDate}`)}
                  >
                    Start Workout <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>

                {/* Warm-Up Card */}
                <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                    <h4 className="font-display text-sm font-black text-[var(--accent-text)] uppercase tracking-wider flex items-center gap-2">
                      <span>🔥</span> WARM-UP PROTOCOL
                    </h4>
                    <span className="text-[10px] font-body-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--accent-start)]/10 text-[var(--accent-text)]">
                      ~6 Mins • 6 Steps
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {[
                      { num: "01", text: "3 min light cardio", detail: "Treadmill / Cross Trainer" },
                      { num: "02", text: "Arm circles", detail: "15 each direction" },
                      { num: "03", text: "Band pull-aparts", detail: "15 reps" },
                      { num: "04", text: "Push-ups", detail: "10–15 reps (slow & controlled)" },
                      { num: "05", text: "Light lateral raises", detail: "15 reps" },
                      { num: "06", text: "First exercise warm-up set", detail: "1 set at 50% working weight" },
                    ].map((step) => (
                      <div key={step.num} className="flex items-center gap-3 p-3 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] transition-colors">
                        <span className="w-7 h-7 rounded-lg bg-[var(--accent-start)]/10 text-[var(--accent-text)] flex items-center justify-center font-display text-xs font-black shrink-0">
                          {step.num}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-xs font-bold text-[var(--text-primary)] leading-tight">{step.text}</p>
                          <p className="font-body text-[10px] text-[var(--text-muted)] mt-0.5">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exercises List */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-black text-sm text-[var(--text-primary)] uppercase tracking-wider">
                        Main Exercises
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-body-bold bg-[#27272a]/60 text-[var(--text-secondary)]">
                        7 Exercises
                      </span>
                    </div>
                    <span className="text-[11px] font-body text-[var(--text-muted)] flex items-center gap-1">
                      ⏱️ Rest: <strong className="text-[var(--text-primary)]">60–90s</strong>
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {PHASE1_EXERCISES.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] transition-all duration-200 gap-2 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#09090b] border border-[#27272a] text-[var(--text-secondary)] flex items-center justify-center font-display text-xs font-black shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <h5 className="font-display text-sm font-black text-[var(--text-primary)] tracking-wide">
                              {ex.name}
                            </h5>
                            <span className="inline-block mt-0.5 text-[10px] font-body text-[var(--text-muted)]">
                              Target: <strong className="text-[var(--text-secondary)] font-medium">{ex.target}</strong>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span className="px-3 py-1 rounded-xl bg-[var(--accent-start)]/10 text-[var(--accent-text)] font-display text-xs font-bold tracking-wider">
                            ⚡ {ex.sets} SETS × {ex.repsRange} REPS
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cool-Down Card */}
                <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                    <h4 className="font-display text-sm font-black text-[var(--blue)] uppercase tracking-wider flex items-center gap-2">
                      <span>❄️</span> COOL-DOWN PROTOCOL
                    </h4>
                    <span className="text-[10px] font-body-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--blue)]/10 text-[var(--blue)]">
                      ~5 Mins • 5 Stretches
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {[
                      { num: "01", text: "Chest stretch (doorway)", detail: "30 sec each side" },
                      { num: "02", text: "Overhead tricep stretch", detail: "30 sec each arm" },
                      { num: "03", text: "Cross-body shoulder stretch", detail: "30 sec each arm" },
                      { num: "04", text: "Chest opener (clasped hands)", detail: "30 sec hold" },
                      { num: "05", text: "Neck rolls", detail: "30 sec slow movements" },
                    ].map((step) => (
                      <div key={step.num} className="flex items-center gap-3 p-3 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] transition-colors">
                        <span className="w-7 h-7 rounded-lg bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center font-display text-xs font-black shrink-0">
                          {step.num}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-xs font-bold text-[var(--text-primary)] leading-tight">{step.text}</p>
                          <p className="font-body text-[10px] text-[var(--text-muted)] mt-0.5">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedDayNum === 7 ? (
              /* REST DAY ACTIVE RECOVERY */
              <div className="flex flex-col items-center text-center py-4 space-y-3">
                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-full text-[var(--text-muted)]">
                  <Calendar size={28} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-[var(--text-primary)] font-black uppercase">
                    Rest Day 💤
                  </h3>
                  <p className="font-body text-sm font-body-bold text-[var(--text-secondary)] mt-2">
                    Recovery is part of the plan.
                  </p>
                  <p className="font-body text-xs text-[var(--text-muted)] mt-1.5 max-w-sm">
                    Focus on hydration, stretching, light walking, or mobility work. Allow your muscles to repair!
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => router.push(`/workout/log?date=${selectedDate}`)}
                >
                  Log Custom Workout anyway
                </Button>
              </div>
            ) : (
              /* PHASE 2 COMING SOON */
              <div className="flex flex-col items-center text-center py-6 space-y-3">
                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-full text-[var(--text-muted)]">
                  <Calendar size={28} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-[var(--text-primary)] font-black uppercase">
                    Coming Soon 🔒
                  </h3>
                  <p className="font-body text-sm font-body-bold text-[var(--text-secondary)] mt-2">
                    The next phase workout plan will be added here.
                  </p>
                  <p className="font-body text-xs text-[var(--text-muted)] mt-1.5 max-w-sm">
                    Log a custom workout for now.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  className="mt-2"
                  onClick={() => router.push(`/workout/log?date=${selectedDate}`)}
                >
                  Log Custom Workout
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Recent History */}
      <div className="space-y-3">
        <h2 className="font-display text-base tracking-wider text-[var(--text-muted)] uppercase">
          Recent History
        </h2>

        {initialWorkouts.length > 0 ? (
          <div className="space-y-3">
            {initialWorkouts.slice(0, 5).map((log) => {
              const formattedDate = new Date(log.logged_at).toLocaleDateString(
                "en-US",
                { weekday: "short", month: "short", day: "numeric" }
              );
              const vol = calculateVolume(log.exercises);

              return (
                <Card
                  key={log.id}
                  variant="surface"
                  className="p-4 flex items-center justify-between hover:border-[var(--accent-start)]/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/workout/${log.logged_at}`)}
                >
                  <div className="space-y-1">
                    <h4 className="font-body-bold text-sm text-[var(--text-primary)]">
                      {log.exercises?.[0]?.name || "Strength Workout"}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-body">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Clock size={14} /> {log.duration_minutes || "--"} mins
                      </span>
                      <span>•</span>
                      <span>{log.exercises?.length || 0} exercises</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {vol > 0 && (
                      <div className="text-right">
                        <p className="font-display text-base text-[var(--text-primary)] leading-none">
                          {vol.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-[var(--text-muted)] font-body uppercase">kg volume</p>
                      </div>
                    )}
                    <ArrowRight size={18} className="text-[var(--text-muted)]" />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-surface)]">
            <Barbell size={32} className="mx-auto text-[var(--text-muted)]" />
            <p className="text-xs font-body text-[var(--text-secondary)] mt-2">No workouts logged yet</p>
            <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">Click Start Workout above to begin!</p>
          </div>
        )}
      </div>

    </div>
  );
}
