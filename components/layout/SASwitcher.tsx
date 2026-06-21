"use client";

import { useAppUser } from "@/lib/contexts/AppContext";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

interface SASwitcherProps {
  className?: string;
}

export function SASwitcher({ className }: SASwitcherProps) {
  const { activeProfile, setActiveProfile } = useAppUser();
  const router = useRouter();

  return (
    <div className={cn(
      "flex p-0.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-full items-center justify-between",
      className || "w-20"
    )}>
      {(["S", "A"] as const).map((p) => {
        const isActive = activeProfile === p;
        return (
          <button
            key={p}
            onClick={async () => {
              await setActiveProfile(p);
              router.refresh();
            }}
            className={cn(
              "flex-1 py-1 text-xs font-display rounded-full transition-all duration-200 text-center font-bold",
              isActive
                ? "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
            aria-label={`Switch profile to ${p}`}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}
