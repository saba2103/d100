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
  Compass,
  Bell,
  MapTrifold,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import { useAppUser } from "@/lib/contexts/AppContext";
import { ThemeToggle } from "./ThemeToggle";
import { SASwitcher } from "./SASwitcher";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  isComingSoon?: boolean;
}

interface NavSection {
  title: string | null;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [
      { href: "/dashboard", label: "Home", icon: HouseSimple },
      { href: "/insights", label: "AI Insights", icon: Robot },
    ],
  },
  {
    title: "Tracking",
    items: [
      { href: "/workout", label: "Workout", icon: Barbell },
      { href: "/steps", label: "Steps", icon: Footprints },
      { href: "/nutrition", label: "Nutrition", icon: ForkKnife },
      { href: "/water", label: "Water", icon: Drop },
      { href: "/supplements", label: "Supplements", icon: Sparkle },
      { href: "/body-stats", label: "Body Stats", icon: ChartLineUp },
      { href: "/badges", label: "Achievements", icon: Trophy },
    ],
  },
  {
    title: "Journey",
    items: [
      { href: "/journey", label: "Journey", icon: MapTrifold },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/course", label: "Course", icon: BookOpen },
      { href: "/collection", label: "Collection", icon: Images },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: UserCircle },
      { href: "/settings", label: "Settings", icon: GearSix },
    ],
  },
];

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
      <div className="px-3.5 mb-4 flex items-center justify-between h-10 shrink-0">
        <Link href="/dashboard" className="flex items-center">
          <span className="font-display text-2xl tracking-wider text-gradient font-black lg:hidden">
            D
          </span>
          <span className="font-display text-3xl tracking-wider text-gradient font-black hidden lg:block">
            D100
          </span>
        </Link>

        {/* Notifications (Desktop & Tab) */}
        <Link
          href="/notifications"
          className="relative p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors duration-150 flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)]" />
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 px-2 custom-scrollbar" aria-label="Sidebar Navigation">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <h3 className="text-[10px] font-body-bold tracking-widest text-[var(--text-muted)] uppercase px-4 pt-2 pb-1 hidden lg:block">
                {section.title}
              </h3>
            )}
            {section.items.map(({ href, label, icon: Icon, isComingSoon }) => {
              const isActive = !isComingSoon && (pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/")));
              
              if (isComingSoon) {
                return (
                  <div
                    key={label}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl py-2 transition-all duration-150 opacity-60 cursor-not-allowed",
                      "justify-center px-0 lg:justify-start lg:px-4",
                      "text-[var(--text-muted)]"
                    )}
                  >
                    <div className="relative flex items-center justify-center rounded-lg">
                      <Icon size={20} />
                    </div>
                    <span className="font-body font-medium text-sm hidden lg:flex items-center justify-between flex-1">
                      {label}
                      <span className="text-[9px] font-display uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--accent-start)]/10 text-[var(--accent-text)] border border-[var(--accent-start)]/20">
                        Soon
                      </span>
                    </span>
                    <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[var(--bg-surface)] text-[var(--text-primary)] rounded border border-[var(--border)] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 lg:hidden">
                      {label} (Coming Soon)
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl py-2 transition-all duration-150",
                    "justify-center px-0 lg:justify-start lg:px-4",
                    isActive
                      ? "bg-[rgba(249,115,22,0.08)] text-[var(--accent-text)] font-semibold"
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
                      isActive && "sm:bg-[rgba(249,115,22,0.15)] sm:p-1.5 lg:bg-transparent lg:p-0"
                    )}
                  >
                    <Icon size={20} weight={isActive ? "fill" : "regular"} />
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
          </div>
        ))}
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
