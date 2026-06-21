"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import { Icon } from "@phosphor-icons/react";

// ── Types ──────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: Icon;
  children?: ReactNode;
}

// ── Styles ─────────────────────────────────────────────────────────
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-body font-body-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-start)] disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white shadow-lg shadow-[var(--accent-start)]/20 hover:brightness-105",
  secondary:
    "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-hover)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
  danger:
    "bg-[var(--red)] text-white hover:brightness-105 shadow-lg shadow-[var(--red)]/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

// ── Component ──────────────────────────────────────────────────────
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon: IconComponent,
      className,
      children,
      disabled,
      onClick,
      type = "button",
      ...rest
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...(rest as object)}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
        ) : IconComponent ? (
          <IconComponent size={size === "sm" ? 16 : size === "md" ? 18 : 20} className="shrink-0" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
