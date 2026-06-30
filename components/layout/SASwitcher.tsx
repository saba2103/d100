"use client";

import { useAppUser } from "@/lib/contexts/AppContext";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";
import { Lock } from "@phosphor-icons/react";

interface SASwitcherProps {
  className?: string;
}

export function SASwitcher({ className }: SASwitcherProps) {
  const { activeProfile, setActiveProfile, isPartnerConnected } = useAppUser();
  const router = useRouter();

  // A button is always locked unless partner is fully connected
  const aButtonLocked = !isPartnerConnected;
  // Extra visual lock state when actively viewing partner
  const isViewingPartner = isPartnerConnected && activeProfile === "A";

  const getTooltip = () => {
    if (isViewingPartner) return "Locked while viewing partner data";
    if (aButtonLocked) return "Partner not connected yet";
    return undefined;
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={cn(
          "flex p-0.5 bg-[var(--bg-base)] border rounded-full items-center justify-between transition-all duration-200",
          aButtonLocked
            ? "border-[var(--border)]"
            : isViewingPartner
            ? "border-orange-500/40 opacity-60"
            : "border-[var(--border)]",
          className || "w-20"
        )}
        title={getTooltip()}
      >
        {(["S", "A"] as const).map((p) => {
          const isActive = activeProfile === p;
          // A is locked if partner not connected OR if currently viewing partner
          const isLocked = p === "A" && (aButtonLocked || isViewingPartner);

          return (
            <button
              key={p}
              onClick={async () => {
                if (isLocked) return;
                await setActiveProfile(p);
                router.refresh();
              }}
              disabled={isLocked}
              className={cn(
                "flex-1 py-1 text-xs font-display rounded-full transition-all duration-200 text-center font-bold relative",
                isActive
                  ? "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white shadow-sm"
                  : isLocked
                  ? "text-[var(--text-muted)]/40 cursor-not-allowed"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
              aria-label={
                isLocked
                  ? `Profile A locked — ${aButtonLocked ? "partner not connected" : "viewing partner data"}`
                  : `Switch profile to ${p}`
              }
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Status label */}
      {aButtonLocked && activeProfile === "S" && (
        <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]/60 font-body">
          <Lock size={9} weight="fill" />
          Partner not linked
        </span>
      )}
      {isViewingPartner && (
        <span className="flex items-center gap-1 text-[10px] text-orange-400/80 font-body">
          <Lock size={9} weight="fill" />
          Partner view
        </span>
      )}
    </div>
  );
}
