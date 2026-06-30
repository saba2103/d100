"use client";

import { useAppUser } from "@/lib/contexts/AppContext";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";
import { Lock } from "@phosphor-icons/react";

interface SASwitcherProps {
  className?: string;
}

export function SASwitcher({ className }: SASwitcherProps) {
  const { activeProfile, setActiveProfile, isPartnerConnected, profile } = useAppUser();
  const router = useRouter();

  // Determine owner (self) profile tag vs partner profile tag
  const userEmail = profile?.email?.toLowerCase() || "";
  const isAncy = userEmail.includes("ancy") || profile?.full_name?.toLowerCase().includes("ancy");
  
  const selfTag = isAncy ? "A" : "S";
  const partnerTag = isAncy ? "S" : "A";

  const buttonOrder = [selfTag, partnerTag] as const;

  // Partner button is locked unless partner is fully connected
  const partnerButtonLocked = !isPartnerConnected;
  // Extra visual lock state when actively viewing partner
  const isViewingPartner = isPartnerConnected && activeProfile === partnerTag;

  const getTooltip = () => {
    if (isViewingPartner) return "Locked while viewing partner data";
    if (partnerButtonLocked) return "Click to connect partner account";
    return undefined;
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={cn(
          "flex p-0.5 bg-[var(--bg-base)] border rounded-full items-center justify-between transition-all duration-200",
          partnerButtonLocked
            ? "border-[var(--border)]"
            : isViewingPartner
            ? "border-orange-500/40 opacity-60"
            : "border-[var(--border)]",
          className || "w-20"
        )}
        title={getTooltip()}
      >
        {buttonOrder.map((p) => {
          const isActive = activeProfile === p;
          const isPartner = p === partnerTag;
          
          // Disable button only if we are actively viewing partner
          const isDisableState = isPartner && isViewingPartner;

          return (
            <button
              key={p}
              onClick={async () => {
                if (isPartner && partnerButtonLocked) {
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
                  : isPartner && partnerButtonLocked
                  ? "text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  : isDisableState
                  ? "text-[var(--text-muted)]/40 cursor-not-allowed"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
              aria-label={
                isPartner && partnerButtonLocked
                  ? "Partner profile locked - Click to connect"
                  : `Switch profile to ${p}`
              }
            >
              {isPartner && partnerButtonLocked ? (
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
