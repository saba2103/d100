"use client";

import { useAppTheme } from "@/lib/contexts/AppContext";
import { Sun, Moon } from "@phosphor-icons/react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 relative group"
      aria-label={`Switch theme (currently ${theme})`}
    >
      {theme === "light" ? (
        <Moon size={22} weight="regular" />
      ) : (
        <Sun size={22} weight="regular" />
      )}
      {/* Tooltip for desktop hover */}
      <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-[var(--bg-surface)] text-[var(--text-primary)] rounded border border-[var(--border)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
        Toggle Theme
      </span>
    </button>
  );
}
