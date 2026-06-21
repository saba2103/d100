"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled = false, className }: ToggleProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only peer"
      />
      {/* Switch Track */}
      <div
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200 border border-[var(--border)] bg-[var(--bg-elevated)]",
          "peer-checked:bg-gradient-to-r peer-checked:from-[var(--accent-start)] peer-checked:to-[var(--accent-end)] peer-checked:border-transparent",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-start)]/50"
        )}
      >
        {/* Switch Thumb */}
        <div
          className={cn(
            "absolute top-[1px] left-[1px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
      {label && (
        <span className="font-body text-sm text-[var(--text-primary)] font-medium">{label}</span>
      )}
    </label>
  );
}
