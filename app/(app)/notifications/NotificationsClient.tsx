"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ArrowRight, Trophy, Sparkle, CircleNotch } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  action_url: string | null;
  icon: string | null;
  is_read: boolean;
  created_at: string;
}

interface Props {
  userId: string;
  initialNotifications: NotificationItem[];
}

export function NotificationsClient({ userId, initialNotifications }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      const supabase = createClient();
      await (supabase.from("notifications" as any) as any)
        .update({ is_read: true })
        .eq("id", item.id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
    }

    if (item.action_url) {
      router.push(item.action_url);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const supabase = createClient();
      await (supabase.from("notifications" as any) as any)
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide uppercase flex items-center gap-3">
            NOTIFICATIONS
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-start)] text-white font-body-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">
            Activity updates, achievement unlocks, &amp; reminders
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="px-3 py-1.5 rounded-xl border border-[#27272a] bg-[var(--bg-surface)] text-xs font-body-bold text-[var(--accent-text)] hover:bg-[var(--accent-start)]/10 transition-colors flex items-center gap-1.5 shrink-0"
          >
            {markingAll ? <CircleNotch size={14} className="animate-spin" /> : <Check size={14} weight="bold" />}
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card variant="surface" className="p-10 text-center border-dashed border-[#27272a] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <Bell size={24} />
          </div>
          <div>
            <p className="font-display text-xl text-[var(--text-primary)] font-black uppercase">NO NOTIFICATIONS YET</p>
            <p className="font-body text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
              You will receive updates here whenever you unlock achievement badges or complete daily milestones!
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {notifications.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => handleNotificationClick(item)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group relative overflow-hidden",
                  item.is_read
                    ? "bg-[#09090b]/60 border-[#27272a] opacity-80 hover:opacity-100"
                    : "bg-[var(--bg-surface)] border-[var(--accent-start)]/40 shadow-md shadow-[var(--accent-start)]/5"
                )}
              >
                {!item.is_read && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[var(--accent-start)] animate-pulse" />
                )}

                <div className="w-10 h-10 rounded-xl bg-[var(--accent-start)]/10 text-[var(--accent-text)] border border-[var(--accent-start)]/20 flex items-center justify-center shrink-0 mt-0.5">
                  {item.title.includes("Badge") || item.title.includes("Unlocked") ? (
                    <Trophy size={20} weight="bold" />
                  ) : (
                    <Sparkle size={20} weight="bold" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1 pr-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className={cn("font-body text-sm truncate", item.is_read ? "font-normal text-[var(--text-primary)]" : "font-bold text-[var(--text-primary)]")}>
                      {item.title}
                    </h3>
                  </div>
                  {item.body && (
                    <p className="font-body text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                      {item.body}
                    </p>
                  )}
                  <p className="font-body text-[10px] text-[var(--text-muted)] pt-0.5">
                    {new Date(item.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all shrink-0 self-center" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
