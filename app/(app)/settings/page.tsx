"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppTheme } from "@/lib/contexts/AppContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Gear,
  Target,
  PaintBrush,
  User,
  Robot,
  CheckCircle,
  XCircle,
  SignOut,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useAppTheme();

  // Settings & Profile loading states
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingGoals, setSavingGoals] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  // States: AI Config
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [apiKey, setApiKey] = useState("");
  const [keyExists, setKeyExists] = useState(false);
  const [keyLast4, setKeyLast4] = useState("");
  const [testResult, setTestResult] = useState<"success" | "fail" | null>(null);

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

        // Fetch sanitized settings from server API
        const settingsRes = await fetch("/api/settings/get");
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setProvider(settings.ai_provider || "openai");
          setKeyExists(settings.keyExists);
          setKeyLast4(settings.keyLast4);
          setWaterGoal(settings.water_goal_ml || 3000);
          setStepsGoal(settings.steps_goal || 10000);
          setCaloriesGoal(settings.calories_goal || 2000);
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

  // Actions: AI Config Save
  const handleSaveKey = async () => {
    setSavingKey(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });

      if (res.ok) {
        if (apiKey.trim() !== "") {
          setKeyExists(true);
          setKeyLast4(apiKey.trim().slice(-4));
        } else {
          setKeyExists(false);
          setKeyLast4("");
        }
        setApiKey("");
        alert("AI configuration saved successfully!");
      } else {
        const err = await res.json();
        alert("Failed to save: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save AI configuration.");
    } finally {
      setSavingKey(false);
    }
  };

  // Actions: Test connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult("success");
      } else {
        setTestResult("fail");
      }
    } catch (err) {
      console.error(err);
      setTestResult("fail");
    } finally {
      setTestingConnection(false);
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
      
      // Also update active_profile in user_settings if display name changes
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
        {/* 1. AI Configuration */}
        <Card variant="surface" className="p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Robot size={22} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                AI Configuration
              </h2>
            </div>

            {/* Provider Switcher */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                AI Service Provider
              </label>
              <div className="flex bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-1 w-max">
                {(["openai", "anthropic"] as const).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => {
                      setProvider(prov);
                      setTestResult(null);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wider transition-colors",
                      provider === prov
                        ? "bg-[var(--accent-start)] text-white font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {prov === "openai" ? "OpenAI" : "Anthropic"}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                  API Key
                </label>
                {keyExists && (
                  <span className="text-[9px] font-body text-[var(--green)] font-bold">
                    Key Saved (ends in {keyLast4})
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder={keyExists ? "••••••••••••••••••••••••" : "Enter API Key"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
              />
            </div>

            {/* Test Results Banner */}
            {testResult && (
              <div
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl text-xs font-body border",
                  testResult === "success"
                    ? "bg-[var(--green)]/5 border-[var(--green)]/20 text-[var(--green)]"
                    : "bg-[var(--red)]/5 border-[var(--red)]/20 text-[var(--red)]"
                )}
              >
                {testResult === "success" ? (
                  <>
                    <CheckCircle size={16} weight="fill" />
                    <span>Connection successful! Key is valid.</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} weight="fill" />
                    <span>Connection failed. Please check provider settings or key.</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--border)]/40 mt-4">
            <Button
              className="flex-1 text-[10px] font-display uppercase tracking-widest font-black py-2.5"
              variant="secondary"
              disabled={testingConnection}
              onClick={handleTestConnection}
            >
              {testingConnection ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              className="flex-1 text-[10px] font-display uppercase tracking-widest font-black py-2.5"
              variant="primary"
              disabled={savingKey}
              onClick={handleSaveKey}
            >
              {savingKey ? "Saving..." : "Save Key"}
            </Button>
          </div>
        </Card>

        {/* 2. Goals Configuration */}
        <Card variant="surface" className="p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
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
                className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
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
                className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
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
                className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]/40 mt-4">
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

        {/* 3. Appearance */}
        <Card variant="surface" className="p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <PaintBrush size={22} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                Appearance
              </h2>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Application Theme
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[var(--bg-base)] border border-[var(--border)] p-1 rounded-xl w-full">
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
          </div>
        </Card>

        {/* 4. Account Settings */}
        <Card variant="surface" className="p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <User size={22} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                Account Settings
              </h2>
            </div>

            {/* Display Name / Profile switch */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Profile display tag (S / A)
              </label>
              <input
                type="text"
                value={displayName}
                maxLength={2}
                onChange={(e) => setDisplayName(e.target.value.toUpperCase())}
                placeholder="e.g. S"
                className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
              />
            </div>

            {/* Start Date (Read only) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Program Start Date
              </label>
              <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-muted)] font-body">
                {startDate ? new Date(startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }) : "Not Set"}
              </div>
              <span className="text-[9px] font-body text-[var(--text-muted)] italic">
                * Contact support to modify your program starting date.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border)]/40 mt-4">
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
