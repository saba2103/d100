"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { useAppUser } from "@/lib/contexts/AppContext";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { loading } = useAppUser();
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      const dismissed = localStorage.getItem("d100-install-dismissed");
      const isStandaloneMode =
        (window.navigator as any).standalone ||
        window.matchMedia("(display-mode: standalone)").matches;

      if (!dismissed && !isStandaloneMode) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleDismissInstall = () => {
    localStorage.setItem("d100-install-dismissed", "true");
    setShowInstallBanner(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090B] text-white">
        <div className="flex flex-col items-center gap-4">
          {/* Logo with pulsating glow */}
          <div className="relative">
            <span className="font-display text-5xl tracking-widest text-gradient font-black animate-pulse">
              D100
            </span>
          </div>
          {/* Spinner */}
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-[var(--accent-start)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Top Header (Mobile & Tablet only) */}
      <TopBar />

      {/* Side Navigation (Tablet & Desktop only) */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className="min-h-dvh w-full transition-all duration-200
                   pt-14 pb-[calc(4rem+env(safe-area-inset-bottom))] pl-0
                   sm:pl-[60px] sm:pt-14 sm:pb-0
                   lg:pl-[220px] lg:pt-0"
      >
        {/* Responsive Content Container */}
        <div className="mx-auto w-full max-w-[1200px] p-4 md:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-xl flex items-center justify-between gap-4 max-w-md mx-auto sm:bottom-6 sm:right-6 sm:left-auto"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] flex items-center justify-center font-display font-black text-white text-lg">
                D
              </div>
              <div className="min-w-0">
                <h4 className="font-body-bold text-xs text-[var(--text-primary)] truncate">Add to Home Screen</h4>
                <p className="font-body text-[10px] text-[var(--text-secondary)] leading-tight">Install D100 for instant launch & offline access.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDismissInstall}
                className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-body text-[10px] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleInstallClick}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--accent-start)] text-white font-body-bold text-[10px] hover:brightness-105 transition-colors"
              >
                Install
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
