"use client";

import React, { useEffect, useState, useRef } from "react";
import { ArrowUpRight, ArrowDownRight, Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import { motion, useInView } from "framer-motion";
import { CountUp } from "./CountUp";


// Color helper mapping for Tailwind config and custom properties
const colorMap = {
  red: {
    text: "text-[var(--red)]",
    bgSoft: "bg-[var(--red-soft)]",
    stroke: "var(--red)",
  },
  green: {
    text: "text-[var(--green)]",
    bgSoft: "bg-[var(--green-soft)]",
    stroke: "var(--green)",
  },
  blue: {
    text: "text-[var(--blue)]",
    bgSoft: "bg-[var(--blue-soft)]",
    stroke: "var(--blue)",
  },
  purple: {
    text: "text-[var(--purple)]",
    bgSoft: "bg-[var(--purple-soft)]",
    stroke: "var(--purple)",
  },
  amber: {
    text: "text-[var(--amber)]",
    bgSoft: "bg-[var(--amber-soft)]",
    stroke: "var(--amber)",
  },
  orange: {
    text: "text-[var(--accent-text)]",
    bgSoft: "bg-[rgba(249,115,22,0.12)]",
    stroke: "var(--accent-start)",
  },
};

type StatColor = "red" | "green" | "blue" | "purple" | "amber" | "orange";

// ── StatCard ────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: Icon;
  color?: StatColor;
  trend?: string;
  trendDirection?: "up" | "down";
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon: IconComponent,
  color = "orange",
  trend,
  trendDirection = "up",
  className,
}: StatCardProps) {
  const currentColors = colorMap[color] || colorMap.orange;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        {/* Label */}
        <span className="font-body text-xs uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </span>

        {/* Icon with soft circular background */}
        {IconComponent && (
          <div className={cn("p-2 rounded-xl shrink-0", currentColors.bgSoft, currentColors.text)}>
            <IconComponent size={20} weight="fill" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-4xl leading-none text-[var(--text-primary)]">
          {typeof value === "number" ? (
            <CountUp value={value} />
          ) : typeof value === "string" && !isNaN(Number(value)) && value.trim() !== "" ? (
            <CountUp value={Number(value)} />
          ) : (
            value
          )}
        </span>
        {unit && (
          <span className="font-body text-sm text-[var(--text-muted)] lowercase">
            {unit}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trendDirection === "up" ? (
            <ArrowUpRight size={14} className="text-[var(--green)]" />
          ) : (
            <ArrowDownRight size={14} className="text-[var(--red)]" />
          )}
          <span
            className={cn(
              "font-body text-xs font-body-bold",
              trendDirection === "up" ? "text-[var(--green)]" : "text-[var(--red)]"
            )}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

// ── StatRing ────────────────────────────────────────────────────────
interface StatRingProps {
  value: number; // 0 to 100
  size?: number; // size in px, defaults to 80
  strokeWidth?: number;
  color?: StatColor;
  label?: string;
  centerContent?: React.ReactNode;
  className?: string;
}

export function StatRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = "orange",
  label,
  centerContent,
  className,
}: StatRingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(Math.min(Math.max(value, 0), 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const currentColors = colorMap[color] || colorMap.orange;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-[var(--border)] fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Foreground Animated Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={currentColors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerContent || (
            <span className="font-display text-lg text-[var(--text-primary)]">
              {Math.round(value)}%
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="font-body text-xs text-[var(--text-muted)] font-medium">
          {label}
        </span>
      )}
    </div>
  );
}

// ── StatBar ─────────────────────────────────────────────────────────
interface StatBarProps {
  value: number; // 0 to 100
  color?: StatColor;
  animated?: boolean;
  className?: string;
}

export function StatBar({ value, color = "orange", animated = true, className }: StatBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const currentColors = colorMap[color] || colorMap.orange;

  const targetWidth = Math.min(Math.max(value, 0), 100);

  return (
    <div
      ref={ref}
      className={cn("w-full h-2 bg-[var(--border)] rounded-full overflow-hidden", className)}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={animated && isInView ? { width: `${targetWidth}%` } : animated ? { width: 0 } : { width: `${targetWidth}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          background:
            color === "orange"
              ? "linear-gradient(90deg, var(--accent-start), var(--accent-end))"
              : currentColors.stroke,
        }}
      />
    </div>
  );
}
