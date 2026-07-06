"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  BookOpen,
  Images,
  Trophy,
  Robot,
  Footprints,
  Drop,
  Sparkle,
  Barbell,
  ForkKnife,
  ChartLineUp,
  Compass,
  Calculator,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export type SheetType = "track" | "journey" | "resources" | null;

interface BottomSheetProps {
  activeSheet: SheetType;
  onClose: () => void;
}

const TRACK_ITEMS = [
  { href: "/workout", label: "Workout", icon: Barbell },
  { href: "/steps", label: "Steps", icon: Footprints },
  { href: "/nutrition", label: "Nutrition", icon: ForkKnife },
  { href: "/water", label: "Water", icon: Drop },
  { href: "/supplements", label: "Supplements", icon: Sparkle },
  { href: "/body-stats", label: "Body Stats", icon: ChartLineUp },
  { href: "/badges", label: "Achievements", icon: Trophy },
  { href: "/calculator", label: "Calculator", icon: Calculator },
] as const;

const RESOURCE_ITEMS = [
  { href: "/course", label: "Course", icon: BookOpen },
  { href: "/collection", label: "Collection", icon: Images },
] as const;

export function BottomSheet({ activeSheet, onClose }: BottomSheetProps) {
  const pathname = usePathname();

  // Prevent background scrolling when open
  useEffect(() => {
    if (activeSheet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeSheet]);

  const getTitle = () => {
    if (activeSheet === "track") return "Track & Log";
    if (activeSheet === "journey") return "Your Journey";
    if (activeSheet === "resources") return "Resources & Media";
    return "";
  };

  return (
    <AnimatePresence>
      {activeSheet && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-[var(--border)] bg-[var(--bg-surface)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            {/* Header Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border)]" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wider text-[var(--text-primary)] uppercase">
                {getTitle()}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sheet Content */}
            {activeSheet === "track" && (
              <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {TRACK_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                    >
                      <Icon
                        size={28}
                        weight={isActive ? "fill" : "regular"}
                        className={isActive ? "text-[var(--accent-text)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"}
                      />
                      <span className="mt-2 font-body font-body-bold text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {activeSheet === "resources" && (
              <div className="grid grid-cols-2 gap-4">
                {RESOURCE_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="flex flex-col items-center justify-center p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                    >
                      <Icon
                        size={32}
                        weight={isActive ? "fill" : "regular"}
                        className={isActive ? "text-[var(--accent-text)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"}
                      />
                      <span className="mt-2.5 font-body font-body-bold text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {activeSheet === "journey" && (
              <div className="py-8 text-center space-y-4 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-base)] p-6">
                <div className="w-14 h-14 rounded-full bg-[var(--accent-start)]/10 text-[var(--accent-text)] border border-[var(--accent-start)]/20 flex items-center justify-center mx-auto">
                  <Compass size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-black tracking-wider text-[var(--text-primary)] uppercase">
                    Journey Mode
                  </h3>
                  <p className="font-body text-xs text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
                    Interactive program roadmap, milestone check-ins, and reflection timeline are coming soon!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
