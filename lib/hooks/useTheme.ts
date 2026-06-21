"use client";

import { useEffect, useState, useCallback } from "react";
import type { Theme } from "@/lib/types";

const STORAGE_KEY = "d100-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const preferred =
      stored ??
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    applyTheme(preferred);
    setTheme(preferred);
  }, []);

  const applyTheme = (t: Theme) => {
    const html = document.documentElement;
    if (t === "light") {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
  };

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const set = useCallback((t: Theme) => {
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
    setTheme(t);
  }, []);

  return { theme, toggle, set, isDark: theme === "dark" };
}
