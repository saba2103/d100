"use client";

import React, { useEffect, useState } from "react";
import { WifiSlash, ArrowsClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    // Reload page to check if connection is restored
    window.location.reload();
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#09090B] px-4 text-center text-white">
      <div className="max-w-md space-y-6">
        {/* App Logo */}
        <div className="flex justify-center">
          <span className="font-display text-5xl tracking-widest text-gradient font-black">
            D100
          </span>
        </div>

        {/* Offline Visual */}
        <div className="flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
            <WifiSlash size={48} className="text-[var(--accent-text)]" />
            {/* Pulsating outline rings */}
            <div className="absolute inset-0 animate-ping rounded-3xl bg-[var(--accent-start)]/10 pointer-events-none" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-black uppercase tracking-wide">
            You are offline
          </h1>
          <p className="font-body text-sm text-[var(--text-secondary)] px-4">
            It looks like your internet connection is unavailable right now. Please check your network settings and try again.
          </p>
        </div>

        {/* Retry Button */}
        <div className="pt-2 flex justify-center">
          <Button
            onClick={handleRetry}
            disabled={retrying}
            variant="primary"
            size="lg"
            className="min-w-[160px] uppercase font-display tracking-wider text-xs"
          >
            {retrying ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <ArrowsClockwise size={16} className="mr-1" />
                Retry Connection
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
