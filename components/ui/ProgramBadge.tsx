"use client";

import React from "react";
import {
  Fire,
  SealCheck,
  Leaf,
  Lightning,
  Trophy,
  Crown,
  Drop,
  Skull,
  Lock,
  Icon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";

// Icon mapping based on badges config
const ICON_MAP: Record<string, Icon> = {
  fire: Fire,
  "seal-check": SealCheck,
  leaf: Leaf,
  lightning: Lightning,
  trophy: Trophy,
  crown: Crown,
  drop: Drop,
  skull: Skull,
};

export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  shape: "hex" | "circle" | "shield" | "square";
  color: "bronze" | "silver" | "emerald" | "steel" | "gold" | "purple" | "sapphire" | "crimson";
  icon: Icon;
  gradient: {
    start: string;
    end: string;
    glow: string;
  };
}

// Keep BADGE_CONFIGS exported for backwards compatibility with AchievementCelebrator.tsx and design-system/page.tsx
export const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  first_spark: {
    id: "first_spark",
    name: "First Spark",
    description: "Complete Day 1",
    shape: "hex",
    color: "bronze",
    icon: Fire,
    gradient: { start: "#7C4A1E", end: "#C87941", glow: "#C87941" },
  },
  week_warrior: {
    id: "week_warrior",
    name: "Week Warrior",
    description: "7 workouts done",
    shape: "circle",
    color: "silver",
    icon: SealCheck,
    gradient: { start: "#6B7280", end: "#9CA3AF", glow: "#9CA3AF" },
  },
  clean_machine: {
    id: "clean_machine",
    name: "Clean Machine",
    description: "7 days clean eating",
    shape: "shield",
    color: "emerald",
    icon: Leaf,
    gradient: { start: "#065F46", end: "#059669", glow: "#10B981" },
  },
  iron_will: {
    id: "iron_will",
    name: "Iron Will",
    description: "14 day streak",
    shape: "hex",
    color: "steel",
    icon: Lightning,
    gradient: { start: "#1E3A5F", end: "#2563EB", glow: "#3B82F6" },
  },
  golden_run: {
    id: "golden_run",
    name: "Golden Run",
    description: "21 days straight",
    shape: "square",
    color: "gold",
    icon: Trophy,
    gradient: { start: "#92400E", end: "#D97706", glow: "#F59E0B" },
  },
  phase_champ: {
    id: "phase_champ",
    name: "Phase Champ",
    description: "Complete Phase 1",
    shape: "circle",
    color: "purple",
    icon: Crown,
    gradient: { start: "#4C1D95", end: "#7C3AED", glow: "#8B5CF6" },
  },
  hydration_hero: {
    id: "hydration_hero",
    name: "Hydration Hero",
    description: "30 days hitting water goal",
    shape: "shield",
    color: "sapphire",
    icon: Drop,
    gradient: { start: "#1E3A5F", end: "#1D4ED8", glow: "#3B82F6" },
  },
  no_mercy: {
    id: "no_mercy",
    name: "No Mercy",
    description: "Never missed a workout",
    shape: "hex",
    color: "crimson",
    icon: Skull,
    gradient: { start: "#7F1D1D", end: "#DC2626", glow: "#EF4444" },
  },
};

interface Palette {
  outerStart: string;
  outerEnd: string;
  innerStart: string;
  innerEnd: string;
  glowColor: string;
}

const COLOR_PALETTES: Record<string, Palette> = {
  bronze: { outerStart: "#7C4A1E", outerEnd: "#C87941", innerStart: "#A0622A", innerEnd: "#E8954A", glowColor: "#C87941" },
  silver: { outerStart: "#6B7280", outerEnd: "#9CA3AF", innerStart: "#9CA3AF", innerEnd: "#D1D5DB", glowColor: "#9CA3AF" },
  emerald: { outerStart: "#065F46", outerEnd: "#059669", innerStart: "#059669", innerEnd: "#34D399", glowColor: "#10B981" },
  steel: { outerStart: "#1E3A5F", outerEnd: "#2563EB", innerStart: "#1D4ED8", innerEnd: "#60A5FA", glowColor: "#3B82F6" },
  gold: { outerStart: "#92400E", outerEnd: "#D97706", innerStart: "#B45309", innerEnd: "#FCD34D", glowColor: "#F59E0B" },
  purple: { outerStart: "#4C1D95", outerEnd: "#7C3AED", innerStart: "#6D28D9", innerEnd: "#A78BFA", glowColor: "#8B5CF6" },
  sapphire: { outerStart: "#1E3A5F", outerEnd: "#1D4ED8", innerStart: "#1E40AF", innerEnd: "#93C5FD", glowColor: "#3B82F6" },
  crimson: { outerStart: "#7F1D1D", outerEnd: "#DC2626", innerStart: "#B91C1C", innerEnd: "#FCA5A5", glowColor: "#EF4444" },
};

