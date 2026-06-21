"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseSimple,
  Barbell,
  ForkKnife,
  ChartLineUp,
  BookOpen,
  Images,
  UserCircle,
  GearSix,
  SignOut,
  Trophy,
  Robot,
  Footprints,
  Drop,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import { useAppUser } from "@/lib/contexts/AppContext";
import { ThemeToggle } from "./ThemeToggle";
import { SASwitcher } from "./SASwitcher";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HouseSimple },
  { href: "/insights", label: "AI Insights", icon: Robot },
  { href: "/workout", label: "Workout", icon: Barbell },
  { href: "/nutrition", label: "Nutrition", icon: ForkKnife },
  { href: "/supplements", label: "Supplements", icon: Sparkle },
  { href: "/steps", label: "Steps", icon: Footprints },
  { href: "/water", label: "Water", icon: Drop },
  { href: "/body-stats", label: "Body Stats", icon: ChartLineUp },
  { href: "/course", label: "Course", icon: BookOpen },
  { href: "/collection", label: "Collection", icon: Images },
  { href: "/badges", label: "Achievements", icon: Trophy },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: GearSix },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user, profile } = useAppUser();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed bottom-0 top-0 left-0 z-30 hidden flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] py-4 transition-all duration-200",
        "sm:flex sm:w-[60px] lg:w-[220px]"
      )}
    >
      {/* Brand Header */}
      <div className="px-4 mb-6 flex items-center justify-center lg:justify-start h-10">
        <Link href="/dashboard" className="flex items-center">
          <span className="font-display text-2xl tracking-wider text-gradient font-black lg:hidden">
            D
          </span>
          <span className="font-display text-3xl tracking-wider text-gradient font-black hidden lg:block">
            D100
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 px-2" aria-label="Sidebar Navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl py-2.5 transition-all duration-150",
                // Tablet layout
                "justify-center px-0 lg:justify-start lg:px-4",
                isActive
                  ? "bg-[rgba(249,115,22,0.08)] text-[var(--accent-text)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)]"
              )}
            >
              {/* Active Left Indicator Pill (Desktop) */}
              {isActive && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-gradient-to-b from-[var(--accent-start)] to-[var(--accent-end)] hidden lg:block" />
              )}

              {/* Icon Container with active pill highlight (Tablet) */}
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-105",
                  isActive && "sm:bg-[rgba(249,115,22,0.15)] sm:p-2 lg:bg-transparent lg:p-0"
                )}
              >
                <Icon size={22} weight={isActive ? "fill" : "regular"} />
              </div>

              {/* Label Text (Desktop only) */}
              <span
                className={cn(
                  "font-body font-medium text-sm hidden lg:block",
                  isActive ? "text-[var(--accent-text)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                )}
              >
                {label}
              </span>

              {/* Tooltip for Tablet layout */}
              <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[var(--bg-surface)] text-[var(--text-primary)] rounded border border-[var(--border)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 lg:hidden">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto px-2 space-y-4">
        {/* Switcher & Theme Control (Tablet) */}
        <div className="flex flex-col items-center gap-3 lg:hidden">
          <ThemeToggle />
          <SASwitcher className="w-11" />
        </div>

        {/* Switcher & Theme Control (Desktop) */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:px-2">
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <span className="text-xs text-[var(--text-muted)] font-body">Profile</span>
            <SASwitcher />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-body">Appearance</span>
            <ThemeToggle />
          </div>
        </div>

        {/* User profile & Info */}
        <div className="border-t border-[var(--border)] pt-4 px-2">
          {/* Tablet Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full py-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150 lg:hidden group relative"
            aria-label="Sign Out"
          >
            <SignOut size={20} />
            <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[var(--bg-surface)] text-[var(--text-primary)] rounded border border-[var(--border)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              Sign Out
            </span>
          </button>

          {/* Desktop User Panel */}
          <div className="hidden lg:flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-body font-body-bold text-xs truncate text-[var(--text-primary)]">
                {profile?.full_name || "User"}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-body truncate">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all duration-150"
              aria-label="Sign out"
            >
              <SignOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
