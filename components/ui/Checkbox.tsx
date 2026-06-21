"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { Check } from "@phosphor-icons/react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, label, disabled = false, className }: CheckboxProps) {
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
      {/* Box */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-white transition-all duration-150",
          "peer-checked:bg-gradient-to-r peer-checked:from-[var(--accent-start)] peer-checked:to-[var(--accent-end)] peer-checked:border-transparent",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-start)]/50"
        )}
      >
        {checked && <Check size={14} weight="bold" className="stroke-white" />}
      </div>
      {label && (
        <span className="font-body text-sm text-[var(--text-primary)] font-medium">{label}</span>
      )}
    </label>
  );
}
