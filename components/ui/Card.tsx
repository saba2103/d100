"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { motion, type HTMLMotionProps } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────
type CardVariant = "default" | "surface" | "elevated" | "gradient";

interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

// ── Styles ─────────────────────────────────────────────────────────
const variants: Record<CardVariant, string> = {
  default: "bg-[var(--bg-base)] border border-[var(--border)]",
  surface: "bg-[var(--bg-surface)] border border-[var(--border)]",
  elevated: "bg-[var(--bg-elevated)] border border-[var(--border)]",
  gradient: "bg-gradient-to-br from-[var(--accent-start)]/10 to-[var(--accent-end)]/5 border border-[var(--accent-start)]/20",
};

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

// ── Card Component ──────────────────────────────────────────────────
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "surface",
      hoverable = false,
      padding = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-200",
          variants[variant],
          paddings[padding],
          hoverable && "cursor-pointer desktop-card-hover hover:border-[var(--accent-start)]/30",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

// ── HeroCard Component ──────────────────────────────────────────────
interface HeroCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode;
}

const HeroCard = forwardRef<HTMLDivElement, HeroCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] text-white shadow-xl shadow-[var(--accent-start)]/10 overflow-hidden relative",
          className
        )}
        {...props}
      >
        {/* Subtle decorative background glow shape */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);
HeroCard.displayName = "HeroCard";

export { Card, HeroCard };
export type { CardProps, CardVariant, HeroCardProps };
