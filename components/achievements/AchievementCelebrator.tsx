"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { ProgramBadge } from "@/components/ui/ProgramBadge";
import { BADGE_CONFIGS } from "@/components/ui/ProgramBadge";
import { Button } from "@/components/ui/Button";

export function AchievementCelebrator() {
  const [queue, setQueue] = useState<string[]>([]);
  const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);

  useEffect(() => {
    const handleBadgeUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent<{ badgeIds: string[] }>;
      if (!customEvent.detail || !customEvent.detail.badgeIds) return;

      const newBadgeIds = customEvent.detail.badgeIds;

      // Filter already celebrated in this session to prevent double-showing
      const celebratedRaw = sessionStorage.getItem("celebrated-badges") || "[]";
      const celebrated: string[] = JSON.parse(celebratedRaw);

      const toCelebrate = newBadgeIds.filter(id => !celebrated.includes(id));
      if (toCelebrate.length === 0) return;

      // Immediately write them to sessionStorage to prevent enqueuing them twice
      const updatedCelebrated = [...celebrated, ...toCelebrate];
      sessionStorage.setItem("celebrated-badges", JSON.stringify(updatedCelebrated));

      setQueue(prev => {
        const filtered = toCelebrate.filter(id => !prev.includes(id));
        return [...prev, ...filtered];
      });
    };

    window.addEventListener("badges-unlocked", handleBadgeUnlocked);
    return () => {
      window.removeEventListener("badges-unlocked", handleBadgeUnlocked);
    };
  }, []);

  // Process queue
  useEffect(() => {
    if (!activeBadgeId && queue.length > 0) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      setActiveBadgeId(next);
      
      // Fire confetti!
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#D97706", "#C084FC", "#60A5FA", "#34D399", "#F87171"],
        });
      }, 300);
    }
  }, [queue, activeBadgeId]);

  const handleDismiss = () => {
    if (!activeBadgeId) return;

    // Record as celebrated in session
    const celebratedRaw = sessionStorage.getItem("celebrated-badges");
    const celebrated: string[] = celebratedRaw ? JSON.parse(celebratedRaw) : [];
    if (!celebrated.includes(activeBadgeId)) {
      celebrated.push(activeBadgeId);
      sessionStorage.setItem("celebrated-badges", JSON.stringify(celebrated));
    }

    setActiveBadgeId(null);
  };

  if (!activeBadgeId) return null;

  const config = BADGE_CONFIGS[activeBadgeId];
  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { type: "spring", damping: 15, stiffness: 100 }
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-sm w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-[var(--badge-glow)]"
          style={{
            "--badge-glow": config.gradient.glow,
          } as React.CSSProperties}
        >
          <div className="space-y-1">
            <span className="font-display text-[var(--accent-text)] text-xs font-bold uppercase tracking-wider block">
              Achievement
            </span>
            <h2 className="font-display text-3xl font-black text-white tracking-wide leading-none uppercase">
              NEW UNLOCK!
            </h2>
          </div>

          {/* Large Badge Container */}
          <div className="flex justify-center py-4">
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 12 }}
            >
              <ProgramBadge
                badgeId={activeBadgeId}
                earned={true}
                size={160}
              />
            </motion.div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-2xl font-black text-[var(--text-primary)] uppercase leading-none">
              {config.name}
            </h3>
            <p className="font-body text-xs text-[var(--text-secondary)] px-4 leading-relaxed">
              {config.description}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              className="font-display uppercase tracking-wider text-sm py-4"
              onClick={handleDismiss}
            >
              Awesome!
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
