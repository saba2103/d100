"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

// ── SectionHeader ───────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  ctaText?: string;
  ctaHref?: string;
  onClickCta?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  ctaText,
  ctaHref,
  onClickCta,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between py-2 w-full", className)}>
      <h2 className="font-display text-2xl uppercase tracking-wider text-[var(--text-primary)]">
        {title}
      </h2>
      {ctaText && (
        <>
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="font-body text-xs font-body-bold text-[var(--accent-text)] hover:underline uppercase tracking-wider"
            >
              {ctaText}
            </Link>
          ) : (
            <button
              onClick={onClickCta}
              className="font-body text-xs font-body-bold text-[var(--accent-text)] hover:underline uppercase tracking-wider cursor-pointer"
            >
              {ctaText}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── EmptyState ──────────────────────────────────────────────────────
interface EmptyStateProps {
  title: string;
  message: string;
  icon?: Icon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  message,
  icon: IconComponent,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]",
        className
      )}
    >
      {IconComponent && (
        <div className="p-4 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] mb-4">
          <IconComponent size={36} weight="regular" />
        </div>
      )}
      <h3 className="font-display text-xl text-[var(--text-primary)] uppercase tracking-wider">
        {title}
      </h3>
      <p className="mt-2 max-w-sm font-body text-xs text-[var(--text-secondary)] leading-relaxed">
        {message}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-5">
          {actionText}
        </Button>
      )}
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--bg-elevated)]",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-xl",
        variant === "text" && "h-4 w-3/4 rounded",
        className
      )}
    />
  );
}

// ── Divider ─────────────────────────────────────────────────────────
interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <hr className={cn("border-t border-[var(--border)] my-4 w-full", className)} />;
}

// ── Toast ───────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "fixed z-[100] flex items-center justify-between gap-4 p-4 rounded-xl border shadow-lg max-w-md w-auto",
        "top-4 right-4 left-4 sm:left-auto", // top-right desktop, top mobile
        type === "success"
          ? "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--green)]"
          : "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--red)]"
      )}
    >
      <span className="font-body text-xs font-body-bold text-[var(--text-primary)]">
        {message}
      </span>
      <button onClick={onClose} className="p-1 hover:bg-[var(--bg-elevated)] rounded-full text-[var(--text-secondary)]">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-xl"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl uppercase tracking-wider text-[var(--text-primary)]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="font-body text-sm text-[var(--text-secondary)]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── BottomSheet ─────────────────────────────────────────────────────
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="relative z-10 w-full max-w-md rounded-t-3xl border-t border-[var(--border)] bg-[var(--bg-surface)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--border)]" />

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl uppercase tracking-wider text-[var(--text-primary)]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="font-body text-sm text-[var(--text-secondary)]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
