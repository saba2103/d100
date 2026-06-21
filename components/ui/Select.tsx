"use client";

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { CaretDown } from "@phosphor-icons/react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, children, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="font-body-bold text-xs uppercase tracking-wider text-[var(--text-muted)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              // base
              "w-full rounded-xl bg-[var(--bg-elevated)] font-body text-sm text-[var(--text-primary)] appearance-none cursor-pointer",
              // border
              "border border-[var(--border)] transition-all duration-200",
              // focus
              "outline-none focus:border-[var(--accent-start)] focus:ring-2 focus:ring-[var(--accent-start)]/15",
              // padding
              "h-11 pl-4 pr-10",
              // error
              error && "border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]/15",
              // disabled
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            {children}
          </select>

          {/* Custom chevron dropdown icon */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <CaretDown size={16} />
          </span>
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

Select.displayName = "Select";

export { Select };
export type { SelectProps };
