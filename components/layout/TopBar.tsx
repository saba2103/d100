"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, UserCircle } from "@phosphor-icons/react";
import { SASwitcher } from "./SASwitcher";

const getTitle = (pathname: string) => {
  if (pathname.includes("/dashboard")) return "Home";
  if (pathname.includes("/workout")) return "Workout";
  if (pathname.includes("/nutrition")) return "Nutrition";
  if (pathname.includes("/body-stats")) return "Body Stats";
  if (pathname.includes("/course")) return "Course";
  if (pathname.includes("/collection")) return "Collection";
  if (pathname.includes("/profile")) return "Profile";
  if (pathname.includes("/settings")) return "Settings";
  if (pathname.includes("/insights")) return "AI Insights";
  if (pathname.includes("/steps")) return "Steps";
  if (pathname.includes("/water")) return "Water";
  if (pathname.includes("/supplements")) return "Supplements";
  if (pathname.includes("/badges")) return "Achievements";
  return "D100";
};

export function TopBar() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const isProfileActive = pathname === "/profile";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 sm:left-[60px] lg:hidden">
      {/* Title */}
      <h1 className="font-display text-2xl tracking-wider text-[var(--text-primary)] uppercase">
        {title}
      </h1>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <SASwitcher />
        <Link
          href="/notifications"
          className="relative p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors duration-150 flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)]" />
        </Link>
        <Link
          href="/profile"
          className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors duration-150 flex items-center justify-center"
          aria-label="Profile"
        >
          <UserCircle
            size={24}
            weight={isProfileActive ? "fill" : "regular"}
            className={isProfileActive ? "text-[var(--accent-text)]" : ""}
          />
        </Link>
      </div>
    </header>
  );
}