interface ProgramBadgeProps {
  badgeId: keyof typeof BADGE_CONFIGS;
  earned?: boolean;
  size?: number; // default width/height
  delay?: number; // animation delay in seconds
  className?: string;
}

export function ProgramBadge({
  badgeId,
  earned = false,
  size = 80,
  delay = 0,
  className,
}: ProgramBadgeProps) {
  const config = BADGE_CONFIGS[badgeId];
  if (!config) return null;

  const { shape, color } = config;
  const IconComponent = config.icon;
  const palette = COLOR_PALETTES[color];

  return (
    <div
      className={cn("flex flex-col items-center text-center select-none", className)}
      style={{ width: size }}
    >
      {/* Shared global filter style if not already globally included */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="badge-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
      </svg>

      <style>{`
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .earned-badge-animate {
          animation: badgeFloat 3s ease-in-out infinite;
        }
      `}</style>

      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-300",
          earned
            ? "earned-badge-animate filter drop-shadow-[0_4px_12px_var(--badge-glow-shadow)] scale-100 hover:scale-105"
            : "grayscale opacity-40 contrast-75 brightness-75 scale-95"
        )}
        style={{
          width: size,
          height: size,
          animationDelay: earned ? `${delay}s` : undefined,
          "--badge-glow-shadow": palette.glowColor + "40",
        } as React.CSSProperties}
      >
        <svg viewBox="0 0 90 90" className="w-full h-full">
          <defs>
            {/* Outer Ring radial gradient */}
            <radialGradient id={`outer-grad-${badgeId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={palette.outerEnd} />
              <stop offset="70%" stopColor={palette.outerStart} />
              <stop offset="100%" stopColor={palette.outerStart} />
            </radialGradient>

            {/* Inner Face radial gradient */}
            <radialGradient id={`inner-grad-${badgeId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={palette.innerEnd} />
              <stop offset="100%" stopColor={palette.innerStart} />
            </radialGradient>

            {/* Clip path for diagonal shine */}
            <clipPath id={`clip-inner-${badgeId}`}>
              {shape === "hex" && (
                <path d="M40,14Q45,11 50,14L72,27Q77,30 77,36L77,54Q77,60 72,63L50,76Q45,79 40,76L18,63Q13,60 13,54L13,36Q13,30 18,27Z" />
              )}
              {shape === "circle" && <circle cx="45" cy="45" r="32" />}
              {shape === "shield" && (
                <path d="M45,13L74,22L74,50C74,68 60,79 45,83C30,79 16,68 16,50L16,22Z" />
              )}
              {shape === "square" && <rect x="13" y="13" width="64" height="64" rx="16" />}
            </clipPath>
          </defs>

          {/* 1. GLOW BACKDROP */}
          {shape === "hex" && (
            <path
              d="M39,8.5Q45,5 51,8.5L77,23.5Q83,27 83,34L83,56Q83,63 77,66.5L51,81.5Q45,85 39,81.5L13,66.5Q7,63 7,56L7,34Q7,27 13,23.5Z"
              fill={palette.glowColor}
              filter="url(#badge-glow)"
              opacity="0.6"
            />
          )}
          {shape === "circle" && (
            <circle cx="45" cy="45" r="40" fill={palette.glowColor} filter="url(#badge-glow)" opacity="0.6" />
          )}
          {shape === "shield" && (
            <path
              d="M45,6L81,18L81,50C81,72 63,84 45,89C27,84 9,72 9,50L9,18Z"
              fill={palette.glowColor}
              filter="url(#badge-glow)"
              opacity="0.6"
            />
          )}
          {shape === "square" && (
            <rect x="5" y="5" width="80" height="80" rx="22" fill={palette.glowColor} filter="url(#badge-glow)" opacity="0.6" />
          )}

          {/* 2. OUTER RING */}
          {shape === "hex" && (
            <path
              d="M39,8.5Q45,5 51,8.5L77,23.5Q83,27 83,34L83,56Q83,63 77,66.5L51,81.5Q45,85 39,81.5L13,66.5Q7,63 7,56L7,34Q7,27 13,23.5Z"
              fill={`url(#outer-grad-${badgeId})`}
            />
          )}
          {shape === "circle" && (
            <circle cx="45" cy="45" r="40" fill={`url(#outer-grad-${badgeId})`} />
          )}
          {shape === "shield" && (
            <path
              d="M45,6L81,18L81,50C81,72 63,84 45,89C27,84 9,72 9,50L9,18Z"
              fill={`url(#outer-grad-${badgeId})`}
            />
          )}
          {shape === "square" && (
            <rect x="5" y="5" width="80" height="80" rx="22" fill={`url(#outer-grad-${badgeId})`} />
          )}

          {/* CIRCLE: Tick ring */}
          {shape === "circle" && (
            <g fill="white" opacity="0.4">
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * Math.PI) / 4;
                const x = 45 + 36 * Math.cos(angle);
                const y = 45 + 36 * Math.sin(angle);
                return <circle key={i} cx={x} cy={y} r="2" />;
              })}
            </g>
          )}

          {/* SQUARE: Corner gems */}
          {shape === "square" && (
            <g fill="white" opacity="0.4">
              {[
                { cx: 12, cy: 12 },
                { cx: 78, cy: 12 },
                { cx: 12, cy: 78 },
                { cx: 78, cy: 78 },
              ].map((g, idx) => (
                <rect
                  key={idx}
                  x={g.cx - 3}
                  y={g.cy - 3}
                  width="6"
                  height="6"
                  transform={`rotate(45, ${g.cx}, ${g.cy})`}
                />
              ))}
            </g>
          )}

          {/* 3. INNER FACE */}
          {shape === "hex" && (
            <path
              d="M40,14Q45,11 50,14L72,27Q77,30 77,36L77,54Q77,60 72,63L50,76Q45,79 40,76L18,63Q13,60 13,54L13,36Q13,30 18,27Z"
              fill={`url(#inner-grad-${badgeId})`}
            />
          )}
          {shape === "circle" && (
            <circle cx="45" cy="45" r="32" fill={`url(#inner-grad-${badgeId})`} />
          )}
          {shape === "shield" && (
            <path
              d="M45,13L74,22L74,50C74,68 60,79 45,83C30,79 16,68 16,50L16,22Z"
              fill={`url(#inner-grad-${badgeId})`}
            />
          )}
          {shape === "square" && (
            <rect x="13" y="13" width="64" height="64" rx="16" fill={`url(#inner-grad-${badgeId})`} />
          )}

          {/* 4. INNER EDGE SHADOW */}
          {shape === "hex" && (
            <path
              d="M40,14Q45,11 50,14L72,27Q77,30 77,36L77,54Q77,60 72,63L50,76Q45,79 40,76L18,63Q13,60 13,54L13,36Q13,30 18,27Z"
              fill="none"
              stroke="black"
              strokeWidth="1.5"
              opacity="0.4"
            />
          )}
          {shape === "circle" && (
            <circle cx="45" cy="45" r="32" fill="none" stroke="black" strokeWidth="1.5" opacity="0.4" />
          )}
          {shape === "shield" && (
            <path
              d="M45,13L74,22L74,50C74,68 60,79 45,83C30,79 16,68 16,50L16,22Z"
              fill="none"
              stroke="black"
              strokeWidth="1.5"
              opacity="0.4"
            />
          )}
          {shape === "square" && (
            <rect
              x="13"
              y="13"
              width="64"
              height="64"
              rx="16"
              fill="none"
              stroke="black"
              strokeWidth="1.5"
              opacity="0.4"
            />
          )}

          {/* 5. DIAGONAL SHINE */}
          <polygon
            points="0,0 90,0 0,90"
            fill="white"
            opacity="0.12"
            clipPath={`url(#clip-inner-${badgeId})`}
          />

          {/* 6. SECONDARY SHINE */}
          <ellipse cx="45" cy="22" rx="20" ry="6" fill="white" opacity="0.08" />

        </svg>

        {/* 7. ICON */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: "translateY(0.5px)", // Micro-offset for perfect visual centering
          }}
        >
          <IconComponent
            size={size * 0.3}
            weight="bold"
            style={{
              color: "white",
              filter: `drop-shadow(0 0 5px ${palette.glowColor})`,
            }}
          />
        </div>

        {/* LOCKED STATE LOCK ICON OVERLAY */}
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
            <div
              className="rounded-full bg-black/60 border border-white/10 shadow-lg flex items-center justify-center"
              style={{
                width: size * 0.35,
                height: size * 0.35,
              }}
            >
              <Lock size={size * 0.18} weight="fill" className="text-white/80" />
            </div>
          </div>
        )}
      </div>

      {/* Hover Info Tooltip/Label */}
      <span className="mt-2 font-body font-body-bold text-xs text-[var(--text-primary)]">
        {config.name}
      </span>
      <span className="text-[10px] text-[var(--text-muted)] font-body max-w-[90px] leading-tight">
        {config.description}
      </span>
    </div>
  );
}
