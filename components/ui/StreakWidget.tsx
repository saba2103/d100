"use client";

import React from "react";
import { Flame } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

interface StreakWidgetProps {
  streak: number;
  className?: string;
  variant?: "default" | "glass";
}

export function StreakWidget({ streak, className, variant = "default" }: StreakWidgetProps) {
  const hasStreak = streak > 0;
  const isGlass = variant === "glass";

  return (
    <div
      className={cn(
        isGlass
          ? "flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-white"
          : "flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-200",
        className
      )}
    >
      {/* Flame Icon with Pulse Animation */}
      <div className="relative shrink-0">
        {hasStreak ? (
          <>
            {/* Pulsating outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={cn(
                "absolute inset-0 rounded-full blur-md",
                isGlass ? "bg-white" : "bg-[var(--accent-start)]"
              )}
            />
            <div
              className={cn(
                "relative p-3.5 rounded-full",
                isGlass
                  ? "bg-white/20 text-white"
                  : "bg-gradient-to-br from-[var(--accent-start)]/20 to-[var(--accent-end)]/10 text-[var(--accent-text)]"
              )}
            >
              <Flame size={isGlass ? 24 : 32} weight="fill" className={cn(!isGlass && hasStreak && "streak-flame-active")} />
            </div>
          </>
        ) : (
          <div className={cn(
            "p-3.5 rounded-full",
            isGlass ? "bg-white/10 text-white/40" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
          )}>
            <Flame size={isGlass ? 24 : 32} weight="regular" />
          </div>
        )}
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "font-display text-4xl leading-none",
            isGlass ? "text-white" : "text-[var(--text-primary)]"
          )}>
            {streak}
          </span>
          <span className={cn(
            "font-body font-body-bold text-xs uppercase tracking-wider",
            isGlass ? "text-white/60" : "text-[var(--text-muted)]"
          )}>
            Day Streak
          </span>
        </div>
        <p className={cn(
          "mt-0.5 text-xs font-body truncate",
          isGlass ? "text-white/80" : "text-[var(--text-secondary)]"
        )}>
          {hasStreak ? "Keep it going!" : "Start today!"}
        </p>
      </div>
    </div>
  );
}
