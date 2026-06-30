"use client";

import React, { useMemo, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface TimelineCalendarProps {
  selectedDate: string;
  today: string;
  programStartDate: string | null;
  onSelectDate: (date: string) => void;
  hasDataOnDate?: (date: string) => boolean;
}

export function TimelineCalendar({
  selectedDate,
  today,
  programStartDate,
  onSelectDate,
  hasDataOnDate,
}: TimelineCalendarProps) {
  // Generate 15 weeks of the program starting from the program start date
  const programWeeks = useMemo(() => {
    const start = new Date(programStartDate || today);
    start.setHours(0, 0, 0, 0);

    const weeks = [];
    for (let w = 0; w < 15; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dayIdx = w * 7 + d;
        if (dayIdx >= 100) break; // Limit to 100 days of the program

        const currentDay = new Date(start);
        currentDay.setDate(start.getDate() + dayIdx);

        days.push({
          dayIndex: dayIdx + 1,
          dateStr: currentDay.toLocaleDateString("sv-SE"),
          dayName: currentDay.toLocaleDateString("en-US", { weekday: "short" }),
          dayNum: currentDay.getDate(),
        });
      }
      if (days.length > 0) {
        weeks.push({
          weekNum: w + 1,
          days,
        });
      }
    }
    return weeks;
  }, [programStartDate, today]);

  // Scroll the active week into view on mount
  useEffect(() => {
    const activeWeek = programWeeks.find((w) =>
      w.days.some((d) => d.dateStr === selectedDate)
    );
    if (activeWeek) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`timeline-week-card-${activeWeek.weekNum}`);
        if (el) {
          el.scrollIntoView({
            behavior: "auto",
            block: "nearest",
            inline: "center",
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [programWeeks, selectedDate]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
      {programWeeks.map((week) => {
        const hasActiveDate = week.days.some((d) => d.dateStr === selectedDate);
        return (
          <Card
            key={week.weekNum}
            variant="surface"
            id={`timeline-week-card-${week.weekNum}`}
            className={cn(
              "p-3 w-[290px] sm:w-[360px] shrink-0 snap-center rounded-2xl border transition-all duration-200",
              hasActiveDate
                ? "border-[#3f3f46] bg-gradient-to-br from-[var(--bg-surface)] to-[rgba(249,115,22,0.02)] shadow-sm"
                : "border-[#27272a] hover:border-[#3f3f46]"
            )}
          >
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-display font-black text-[var(--accent-text)] uppercase tracking-wider">
                Week {week.weekNum}
              </span>
              <span className="text-[9px] text-[var(--text-muted)] font-body font-semibold">
                Days {week.days[0].dayIndex}–{week.days[week.days.length - 1].dayIndex}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {week.days.map((d) => {
                const isSelected = d.dateStr === selectedDate;
                const isCurrentToday = d.dateStr === today;
                const hasData = hasDataOnDate ? hasDataOnDate(d.dateStr) : false;

                return (
                  <button
                    key={d.dateStr}
                    onClick={() => onSelectDate(d.dateStr)}
                    className={cn(
                      "flex flex-col items-center py-2.5 rounded-xl transition-all relative border",
                      isSelected
                        ? "bg-gradient-to-br from-[var(--accent-start)]/10 to-[var(--accent-end)]/10 border-[var(--accent-start)] text-[var(--accent-text)] font-bold"
                        : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-base)]",
                      isCurrentToday && !isSelected && "border-[#27272a]"
                    )}
                  >
                    <span className="text-[8px] uppercase font-body font-body-bold tracking-wider opacity-85">
                      {d.dayName}
                    </span>
                    <span className="font-display text-base font-black mt-1 leading-none">
                      {d.dayNum}
                    </span>

                    {/* Data completion indicator dot/check */}
                    {hasData ? (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--green)]" />
                    ) : isCurrentToday && !isSelected ? (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--accent-start)]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
