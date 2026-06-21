"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, BookOpen, Images, UserCircle, GearSix, Trophy, Robot, Footprints, Drop, Sparkle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MORE_ITEMS = [
  { href: "/insights", label: "AI Insights", icon: Robot },
  { href: "/steps", label: "Steps", icon: Footprints },
  { href: "/water", label: "Water", icon: Drop },
  { href: "/supplements", label: "Supplements", icon: Sparkle },
  { href: "/course", label: "Course", icon: BookOpen },
  { href: "/collection", label: "Collection", icon: Images },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/badges", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: GearSix },
] as const;

export function BottomSheet({ isOpen, onClose }: BottomSheetProps) {
  const pathname = usePathname();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
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
                More Features
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content List */}
            <div className="grid grid-cols-2 gap-4">
              {MORE_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] transition-all duration-150 group"
                  >
                    <Icon
                      size={32}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
