"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProgramBadge } from "@/components/ui/ProgramBadge";
import { BADGES } from "@/lib/badges";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface BadgesClientProps {
  earnedList: { badge_id: string; earned_at: string }[];
  stats: {
    workout_count: number;
    workout_streak: number;
    nutrition_streak: number;
    water_goal_streak: number;
    program_day: number;
    workout_days_missed: number;
  };
}

export function BadgesClient({ earnedList, stats }: BadgesClientProps) {
  const earnedSet = new Map<string, string>(
    earnedList.map((item) => [item.badge_id, item.earned_at])
  );

  const totalBadges = BADGES.length;
  const earnedCount = earnedSet.size;

  const getProgressText = (badgeId: string) => {
    switch (badgeId) {
      case "first_spark":
        return `${Math.min(stats.workout_count, 1)}/1 day`;
      case "week_warrior":
        return `${Math.min(stats.workout_count, 7)}/7 workouts`;
      case "clean_machine":
        return `${Math.min(stats.nutrition_streak, 7)}/7 days`;
      case "iron_will":
        return `${Math.min(stats.workout_streak, 14)}/14 days`;
      case "golden_run":
        return `${Math.min(stats.workout_streak, 21)}/21 days`;
      case "phase_champ":
        return stats.program_day > 35 ? "Completed" : "Phase 2 required";
      case "hydration_hero":
        return `${Math.min(stats.water_goal_streak, 30)}/30 days`;
      case "no_mercy":
        if (stats.workout_days_missed > 0) {
          return "Missed a workout";
        }
        return `Day ${Math.min(stats.program_day, 30)}/30`;
      default:
        return "";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const badgeCardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 14,
      },
    },
  };

  const earnedBadges = BADGES.filter((b) => earnedSet.has(b.id));
  const lockedBadges = BADGES.filter((b) => !earnedSet.has(b.id));

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide">
          ACHIEVEMENTS
        </h1>
        <p className="font-body text-xs font-body-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
          {earnedCount} of {totalBadges} earned
        </p>
      </div>

      {/* Earned Badges Section */}
      <div className="space-y-4">
        <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] font-black uppercase">
          Earned Badges
        </h2>
        {earnedBadges.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {earnedBadges.map((badge, index) => {
              const earnedAt = earnedSet.get(badge.id);
              const formattedDate = earnedAt
                ? new Date(earnedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <motion.div key={badge.id} variants={badgeCardVariants}>
                  <motion.div
                    animate={{ y: [-4, 0, -4] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.15,
                    }}
                  >
                    <Card
                      variant="surface"
                      className="p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[var(--accent-start)]/40 transition-colors border border-[var(--border)]"
                    >
                      {/* Glow background effect */}
                      <div className="absolute -inset-10 bg-gradient-to-br from-[var(--accent-start)]/5 to-[var(--accent-end)]/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-full pointer-events-none" />

                      <ProgramBadge badgeId={badge.id} earned={true} size={90} delay={index * 0.4} />

                      <div className="mt-3 text-center space-y-1 relative z-10">
                        <span className="block font-body text-[9px] font-body-bold text-[var(--green)] uppercase tracking-widest bg-[rgba(16,185,129,0.08)] border border-[var(--green)]/15 px-2 py-0.5 rounded-full mx-auto w-max">
                          Unlocked
                        </span>
                        {formattedDate && (
                          <span className="block font-body text-[9px] text-[var(--text-muted)]">
                            {formattedDate}
                          </span>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="py-10 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-surface)]">
            <p className="text-xs font-body text-[var(--text-secondary)]">
              No badges earned yet.
            </p>
            <p className="text-[10px] font-body text-[var(--text-muted)] mt-0.5">
              Keep checking off your daily goals to unlock your first spark!
            </p>
          </div>
        )}
      </div>

      {/* Locked Badges Section */}
      <div className="space-y-4">
        <h2 className="font-display text-lg tracking-wider text-[var(--text-muted)] font-black uppercase">
          Locked Badges
        </h2>
        {lockedBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
             {lockedBadges.map((badge, index) => {
               const progressText = getProgressText(badge.id);
               const failed = progressText === "Missed a workout";

               return (
                 <motion.div
                   key={badge.id}
                   animate={{ y: [-4, 0, -4] }}
                   transition={{
                     duration: 4,
                     repeat: Infinity,
                     ease: "easeInOut",
                     delay: (earnedBadges.length + index) * 0.15,
                   }}
                 >
                   <Card
                     variant="surface"
                     className="p-5 flex flex-col items-center justify-center border border-[var(--border)] bg-[var(--bg-surface)]/60"
                   >
                     <ProgramBadge badgeId={badge.id} earned={false} size={90} />

                     <div className="mt-4 text-center w-full space-y-1">
                       <span
                         className={cn(
                           "inline-block font-body text-[9px] font-body-bold px-2.5 py-0.5 rounded-full border",
                           failed
                             ? "bg-[rgba(239,68,68,0.06)] text-[var(--red)] border-[var(--red)]/15"
                             : "bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border)]"
                         )}
                       >
                         {progressText}
                       </span>
                     </div>
                   </Card>
                 </motion.div>
               );
             })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-body text-[var(--green)]">
            🎉 Amazing! You have unlocked all badges!
          </div>
        )}
      </div>
    </div>
  );
}
