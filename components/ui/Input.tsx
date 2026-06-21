"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, className, id, ...props },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body-bold text-xs uppercase tracking-wider text-[var(--text-muted)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // base
              "w-full rounded-xl bg-[var(--bg-elevated)] font-body text-sm text-[var(--text-primary)]",
              "placeholder:text-[var(--text-muted)]",
              // border
              "border border-[var(--border)] transition-all duration-200",
              // focus
              "outline-none focus:border-[var(--accent-start)] focus:ring-2 focus:ring-[var(--accent-start)]/15",
              // padding
              "h-11 px-4",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              // error
              error && "border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]/15",
              // disabled
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="font-body text-xs text-[var(--red)]">{error}</p>
        )}
        {!error && hint && (
          <p className="font-body text-xs text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
