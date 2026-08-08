"use client";

import React, { useEffect } from "react";
import { X, Play, Barbell } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  exerciseName: string;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  exerciseName,
}: VideoPlayerModalProps) {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[#09090b] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[#121214]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-[var(--accent-start)]/10 text-[var(--accent-text)] rounded-xl shrink-0">
                  <Barbell size={16} weight="bold" />
                </div>
                <h3 className="font-display text-sm font-black tracking-wide text-white uppercase truncate">
                  {exerciseName} Demo
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#1d1d22] hover:bg-[#2e2e38] text-[var(--text-secondary)] hover:text-white transition-all duration-150"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Video Body */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <div className="p-8 text-center text-[var(--text-muted)] space-y-2">
                  <p className="font-body text-xs">No demonstration video loaded.</p>
                </div>
              )}
            </div>

            {/* Footer Form Tips */}
            <div className="p-4 bg-[#121214] border-t border-[var(--border)] text-[10px] font-body text-[var(--text-muted)] leading-relaxed text-center">
              💡 Tip: Focus on controlled eccentric movements and maintain proper joint alignment.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
