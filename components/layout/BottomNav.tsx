"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HouseSimple,
  Barbell,
  ForkKnife,
  ChartLineUp,
  CirclesFour,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import { BottomSheet } from "./BottomSheet";
import { motion } from "framer-motion";

// ── Nav items ──────────────────────────────────────────────────────
const MAIN_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HouseSimple },
  { href: "/workout", label: "Workout", icon: Barbell },
  { href: "/nutrition", label: "Nutrition", icon: ForkKnife },
  { href: "/body-stats", label: "Body Stats", icon: ChartLineUp },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Checks if any of the "More" page routes are currently active
  const isMoreActive = ["/course", "/collection", "/profile", "/settings", "/insights", "/steps", "/water", "/supplements"].some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-[var(--border)] bg-[var(--bg-surface)] pb-safe sm:hidden"
        aria-label="Mobile Navigation"
      >
        <div className="flex h-full items-center justify-around px-2">
          {MAIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group"
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative flex flex-col items-center justify-center">
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  >
                    <Icon
                      size={24}
                      weight={isActive ? "fill" : "regular"}
                      className={cn(
                        isActive
                          ? "active-nav-icon"
                          : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                      )}
                    />
                  </motion.div>
                  {isActive && (
                    <span className="mt-1 font-body font-body-bold text-[10px] text-[var(--accent-text)]">
                      {label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* More trigger button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group"
            aria-label="More options"
            aria-expanded={isMoreOpen}
          >
            <div className="relative flex flex-col items-center justify-center">
              <motion.div
                animate={isMoreActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              >
                <CirclesFour
                  size={24}
                  weight={isMoreActive ? "fill" : "regular"}
                  className={cn(
                    isMoreActive
                      ? "active-nav-icon"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                  )}
                />
              </motion.div>
              {isMoreActive && (
                <span className="mt-1 font-body font-body-bold text-[10px] text-[var(--accent-text)]">
                  More
                </span>
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Drawer */}
      <BottomSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
}
