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

  // A button is locked unless partner is fully connected
  const aButtonLocked = !isPartnerConnected;
  // Extra visual lock state when actively viewing partner
  const isViewingPartner = isPartnerConnected && activeProfile === "A";

  const getTooltip = () => {
    if (isViewingPartner) return "Locked while viewing partner data";
    if (aButtonLocked) return "Click to connect partner account";
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
          
          // Disable button only if we are actively viewing partner and on A (can't re-select A)
          const isDisableState = p === "A" && isViewingPartner;

          return (
            <button
              key={p}
              onClick={async () => {
                if (p === "A" && aButtonLocked) {
                  router.push("/profile");
                  return;
                }
                if (isDisableState) return;
                await setActiveProfile(p);
                router.refresh();
              }}
              disabled={isDisableState}
              className={cn(
                "flex-1 py-1 text-xs font-display rounded-full transition-all duration-200 text-center font-bold relative flex items-center justify-center h-6",
                isActive
                  ? "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white shadow-sm"
                  : p === "A" && aButtonLocked
                  ? "text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  : isDisableState
                  ? "text-[var(--text-muted)]/40 cursor-not-allowed"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
              aria-label={
                p === "A" && aButtonLocked
                  ? "Partner profile locked - Click to connect"
                  : `Switch profile to ${p}`
              }
            >
              {p === "A" && aButtonLocked ? (
                <Lock size={12} weight="bold" />
              ) : (
                p
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
