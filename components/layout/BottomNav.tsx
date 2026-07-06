"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HouseSimple,
  ChartLineUp,
  Compass,
  BookOpen,
  Robot,
  MapTrifold,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import { BottomSheet, SheetType } from "./BottomSheet";
import { motion } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);

  // Active route helpers
  const isHomeActive = pathname === "/dashboard";
  const isTrackActive = ["/workout", "/steps", "/nutrition", "/water", "/supplements", "/body-stats", "/badges", "/calculator"].some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isJourneyActive = pathname === "/journey" || pathname.startsWith("/journey/");
  const isResourcesActive = ["/course", "/collection"].some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isInsightsActive = pathname === "/insights" || pathname.startsWith("/insights/");

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-[var(--border)] bg-[var(--bg-surface)] pb-safe sm:hidden"
        aria-label="Mobile Navigation"
      >
        <div className="flex h-full items-center justify-around px-1">
          {/* 1. Home */}
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group"
            aria-label="Home"
          >
            <div className="relative flex flex-col items-center justify-center">
              <motion.div
                animate={isHomeActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              >
                <HouseSimple
                  size={22}
                  weight={isHomeActive ? "fill" : "regular"}
                  className={cn(
                    isHomeActive
                      ? "text-[var(--accent-text)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                  )}
                />
              </motion.div>
              <span className={cn(
                "mt-0.5 font-body text-[10px]",
                isHomeActive ? "font-body-bold text-[var(--accent-text)]" : "text-[var(--text-muted)]"
              )}>
                Home
              </span>
            </div>
          </Link>

          {/* 2. Track */}
          <button
            onClick={() => setActiveSheet("track")}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group"
            aria-label="Track"
          >
            <div className="relative flex flex-col items-center justify-center">
              <motion.div
                animate={isTrackActive || activeSheet === "track" ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              >
                <ChartLineUp
                  size={22}
                  weight={isTrackActive || activeSheet === "track" ? "fill" : "regular"}
                  className={cn(
                    isTrackActive || activeSheet === "track"
                      ? "text-[var(--accent-text)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                  )}
                />
              </motion.div>
              <span className={cn(
                "mt-0.5 font-body text-[10px]",
                isTrackActive || activeSheet === "track" ? "font-body-bold text-[var(--accent-text)]" : "text-[var(--text-muted)]"
              )}>
                Track
              </span>
            </div>
          </button>

          {/* 3. Journey (Protruding Center FAB) */}
          <Link
            href="/journey"
            className="flex flex-col items-center justify-center flex-1 h-full text-center group relative -mt-5"
            aria-label="Journey"
          >
            <div className="flex flex-col items-center justify-center">
              <motion.div
                animate={isJourneyActive ? { scale: 1.12, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-[3px] border-[var(--bg-surface)] shadow-md transition-all duration-200",
                  isJourneyActive
                    ? "bg-gradient-to-tr from-[var(--accent-start)] to-[var(--accent-end)] text-white shadow-[0_6px_20px_rgba(249,115,22,0.45)]"
                    : "bg-[var(--bg-elevated)] text-[var(--accent-text)] group-hover:bg-gradient-to-tr group-hover:from-[var(--accent-start)] group-hover:to-[var(--accent-end)] group-hover:text-white"
                )}
              >
                <MapTrifold
                  size={24}
                  weight={isJourneyActive ? "fill" : "bold"}
                />
              </motion.div>
              <span className={cn(
                "mt-0.5 font-body text-[10px]",
                isJourneyActive ? "font-body-bold text-[var(--accent-text)]" : "text-[var(--text-muted)] font-medium"
              )}>
                Journey
              </span>
            </div>
          </Link>

          {/* 4. Resources */}
          <button
            onClick={() => setActiveSheet("resources")}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group"
            aria-label="Resources"
          >
            <div className="relative flex flex-col items-center justify-center">
              <motion.div
                animate={isResourcesActive || activeSheet === "resources" ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              >
                <BookOpen
                  size={22}
                  weight={isResourcesActive || activeSheet === "resources" ? "fill" : "regular"}
                  className={cn(
                    isResourcesActive || activeSheet === "resources"
                      ? "text-[var(--accent-text)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                  )}
                />
              </motion.div>
              <span className={cn(
                "mt-0.5 font-body text-[10px]",
                isResourcesActive || activeSheet === "resources" ? "font-body-bold text-[var(--accent-text)]" : "text-[var(--text-muted)]"
              )}>
                Resources
              </span>
            </div>
          </button>

          {/* 5. AI Insights */}
          <Link
            href="/insights"
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group"
            aria-label="AI Insights"
          >
            <div className="relative flex flex-col items-center justify-center">
              <motion.div
                animate={isInsightsActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              >
                <Robot
                  size={22}
                  weight={isInsightsActive ? "fill" : "regular"}
                  className={cn(
                    isInsightsActive
                      ? "text-[var(--accent-text)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                  )}
                />
              </motion.div>
              <span className={cn(
                "mt-0.5 font-body text-[10px]",
                isInsightsActive ? "font-body-bold text-[var(--accent-text)]" : "text-[var(--text-muted)]"
              )}>
                AI Insights
              </span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Bottom Sheet Drawer */}
      <BottomSheet activeSheet={activeSheet} onClose={() => setActiveSheet(null)} />
    </>
  );
}
