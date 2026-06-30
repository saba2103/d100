"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser as useAuthUser } from "@/lib/hooks/useUser";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserSettings } from "@/lib/types/database";

// ── Types ──────────────────────────────────────────────────────────
export type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  settings: UserSettings | null;
  activeProfile: "S" | "P";
  setActiveProfile: (profile: "S" | "P") => Promise<void>;
  loading: boolean;
  isPartnerConnected: boolean;
  refresh: () => Promise<void>;
}

// ── Contexts ───────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const UserContext = createContext<UserContextType | undefined>(undefined);

// ── Theme Provider Inner ───────────────────────────────────────────
export function ThemeProvider({
  children,
  settings,
  onThemeChange,
}: {
  children: React.ReactNode;
  settings: UserSettings | null;
  onThemeChange?: (theme: Theme) => Promise<void>;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Sync with HTML class
  const applyTheme = (t: Theme) => {
    const html = document.documentElement;
    const isDark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      html.classList.remove("light");
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }
  };

  useEffect(() => {
    // 1. Initial resolution (Settings -> LocalStorage -> System preference)
    const stored = localStorage.getItem("d100-theme") as Theme | null;
    const initialTheme: Theme = settings?.theme || stored || "dark";
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, [settings?.theme]);

  // Handle system preference changes if theme is set to 'system'
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = async (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem("d100-theme", t);
    if (onThemeChange) {
      await onThemeChange(t);
    }
  };

  const toggleTheme = async () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    await setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── User Provider Inner ────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, loading: authLoading, refresh: refreshAuth } = useAuthUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeProfile, setActiveProfileState] = useState<"S" | "P">("S");
  const [loading, setLoading] = useState(true);
  const [isPartnerConnected, setIsPartnerConnected] = useState(false);

  const fetchSettings = useCallback(async (userId: string) => {
    const supabase = createClient();
    
    // Fetch logged in user's profile info
    const { data: myProfile } = await (supabase as any)
      .from("profiles")
      .select("email, partner_email")
      .eq("id", userId)
      .single();

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setSettings(data);
      if (data.active_profile === "S" || data.active_profile === "P") {
        setActiveProfileState(data.active_profile);
      }

      // Check partner connection (two-way link)
      if (myProfile?.partner_email) {
        const partnerEmail = (myProfile.partner_email as string).trim().toLowerCase();
        const { data: partnerProfile } = await (supabase as any)
          .from("profiles")
          .select("email, partner_email")
          .eq("email", partnerEmail)
          .maybeSingle();

        const selfEmail = (myProfile.email as string)?.trim().toLowerCase();
        const partnerLinksBack = (partnerProfile?.partner_email as string)?.trim().toLowerCase() === selfEmail;
        setIsPartnerConnected(!!(partnerProfile && partnerLinksBack));
      } else {
        setIsPartnerConnected(false);
      }
    } else if (error && error.code === "PGRST116") {
      // Check if logged in user is Ancy to set default active_profile
      const userEmail = myProfile?.email?.toLowerCase() || "";
      const isUserAncy = userEmail.includes("ancy");
      const defaultActiveProfile = isUserAncy ? "A" : "S";

      // Row not found, create default settings
      const defaultSettings = {
        user_id: userId,
        theme: "dark" as const,
        ai_provider: "openai" as const,
        ai_api_key_encrypted: null,
        water_goal_ml: 3000,
        steps_goal: 10000,
        calories_goal: 2000,
        active_profile: defaultActiveProfile as "S" | "P",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted } = await supabase
        .from("user_settings")
        .insert([defaultSettings])
        .select()
        .single();
      if (inserted) {
        setSettings(inserted);
        setActiveProfileState(inserted.active_profile as "S" | "P");
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    await refreshAuth();
    if (user) {
      await fetchSettings(user.id);
    }
  }, [user, refreshAuth, fetchSettings]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        let resolved = false;
        const recoveryTimer = setTimeout(() => {
          if (!resolved) {
            console.warn("fetchSettings timed out after 1200ms, bypassing loading block...");
            setLoading(false);
          }
        }, 1200);

        fetchSettings(user.id)
          .catch((err) => console.error("fetchSettings error:", err))
          .finally(() => {
            resolved = true;
            clearTimeout(recoveryTimer);
            setLoading(false);
          });
      } else {
        setSettings(null);
        setLoading(false);
      }
    }
  }, [user, authLoading, fetchSettings]);

  const setActiveProfile = async (p: "S" | "P") => {
    setActiveProfileState(p);
    if (user) {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_settings")
        .update({ active_profile: p })
        .eq("user_id", user.id);

      if (!error) {
        setSettings((prev) => prev ? { ...prev, active_profile: p } : null);
      }
    }
  };

  const handleThemeChange = async (t: Theme) => {
    if (user) {
      const supabase = createClient();
      await supabase
        .from("user_settings")
        .update({ theme: t })
        .eq("user_id", user.id);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        settings,
        activeProfile,
        setActiveProfile,
        loading: authLoading || loading,
        isPartnerConnected,
        refresh,
      }}
    >
      <ThemeProvider settings={settings} onThemeChange={handleThemeChange}>
        {children}
      </ThemeProvider>
    </UserContext.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────
export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return context;
}

export function useAppUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAppUser must be used within AppProvider");
  }
  return context;
}
