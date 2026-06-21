"use client";

import { usePathname } from "next/navigation";
import { Bell } from "@phosphor-icons/react";
import { SASwitcher } from "./SASwitcher";

const getTitle = (pathname: string) => {
  if (pathname.includes("/dashboard")) return "Dashboard";
  if (pathname.includes("/workout")) return "Workout";
  if (pathname.includes("/nutrition")) return "Nutrition";
  if (pathname.includes("/body-stats")) return "Body Stats";
  if (pathname.includes("/course")) return "Course";
  if (pathname.includes("/collection")) return "Collection";
  if (pathname.includes("/profile")) return "Profile";
  if (pathname.includes("/settings")) return "Settings";
  return "D100";
};

export function TopBar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 sm:left-[60px] lg:hidden">
      {/* Title */}
      <h1 className="font-display text-2xl tracking-wider text-[var(--text-primary)] uppercase">
        {title}
      </h1>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        <SASwitcher />
        <button
          className="relative p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors duration-150"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {/* Notification badge */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)]" />
        </button>
      </div>
    </header>
  );
}
