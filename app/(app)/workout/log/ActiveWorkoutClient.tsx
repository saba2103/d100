"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppUser } from "@/lib/contexts/AppContext";
import { triggerBadgeCheck } from "@/lib/utils/achievementsClient";
import {
  Clock,
  Plus,
  Trash,
  Check,
  CheckCircle,
  Warning,
  Sparkle,
  PlusCircle,
  ArrowLeft,
  Timer,
  Play,
  Pause,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Misc";

interface ActiveWorkoutClientProps {
  profile: any;
  lastWorkout: any;
  currentWorkout: any;
  targetDate: string;
  isEditing: boolean;
}

interface SetRow {
  reps: string;
  weight_kg: string;
  completed: boolean;
}

interface ExerciseItem {
  name: string;
  sets: SetRow[];
}

import { COACH_WORKOUT_PLAN } from "@/lib/workoutPlan";

const PHASE1_PLAN: any[] = COACH_WORKOUT_PLAN;

const WARM_UP_EXERCISES = [
  "3 min light cardio (treadmill/cross trainer)",
  "Arm circles — 15 each direction",
  "Band pull-aparts — 15 reps",
  "Push-ups — 10–15 reps (slow, controlled)",
  "Light lateral raises — 15 reps",
  "1 warm-up set of first exercise at 50% weight"
];

const COOL_DOWN_EXERCISES = [
  "Chest stretch (doorway) — 30 sec each side",
  "Overhead tricep stretch — 30 sec each arm",
  "Cross-body shoulder stretch — 30 sec each arm",
  "Chest opener (hands clasped behind back) — 30 sec",
  "Neck rolls — 30 sec"
];

export function ActiveWorkoutClient({
  profile,
  lastWorkout,
  currentWorkout,
  targetDate,
  isEditing,
}: ActiveWorkoutClientProps) {
  const router = useRouter();
  const { activeProfile } = useAppUser();

  // Stopwatch States
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Rest Timer States
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [restConfig, setRestConfig] = useState(60); // 60s default rest

  // Modal States
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");

  // Warm-up and Cool-down checked states
  const [completedWarmUp, setCompletedWarmUp] = useState<boolean[]>(() => {
    if (isEditing && currentWorkout?.notes) {
      try {
        const parsed = JSON.parse(currentWorkout.notes);
        if (Array.isArray(parsed.warmup) && parsed.warmup.length === WARM_UP_EXERCISES.length) {
          return parsed.warmup;
        }
      } catch (e) {
        // Fallback
      }
    }
    return Array(WARM_UP_EXERCISES.length).fill(false);
  });

  const [completedCoolDown, setCompletedCoolDown] = useState<boolean[]>(() => {
    if (isEditing && currentWorkout?.notes) {
      try {
        const parsed = JSON.parse(currentWorkout.notes);
        if (Array.isArray(parsed.cooldown) && parsed.cooldown.length === COOL_DOWN_EXERCISES.length) {
          return parsed.cooldown;
        }
      } catch (e) {
        // Fallback
      }
    }
    return Array(COOL_DOWN_EXERCISES.length).fill(false);
  });

  const programDay = React.useMemo(() => {
    if (!profile?.program_start_date) return 1;
    const start = new Date(profile.program_start_date);
    start.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [profile?.program_start_date, targetDate]);

  const showCoachPlan = programDay >= 1 && programDay <= 6;

  // Exercises State
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => {
    if (isEditing && currentWorkout?.exercises) {
      return (currentWorkout.exercises as any[]).map((ex) => ({
        name: ex.name,
        sets: (ex.sets || []).map((s: any) => ({
          reps: s.reps?.toString() || "",
          weight_kg: s.weight_kg?.toString() || "",
          completed: s.completed || false,
        })),
      }));
    }

    if (showCoachPlan && PHASE1_PLAN.length > 0) {
      // Default to Phase 1 Coach Plan
      return PHASE1_PLAN.map((p) => ({
        name: p.name,
        sets: Array.from({ length: p.sets }, () => ({
          reps: p.reps,
          weight_kg: p.weight || "",
          completed: false,
        })),
      }));
    }

    return []; // Empty start for rest/custom days
  });

  // Compile last session metrics lookup map
  const lastSessionMap = useRef<Record<string, any[]>>({});
  useEffect(() => {
    if (lastWorkout?.exercises) {
      const map: Record<string, any[]> = {};
      (lastWorkout.exercises as any[]).forEach((ex) => {
        map[ex.name] = ex.sets || [];
      });
      lastSessionMap.current = map;
    }
  }, [lastWorkout]);

  // Stopwatch Effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Rest Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (restTimeLeft !== null && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restTimeLeft === 0) {
      setRestTimeLeft(null);
      // Play a subtle tone or notify (using browser notification API if supported)
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]); // Vibrate mobile device
      }
    }
    return () => clearInterval(interval);
  }, [restTimeLeft]);

  const formatStopwatch = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Exercise management actions
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newExerciseName.trim();
    if (!name) return;

    setExercises((prev) => [
      ...prev,
      {
        name,
        sets: [{ reps: "", weight_kg: "", completed: false }],
      },
    ]);

    setIsAddExerciseModalOpen(false);
    setNewExerciseName("");
  };

  const handleRemoveExercise = (exIdx: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== exIdx));
  };

  const handleAddSet = (exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== exIdx) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              reps: lastSet?.reps || "",
              weight_kg: lastSet?.weight_kg || "",
              completed: false,
            },
          ],
        };
      })
    );
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== exIdx) return ex;
        // Keep at least one set row
        if (ex.sets.length <= 1) return ex;
        return {
          ...ex,
          sets: ex.sets.filter((_, sIdx) => sIdx !== setIdx),
        };
      })
    );
  };

  const handleUpdateSetField = (
    exIdx: number,
    setIdx: number,
    field: "reps" | "weight_kg",
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, sIdx) => {
            if (sIdx !== setIdx) return set;
            return {
              ...set,
              [field]: value,
            };
          }),
        };
      })
    );
  };

  const handleToggleSetCompleted = (exIdx: number, setIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, sIdx) => {
            if (sIdx !== setIdx) return set;
            const nextCompleted = !set.completed;
            
            // Trigger 60s rest timer on complete
            if (nextCompleted) {
              setRestTimeLeft(restConfig);
            }

            return {
              ...set,
              completed: nextCompleted,
            };
          }),
        };
      })
    );
  };

  // Submit Workout Log
  const handleFinishWorkout = async () => {
    const supabase = createClient();

    // Map rows to database models, skipping incomplete sets if empty
    const payloadExercises = exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets.map((s) => ({
        reps: parseInt(s.reps, 10) || 0,
        weight_kg: parseFloat(s.weight_kg) || 0,
        completed: s.completed,
      })),
    }));

    const duration = Math.ceil(secondsElapsed / 60);
    const notesPayload = JSON.stringify({
      warmup: completedWarmUp,
      cooldown: completedCoolDown,
    });

    let dbRes;
    if (isEditing && currentWorkout?.id) {
      dbRes = await supabase
        .from("workout_logs")
        .update({
          exercises: payloadExercises,
          duration_minutes: duration,
          notes: notesPayload,
        })
        .eq("id", currentWorkout.id);
    } else {
      // Upsert check for current date
      if (currentWorkout?.id) {
        dbRes = await supabase
          .from("workout_logs")
          .update({
            exercises: payloadExercises,
            duration_minutes: duration,
            notes: notesPayload,
          })
          .eq("id", currentWorkout.id);
      } else {
        dbRes = await supabase.from("workout_logs").insert({
          user_id: profile.id,
          logged_at: targetDate,
          phase: 1, // Phase 1 default
          exercises: payloadExercises,
          duration_minutes: duration,
          notes: notesPayload,
          profile_tag: activeProfile,
        });
      }
    }

    if (!dbRes.error) {
      fetch("/api/events/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "workout_completed",
          profileTag: activeProfile,
          dayNumber: 1,
        }),
      }).catch(() => {});

      await triggerBadgeCheck();
      router.push("/workout");
      router.refresh();
    } else {
      alert("Failed to save workout: " + dbRes.error.message);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      
      {/* Top sticky timer bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between py-3 px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-[var(--accent-text)]" />
          <span className="font-display text-2xl font-black text-[var(--text-primary)] leading-none select-none">
            {formatStopwatch(secondsElapsed)}
          </span>
          <button
            onClick={() => setTimerActive(!timerActive)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-1"
          >
            {timerActive ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>

        {/* Floating Rest Countdown Timer */}
        {restTimeLeft !== null ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1 bg-[rgba(249,115,22,0.12)] border border-[rgba(249,115,22,0.25)] rounded-full text-xs font-body font-body-bold text-[var(--accent-text)]"
          >
            <Timer size={14} className="animate-pulse" />
            <span>Rest: {restTimeLeft}s</span>
            <button
              onClick={() => setRestTimeLeft(null)}
              className="ml-1 text-[10px] uppercase font-medium hover:underline text-[var(--text-muted)]"
            >
              Skip
            </button>
          </motion.div>
        ) : (
          <span className="text-[10px] text-[var(--text-muted)] font-body uppercase">
            Active Log
          </span>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => setIsDiscardModalOpen(true)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleFinishWorkout}
          >
            Finish
          </Button>
        </div>
      </div>

      {/* Warm-Up Card */}
      {showCoachPlan && PHASE1_PLAN.length > 0 && (
        <Card variant="surface" className="p-5 bg-[#18181b] border border-[#27272a] space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <h3 className="font-display text-sm font-black text-[var(--accent-text)] uppercase tracking-wider flex items-center gap-2">
              <span>🔥</span> WARM-UP PROTOCOL
            </h3>
            <span className="text-[10px] font-body-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--accent-start)]/10 text-[var(--accent-text)]">
              ~6 Mins • Tap to Check
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {WARM_UP_EXERCISES.map((exercise, index) => {
              const isChecked = completedWarmUp[index];
              const numStr = String(index + 1).padStart(2, '0');
              return (
                <div
                  key={index}
                  onClick={() => {
                    const updated = [...completedWarmUp];
                    updated[index] = !updated[index];
                    setCompletedWarmUp(updated);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                    isChecked
                      ? "bg-[rgba(249,115,22,0.12)] border-[rgba(249,115,22,0.3)] text-[var(--text-muted)]"
                      : "bg-[#09090b] border-[#27272a] hover:border-[#3f3f46] text-[var(--text-primary)]"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center font-display text-[10px] font-black shrink-0 transition-colors",
                      isChecked
                        ? "bg-[var(--accent-start)] text-white"
                        : "bg-[var(--accent-start)]/10 text-[var(--accent-text)]"
                    )}
                  >
                    {isChecked ? <Check size={12} weight="bold" /> : numStr}
                  </span>
                  <span
                    className={cn(
                      "font-body text-xs font-medium leading-snug transition-colors flex-1",
                      isChecked && "line-through opacity-75"
                    )}
                  >
                    {exercise}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Main exercises workspace */}
      <div className="space-y-4">
        {exercises.map((ex, exIdx) => {
          const prevSets = lastSessionMap.current[ex.name] || [];

          return (
            <Card key={exIdx} variant="surface" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-black text-[var(--text-primary)]">
                    {ex.name}
                  </h3>
                  {(() => {
                    const planItem = PHASE1_PLAN.find((p) => p.name === ex.name);
                    if (planItem && showCoachPlan) {
                      return (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-body bg-[rgba(249,115,22,0.08)] text-[var(--accent-text)] border border-[rgba(249,115,22,0.15)]">
                          📋 Coach: {planItem.sets} sets × {planItem.repsRange} ({planItem.target})
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                {!PHASE1_PLAN.some((p) => p.name === ex.name && showCoachPlan) && (
                  <button
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                    aria-label="Remove exercise"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>

              {/* Set headers */}
              <div className="grid grid-cols-12 gap-3 text-[10px] font-body font-body-bold text-[var(--text-muted)] uppercase tracking-wider px-2">
                <span className="col-span-2 text-center">Set</span>
                <span className="col-span-3">Reps</span>
                <span className="col-span-4">Weight (kg)</span>
                <span className="col-span-3 text-center">Done</span>
              </div>

              {/* Set rows */}
              <div className="space-y-2">
                {ex.sets.map((set, setIdx) => {
                  const isChecked = set.completed;
                  const prevSet = prevSets[setIdx];

                  return (
                    <motion.div
                      key={setIdx}
                      className={cn(
                        "grid grid-cols-12 gap-3 items-center p-1.5 rounded-xl border transition-all duration-150",
                        isChecked
                          ? "bg-[rgba(16,185,129,0.06)] border-[var(--green)]/30"
                          : "bg-[var(--bg-base)] border-[var(--border)]"
                      )}
                    >
                      {/* Set Number */}
                      <span className="col-span-2 text-center font-display text-sm font-bold text-[var(--text-secondary)]">
                        {setIdx + 1}
                      </span>

                      {/* Reps Input */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set.reps}
                          placeholder={prevSet?.reps?.toString() || "10"}
                          onChange={(e) =>
                            handleUpdateSetField(exIdx, setIdx, "reps", e.target.value)
                          }
                          className="w-full text-center font-body text-sm py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] transition-colors"
                        />
                      </div>

                      {/* Weight Input */}
                      <div className="col-span-4 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="any"
                          inputMode="decimal"
                          value={set.weight_kg}
                          placeholder={prevSet?.weight_kg?.toString() || "0"}
                          onChange={(e) =>
                            handleUpdateSetField(exIdx, setIdx, "weight_kg", e.target.value)
                          }
                          className="w-full text-center font-body text-sm py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] transition-colors"
                        />
                      </div>

                      {/* Completion check / Action */}
                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSetCompleted(exIdx, setIdx)}
                          className={cn(
                            "h-7 w-7 rounded-lg border flex items-center justify-center transition-all",
                            isChecked
                              ? "bg-[var(--green)] border-[var(--green)] text-white"
                              : "border-[var(--border)] hover:border-[var(--accent-start)]/50"
                          )}
                        >
                          {isChecked && <Check size={14} weight="bold" />}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(exIdx, setIdx)}
                          className="text-[var(--text-muted)] hover:text-[var(--red)] transition-colors p-1"
                          disabled={ex.sets.length <= 1}
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add set button */}
              <button
                onClick={() => handleAddSet(exIdx)}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[var(--border)] rounded-xl text-xs font-body text-[var(--text-secondary)] hover:border-[var(--accent-start)]/50 transition-colors"
              >
                <Plus size={14} /> Add Set
              </button>
            </Card>
          );
        })}

        {/* Cool-Down Card */}
        {showCoachPlan && PHASE1_PLAN.length > 0 && (
          <Card variant="surface" className="p-5 bg-[#18181b] border border-[#27272a] space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-display text-sm font-black text-[var(--blue)] uppercase tracking-wider flex items-center gap-2">
                <span>❄️</span> COOL-DOWN PROTOCOL
              </h3>
              <span className="text-[10px] font-body-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--blue)]/10 text-[var(--blue)]">
                ~5 Mins • Tap to Check
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {COOL_DOWN_EXERCISES.map((exercise, index) => {
                const isChecked = completedCoolDown[index];
                const numStr = String(index + 1).padStart(2, '0');
                return (
                  <div
                    key={index}
                    onClick={() => {
                      const updated = [...completedCoolDown];
                      updated[index] = !updated[index];
                      setCompletedCoolDown(updated);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                      isChecked
                        ? "bg-[rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.3)] text-[var(--text-muted)]"
                        : "bg-[#09090b] border-[#27272a] hover:border-[#3f3f46] text-[var(--text-primary)]"
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center font-display text-[10px] font-black shrink-0 transition-colors",
                        isChecked
                          ? "bg-[var(--blue)] text-white"
                          : "bg-[var(--blue)]/10 text-[var(--blue)]"
                      )}
                    >
                      {isChecked ? <Check size={12} weight="bold" /> : numStr}
                    </span>
                    <span
                      className={cn(
                        "font-body text-xs font-medium leading-snug transition-colors flex-1",
                        isChecked && "line-through opacity-75"
                      )}
                    >
                      {exercise}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Bottom add actions */}
      <div className="pt-2">
        <Button
          fullWidth
          variant="secondary"
          onClick={() => setIsAddExerciseModalOpen(true)}
        >
          <PlusCircle size={18} weight="fill" className="mr-1" /> Add Custom Exercise
        </Button>
      </div>

      {/* MODALS */}

      {/* 1. Add Custom Exercise Modal */}
      <Modal
        isOpen={isAddExerciseModalOpen}
        onClose={() => setIsAddExerciseModalOpen(false)}
        title="ADD EXERCISE"
      >
        <form onSubmit={handleAddExercise} className="space-y-4 pt-2">
          <Input
            label="Exercise Name"
            id="new-exercise-name-input"
            type="text"
            placeholder="e.g. Kettlebell Swing"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            required
            autoFocus
          />

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => setIsAddExerciseModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant="primary"
              type="submit"
            >
              Add
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Discard Workout Confirmation Modal */}
      <Modal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        title="DISCARD WORKOUT?"
      >
        <div className="space-y-4 pt-2 text-center">
          <Warning size={48} className="mx-auto text-[var(--red)]" />
          <p className="font-body text-sm text-[var(--text-secondary)]">
            Are you sure you want to discard this workout? All sets logged in this active session will be permanently lost.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => setIsDiscardModalOpen(false)}
            >
              Go Back
            </Button>
            <Button
              className="flex-1"
              variant="danger"
              onClick={() => {
                setIsDiscardModalOpen(false);
                router.push("/workout");
              }}
            >
              Discard Log
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
