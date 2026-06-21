"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Calendar } from "@phosphor-icons/react";

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  hint?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body-bold text-xs uppercase tracking-wider text-[var(--text-muted)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Calendar Left Icon */}
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] z-10">
            <Calendar size={18} />
          </span>

          <input
            ref={ref}
            id={inputId}
            type="date"
            className={cn(
              // base
              "w-full rounded-xl bg-[var(--bg-elevated)] font-body text-sm text-[var(--text-primary)] cursor-pointer",
              "placeholder:text-[var(--text-muted)]",
              // border
              "border border-[var(--border)] transition-all duration-200",
              // focus
              "outline-none focus:border-[var(--accent-start)] focus:ring-2 focus:ring-[var(--accent-start)]/15",
              // padding
              "h-11 pl-10 pr-4",
              // error
              error && "border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]/15",
              // disabled
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Custom datepicker layout styles (hide default icon)
              "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
              className
            )}
            {...props}
          />
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

DatePicker.displayName = "DatePicker";

export { DatePicker };
export type { DatePickerProps };
