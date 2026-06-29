"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppTheme } from "@/lib/contexts/AppContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Gear,
  Target,
  PaintBrush,
  User,
  Robot,
  CheckCircle,
  XCircle,
  SignOut,
  LockKey,
  Bell,
  Check,
  CircleNotch,
  Clock,
  Users,
  ShieldCheck,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import { subscribeToPush, unsubscribeFromPush, checkPushSubscription, getDeviceLabel } from "@/lib/push";

interface NotificationPreferences {
  workout_time: string;
  supplement_time: string;
  water_times: string[];
  night_log_time: string;
  weekly_recap_time: string;
  enable_streak_protection: boolean;
  enable_streak_risk: boolean;
  enable_milestone_celebrations: boolean;
  enable_ai_nudges: boolean;
  enable_partner_workout: boolean;
  enable_partner_nutrition: boolean;
  enable_partner_water: boolean;
  enable_partner_supplements: boolean;
  enable_partner_body_stats: boolean;
  enable_partner_photos: boolean;
  enable_partner_badges: boolean;
  enable_partner_streaks: boolean;
}

const defaultNotifPrefs: NotificationPreferences = {
  workout_time: "04:00",
  supplement_time: "08:00",
  water_times: ["10:00", "13:00", "16:00", "20:00"],
  night_log_time: "21:00",
  weekly_recap_time: "19:00",
  enable_streak_protection: true,
  enable_streak_risk: true,
  enable_milestone_celebrations: true,
  enable_ai_nudges: true,
  enable_partner_workout: true,
  enable_partner_nutrition: true,
  enable_partner_water: true,
  enable_partner_supplements: true,
  enable_partner_body_stats: true,
  enable_partner_photos: true,
  enable_partner_badges: true,
  enable_partner_streaks: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useAppTheme();

  // Settings & Profile loading states
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingGoals, setSavingGoals] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);

  // States: Push Notifications & Preferences
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [deviceLabel, setDeviceLabel] = useState("");
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(defaultNotifPrefs);

  // States: Goals
  const [waterGoal, setWaterGoal] = useState(3000);
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [caloriesGoal, setCaloriesGoal] = useState(2000);

  // States: Account
  const [displayName, setDisplayName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch initial settings & profile
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);
        setDeviceLabel(getDeviceLabel());

        // Check if push notifications are enabled on this device
        const isSubscribed = await checkPushSubscription();
        setPushEnabled(isSubscribed);

        // Fetch sanitized settings from server API
        const settingsRes = await fetch("/api/settings/get");
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setWaterGoal(settings.water_goal_ml || 3000);
          setStepsGoal(settings.steps_goal || 10000);
          setCaloriesGoal(settings.calories_goal || 2000);
          if (settings.notification_preferences) {
            setNotifPrefs({ ...defaultNotifPrefs, ...settings.notification_preferences });
          }
        }

        // Fetch Profile details
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setDisplayName(profile.display_name || "");
          setStartDate(profile.program_start_date || "");
        }
      } catch (err) {
        console.error("Failed to load settings data:", err);
      } finally {
        setLoadingSettings(false);
      }
    }

    loadData();
  }, [router, supabase]);

  const handleTogglePush = async () => {
    if (!userId) return;
    setPushLoading(true);
    try {
      if (pushEnabled) {
        const ok = await unsubscribeFromPush(userId);
        if (ok) setPushEnabled(false);
      } else {
        const ok = await subscribeToPush(userId);
        if (ok) setPushEnabled(true);
      }
    } catch (err) {
      console.error("Failed to toggle push notifications:", err);
    } finally {
      setPushLoading(false);
    }
  };

  const handleSaveNotifPrefs = async () => {
    if (!userId) return;
    setSavingNotifs(true);
    try {
      const { error } = await supabase
        .from("user_settings" as any)
        .update({
          notification_preferences: notifPrefs,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("user_id", userId);

      if (error) throw error;
      alert("Notification preferences saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to save preferences: " + (err.message || err));
    } finally {
      setSavingNotifs(false);
    }
  };

  // Actions: Goals Save
  const handleSaveGoals = async () => {
    if (!userId) return;
    setSavingGoals(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          water_goal_ml: Number(waterGoal),
          steps_goal: Number(stepsGoal),
          calories_goal: Number(caloriesGoal),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
      alert("Daily goals updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to update goals: " + (err.message || err));
    } finally {
      setSavingGoals(false);
    }
  };

  // Actions: Account Save
  const handleSaveAccount = async () => {
    if (!userId) return;
    setSavingAccount(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      
      if (displayName.trim() === "S" || displayName.trim() === "A") {
        await supabase
          .from("user_settings")
          .update({ active_profile: displayName.trim() as "S" | "A" })
          .eq("user_id", userId);
      }

      alert("Account information updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to update account: " + (err.message || err));
    } finally {
      setSavingAccount(false);
    }
  };

  // Actions: Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loadingSettings) {
    return (
      <div className="pb-24 pt-8 px-4 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-[var(--accent-start)]" />
        <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-widest">
          Loading settings panel...
        </p>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide uppercase">
          SETTINGS
        </h1>
        <p className="font-body text-xs font-body-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
          Configure preferences, goals and integrations
        </p>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Notifications & Device Setup */}
        <Card variant="surface" className="p-6 space-y-4 flex flex-col justify-between border-[#27272a]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
              <Bell size={22} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                Device Push Status
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#09090b] border border-[#27272a]">
                <div>
                  <p className="font-body text-xs font-bold text-[var(--text-primary)]">PWA Push Notifications</p>
                  <p className="font-body text-[10px] text-[var(--text-muted)] mt-0.5">
                    {pushEnabled ? "Enabled ✓" : "Receive instant alerts on badge unlocks & reminders"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePush}
                  disabled={pushLoading}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    pushEnabled ? "bg-[var(--accent-start)]" : "bg-[#27272a]"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] font-bold text-black",
                      pushEnabled ? "translate-x-5" : "translate-x-0"
                    )}
                  >
                    {pushLoading ? <CircleNotch size={10} className="animate-spin text-black" /> : pushEnabled ? <Check size={12} weight="bold" /> : null}
                  </span>
                </button>
              </div>

              {pushEnabled && (
                <div className="p-3 rounded-xl bg-[var(--green-soft)] border border-[#27272a] text-[11px] font-body text-[var(--green)] flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="shrink-0" />
                  <span>Active on this device: <strong>{deviceLabel}</strong></span>
                </div>
              )}

              <p className="text-[10px] font-body text-[var(--text-muted)] leading-relaxed italic border-t border-[#27272a]/60 pt-2">
                * Note: Push notifications require app installed to Home Screen on iOS 16.4+. Android Chrome &amp; desktop browsers work directly.
              </p>
            </div>
          </div>
        </Card>

        {/* 2. Daily Goals Configuration */}
        <Card variant="surface" className="p-6 space-y-4 flex flex-col justify-between border-[#27272a]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
              <Target size={22} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                Daily Goals
              </h2>
            </div>

            {/* Water Goal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Water Target (ml)
              </label>
              <input
                type="number"
                value={waterGoal}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
                className="w-full bg-[var(--bg-base)] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
              />
            </div>

            {/* Steps Goal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Steps Target
              </label>
              <input
                type="number"
                value={stepsGoal}
                onChange={(e) => setStepsGoal(Number(e.target.value))}
                className="w-full bg-[var(--bg-base)] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
              />
            </div>

            {/* Calories Goal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Calories Target (kcal)
              </label>
              <input
                type="number"
                value={caloriesGoal}
                onChange={(e) => setCaloriesGoal(Number(e.target.value))}
                className="w-full bg-[var(--bg-base)] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#27272a]/40 mt-4">
            <Button
              fullWidth
              variant="primary"
              disabled={savingGoals}
              onClick={handleSaveGoals}
              className="text-[10px] font-display uppercase tracking-widest font-black py-2.5"
            >
              {savingGoals ? "Saving..." : "Save Daily Goals"}
            </Button>
          </div>
        </Card>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          DETAILED NOTIFICATION PREFERENCES (Time-based & Rules)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card variant="surface" className="p-6 space-y-6 border-[#27272a]">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-2.5">
            <Bell size={24} className="text-[var(--accent-text)]" />
            <div>
              <h2 className="font-display text-xl tracking-wider text-[var(--text-primary)] uppercase">
                NOTIFICATION PREFERENCES
              </h2>
              <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
                Customize alert times, automated rules, and partner activity sync
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Time-Based Reminders */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#27272a]/60 pb-2">
              <Clock size={18} className="text-[var(--accent-text)]" />
              <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                Daily Reminder Times
              </h3>
            </div>

            <div className="space-y-3">
              {/* Workout Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Workout Reminder (AM)
                </label>
                <input
                  type="time"
                  value={notifPrefs.workout_time}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, workout_time: e.target.value })}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-body"
                />
              </div>

              {/* Supplement Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Morning Supplement Time
                </label>
                <input
                  type="time"
                  value={notifPrefs.supplement_time}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, supplement_time: e.target.value })}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-body"
                />
              </div>

              {/* Water Times (4 slots) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Water Check-ins (4 Slots)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {notifPrefs.water_times.map((t, idx) => (
                    <input
                      key={idx}
                      type="time"
                      value={t}
                      onChange={(e) => {
                        const newTimes = [...notifPrefs.water_times];
                        newTimes[idx] = e.target.value;
                        setNotifPrefs({ ...notifPrefs, water_times: newTimes });
                      }}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-body"
                    />
                  ))}
                </div>
              </div>

              {/* Night Log Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Nightly Log Reminder
                </label>
                <input
                  type="time"
                  value={notifPrefs.night_log_time}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, night_log_time: e.target.value })}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-body"
                />
              </div>

              {/* Sunday Recap */}
              <div className="space-y-1">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Sunday Weekly Recap
                </label>
                <input
                  type="time"
                  value={notifPrefs.weekly_recap_time}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, weekly_recap_time: e.target.value })}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-body"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Event Rules & Streaks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#27272a]/60 pb-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                Automated Event Rules
              </h3>
            </div>

            <div className="space-y-2.5">
              {[
                { key: "enable_streak_protection", label: "Streak Protection (8 PM)", desc: "Alerts if no workout logged by 8 PM" },
                { key: "enable_streak_risk", label: "Streak Risk Warning", desc: "Alerts if inactive for 23+ hours" },
                { key: "enable_milestone_celebrations", label: "Milestone Celebrations", desc: "Instant alerts on badge unlock & phase completion" },
                { key: "enable_ai_nudges", label: "Smart AI Coach Nudges", desc: "Recovery advice after 3 missed workouts" },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 p-3 rounded-xl bg-[#09090b] border border-[#27272a] cursor-pointer hover:border-[#FF6B00]/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={(notifPrefs as any)[key]}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                    className="mt-0.5 rounded border-[#27272a] text-[var(--accent-start)] focus:ring-0 w-4 h-4 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-body text-xs font-bold text-[var(--text-primary)]">{label}</p>
                    <p className="font-body text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Column 3: Partner Sync (Saba <-> Ancy) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#27272a]/60 pb-2">
              <Users size={18} className="text-purple-400" />
              <h3 className="font-display text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                Partner Sync Alerts
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
              {[
                { key: "enable_partner_workout", label: "Partner Workout Crushed" },
                { key: "enable_partner_nutrition", label: "Partner Meals Logged" },
                { key: "enable_partner_water", label: "Partner Water Goal Hit" },
                { key: "enable_partner_supplements", label: "Partner Supplements Taken" },
                { key: "enable_partner_body_stats", label: "Partner Weight/Stats Logged" },
                { key: "enable_partner_photos", label: "Partner Progress Photo Added" },
                { key: "enable_partner_badges", label: "Partner Badge Unlocked" },
                { key: "enable_partner_streaks", label: "Partner Streak Milestone" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] border border-[#27272a] cursor-pointer hover:border-purple-500/40 transition-colors">
                  <span className="font-body text-xs text-[var(--text-primary)] font-medium">{label}</span>
                  <input
                    type="checkbox"
                    checked={(notifPrefs as any)[key]}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                    className="rounded border-[#27272a] text-purple-500 focus:ring-0 w-4 h-4 shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#27272a]/60 flex justify-end">
          <Button
            variant="primary"
            disabled={savingNotifs}
            onClick={handleSaveNotifPrefs}
            className="text-xs font-display uppercase tracking-widest font-black py-2.5 px-6"
          >
            {savingNotifs ? "Saving Preferences..." : "Save Notification Preferences"}
          </Button>
        </div>
      </Card>

      {/* Grid Sections 3 & 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. AI Configuration (Locked) */}
        <Card variant="surface" className="p-6 space-y-4 flex flex-col justify-between relative overflow-hidden border-[#27272a]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <Robot size={22} className="text-[var(--accent-text)]" />
                <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                  AI Configuration
                </h2>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-body-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-start)]/10 text-[var(--accent-text)] border border-[#27272a]">
                <LockKey size={12} weight="fill" /> System Managed
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[#27272a] space-y-2">
              <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-[var(--text-primary)] font-bold">
                <LockKey size={16} className="text-[var(--accent-text)]" />
                <span>Anthropic Claude AI Active</span>
              </div>
              <p className="text-[11px] font-body text-[var(--text-muted)] leading-relaxed">
                The Claude Sonnet AI integration is active system-wide for meal plate analysis, scale scanning, and coach insights.
              </p>
            </div>
          </div>
        </Card>

        {/* 4. Appearance & Account */}
        <Card variant="surface" className="p-6 space-y-4 flex flex-col justify-between border-[#27272a]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
              <User size={22} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                Account &amp; Theme
              </h2>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Application Theme
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[var(--bg-base)] border border-[#27272a] p-1 rounded-xl w-full">
                {([
                  { label: "Dark", val: "dark" },
                  { label: "Light", val: "light" },
                  { label: "System", val: "system" },
                ] as const).map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setTheme(opt.val)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-display uppercase tracking-wider transition-colors text-center font-bold",
                      theme === opt.val
                        ? "bg-[var(--accent-start)] text-white"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Profile Tag (S / A)
              </label>
              <input
                type="text"
                value={displayName}
                maxLength={2}
                onChange={(e) => setDisplayName(e.target.value.toUpperCase())}
                placeholder="e.g. S"
                className="w-full bg-[var(--bg-base)] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-[#27272a]/40 mt-4">
            <Button
              fullWidth
              variant="secondary"
              disabled={savingAccount}
              onClick={handleSaveAccount}
              className="text-[10px] font-display uppercase tracking-widest font-black py-2.5"
            >
              {savingAccount ? "Saving..." : "Save Account Info"}
            </Button>

            <Button
              fullWidth
              variant="ghost"
              onClick={handleSignOut}
              className="text-[10px] font-display uppercase tracking-widest font-black py-2.5 text-[var(--red)] border border-[var(--red)]/20 hover:bg-[var(--red)]/5 flex items-center justify-center gap-1.5"
            >
              <SignOut size={14} />
              Sign Out Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
