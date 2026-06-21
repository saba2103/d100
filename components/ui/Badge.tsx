import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────
type BadgeVariant = "default" | "accent" | "success" | "danger" | "warning" | "info" | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

// ── Styles ─────────────────────────────────────────────────────────
const variants: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]",
  accent:
    "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white",
  success: "bg-[var(--green-soft)] text-[var(--green)]",
  danger: "bg-[var(--red-soft)] text-[var(--red)]",
  warning: "bg-[var(--amber-soft)] text-[var(--amber)]",
  info: "bg-[var(--blue-soft)] text-[var(--blue)]",
  purple: "bg-[var(--purple-soft)] text-[var(--purple)]",
};

// ── Component ──────────────────────────────────────────────────────
function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-body font-body-bold",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current shrink-0",
            variant === "accent" ? "bg-white" : ""
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
