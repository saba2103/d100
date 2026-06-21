"use client";

import React, { useState } from "react";
import {
  Card,
  HeroCard,
} from "@/components/ui/Card";
import {
  StatCard,
  StatRing,
  StatBar,
} from "@/components/ui/Stats";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Toggle } from "@/components/ui/Toggle";
import { Checkbox } from "@/components/ui/Checkbox";
import { ProgramBadge, BADGE_CONFIGS } from "@/components/ui/ProgramBadge";
import { StreakWidget } from "@/components/ui/StreakWidget";
import {
  SectionHeader,
  EmptyState,
  Skeleton,
  Divider,
  Toast,
  Modal,
  BottomSheet,
} from "@/components/ui/Misc";
import {
  Barbell,
  ForkKnife,
  Flame,
  Plus,
  Trash,
  CheckCircle,
  Question,
  Bell,
} from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";

export default function DesignSystemPage() {
  // Input states
  const [toggleVal, setToggleVal] = useState(false);
  const [checkVal, setCheckVal] = useState(false);

  // Trigger states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast(null);
    setTimeout(() => {
      setToast({ message, type });
    }, 100);
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Design System Header */}
      <header className="border-b border-[var(--border)] pb-6">
        <h1 className="display-2xl text-gradient uppercase">Design System</h1>
        <p className="body-md text-[var(--text-secondary)] mt-1">
          D100 App UI component library & reference styles.
        </p>
      </header>

      {/* Typography Section */}
      <section className="space-y-4">
        <SectionHeader title="Typography Helpers" />
        <Card variant="surface" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 border-r border-[var(--border)] pr-6">
            <h3 className="label-lg text-[var(--text-muted)] uppercase tracking-wider mb-2">Display Fonts</h3>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.display-2xl (Bebas Neue 56px)</p>
              <h1 className="display-2xl">D100 APP</h1>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.display-xl (Bebas Neue 40px)</p>
              <h1 className="display-xl">100 DAYS</h1>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.display-lg (Bebas Neue 32px)</p>
              <h1 className="display-lg">Workout Phase 1</h1>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.display-md (Bebas Neue 24px)</p>
              <h1 className="display-md">Hydration Goal</h1>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="label-lg text-[var(--text-muted)] uppercase tracking-wider mb-2">Body & Label Fonts</h3>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.label-lg (DM Sans 500 18px)</p>
              <p className="label-lg text-[var(--text-primary)]">Settings and Account Profile Details</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.label-md (DM Sans 500 14px)</p>
              <p className="label-md text-[var(--text-primary)]">DAILY NUTRITION INTAKE</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.label-sm (DM Sans 500 12px)</p>
              <p className="label-sm text-[var(--text-muted)]">ACTIVE WORKOUT TIME</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.body-md (DM Sans 400 15px)</p>
              <p className="body-md text-[var(--text-secondary)]">
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">.body-sm (DM Sans 400 13px)</p>
              <p className="body-sm text-[var(--text-muted)]">
                Subtext style for captions, hints, and error banners.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Cards Section */}
      <section className="space-y-4">
        <SectionHeader title="Cards" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HeroCard>
            <h2 className="display-lg">Day Progress</h2>
            <p className="display-2xl mt-2">Day 43</p>
            <p className="body-md text-white/90 mt-1">Keep pushing Saba, you are doing incredible!</p>
          </HeroCard>

          <div className="grid grid-cols-1 gap-4">
            <Card variant="default">
              <h4 className="label-lg">Card Variant: Default</h4>
              <p className="body-sm text-[var(--text-secondary)]">Base container background matching root base color.</p>
            </Card>
            <Card variant="surface">
              <h4 className="label-lg">Card Variant: Surface</h4>
              <p className="body-sm text-[var(--text-secondary)]">Secondary background container for grid cards.</p>
            </Card>
            <Card variant="elevated">
              <h4 className="label-lg">Card Variant: Elevated</h4>
              <p className="body-sm text-[var(--text-secondary)]">Elevated container background card for highlights.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="space-y-4">
        <SectionHeader title="Stats Indicators" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Calories" value="1,840" unit="kcal" icon={Flame} color="orange" trend="+12%" />
          <StatCard label="Workouts" value="12" unit="sessions" icon={Barbell} color="blue" trend="+3%" />
          <StatCard label="Hydration" value="2,400" unit="ml" icon={ForkKnife} color="purple" trend="-5%" trendDirection="down" />
          <StatCard label="Remaining" value="45" unit="days" icon={CheckCircle} color="green" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Card variant="surface">
            <h4 className="label-md uppercase mb-4 text-[var(--text-muted)]">Progress Rings (StatRing)</h4>
            <div className="flex justify-around items-center py-4">
              <StatRing value={35} color="red" label="Calories" />
              <StatRing value={65} color="blue" label="Workout" />
              <StatRing value={85} color="green" label="Hydration" />
              <StatRing value={100} color="orange" label="Completed" />
            </div>
          </Card>

          <Card variant="surface" className="flex flex-col justify-between">
            <div>
              <h4 className="label-md uppercase mb-4 text-[var(--text-muted)]">Horizontal Progress Bars (StatBar)</h4>
              <div className="space-y-4 py-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Protein</span>
                    <span>75%</span>
                  </div>
                  <StatBar value={75} color="orange" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Carbs</span>
                    <span>45%</span>
                  </div>
                  <StatBar value={45} color="blue" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Fats</span>
                    <span>90%</span>
                  </div>
                  <StatBar value={90} color="purple" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-4">
        <SectionHeader title="Buttons" />
        <Card variant="surface" className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" size="sm">Primary Sm</Button>
            <Button variant="primary" size="md">Primary Md</Button>
            <Button variant="primary" size="lg">Primary Lg</Button>
            <Button variant="primary" size="md" loading>Loading</Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="secondary" size="sm">Secondary Sm</Button>
            <Button variant="secondary" size="md">Secondary Md</Button>
            <Button variant="secondary" size="lg">Secondary Lg</Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="ghost" size="sm" icon={Plus}>Ghost Sm</Button>
            <Button variant="ghost" size="md" icon={Plus}>Ghost Md</Button>
            <Button variant="ghost" size="lg" icon={Plus}>Ghost Lg</Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="danger" size="sm" icon={Trash}>Danger Sm</Button>
            <Button variant="danger" size="md" icon={Trash}>Danger Md</Button>
            <Button variant="danger" size="lg" icon={Trash}>Danger Lg</Button>
          </div>
        </Card>
      </section>

      {/* Inputs & Fields */}
      <section className="space-y-4">
        <SectionHeader title="Input Controls" />
        <Card variant="surface" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input label="Name" placeholder="Enter full name" />
            <Input label="Email Address" error="Please enter a valid email" defaultValue="invalid-email" />
            <DatePicker label="Program Start Date" />
          </div>

          <div className="space-y-6">
            <Select label="Active Phase" defaultValue="1">
              <option value="1">Phase 1: Spark</option>
              <option value="2">Phase 2: Build</option>
              <option value="3">Phase 3: Ultimate</option>
            </Select>

            <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-4">
              <Toggle checked={toggleVal} onChange={setToggleVal} label="Enable Daily Reminders" />
              <Checkbox checked={checkVal} onChange={setCheckVal} label="I agree to follow the rules" />
            </div>
          </div>
        </Card>
      </section>

      {/* Streak Widgets */}
      <section className="space-y-4">
        <SectionHeader title="Streak Indicator" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StreakWidget streak={0} />
          <StreakWidget streak={14} />
        </div>
      </section>

      {/* Program Badges Section */}
      <section className="space-y-4">
        <SectionHeader title="Program Achievement Badges" />
        <Card variant="surface">
          <h3 className="label-md text-[var(--text-muted)] uppercase tracking-wider mb-6">predefined metallic configs</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 justify-items-center">
            {(Object.keys(BADGE_CONFIGS) as Array<keyof typeof BADGE_CONFIGS>).map((key) => (
              <ProgramBadge key={key} badgeId={key} earned={true} />
            ))}
          </div>

          <h3 className="label-md text-[var(--text-muted)] uppercase tracking-wider mt-10 mb-6">Locked badges state</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 justify-items-center">
            {(Object.keys(BADGE_CONFIGS) as Array<keyof typeof BADGE_CONFIGS>).map((key) => (
              <ProgramBadge key={key} badgeId={key} earned={false} />
            ))}
          </div>
        </Card>
      </section>

      {/* Miscellaneous Components */}
      <section className="space-y-4">
        <SectionHeader title="Misc & Utility Components" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skeleton Loaders */}
          <Card variant="surface" className="space-y-4">
            <h4 className="label-md text-[var(--text-muted)] uppercase">Skeleton Shimmers</h4>
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </Card>

          {/* Empty States */}
          <EmptyState
            title="No Workouts Logged"
            message="You haven't recorded any training logs for Phase 1 yet. Start your first session today!"
            icon={Barbell}
            actionText="Log Workout"
            onAction={() => triggerToast("Navigating to Workout logs...")}
          />
        </div>

        {/* Modal / Dialog Triggers */}
        <Card variant="surface" className="space-y-4">
          <h4 className="label-md text-[var(--text-muted)] uppercase">Alerts, Modals & Sheets</h4>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" onClick={() => triggerToast("Success Toast Alert!", "success")}>
              Show Success Toast
            </Button>
            <Button variant="danger" onClick={() => triggerToast("Error Toast Alert!", "error")}>
              Show Error Toast
            </Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              Open Dialog Modal
            </Button>
            <Button variant="secondary" onClick={() => setIsSheetOpen(true)}>
              Open Reusable Bottom Sheet
            </Button>
          </div>
        </Card>
      </section>

      {/* Modal Element */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Verify Progress">
        <p className="body-md mb-4 text-[var(--text-secondary)]">
          Are you sure you want to verify Saba's workout for Day 43? This will commit the workout log to Supabase.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => { setIsModalOpen(false); triggerToast("Log Verified!"); }}>
            Confirm
          </Button>
        </div>
      </Modal>

      {/* Bottom Sheet Element */}
      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="More Actions">
        <div className="space-y-4">
          <button
            onClick={() => { setIsSheetOpen(false); triggerToast("Shared successfully!"); }}
            className="flex items-center gap-3 w-full py-3 px-4 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors text-left"
          >
            <Flame size={20} className="text-[var(--accent-text)]" />
            <span className="font-body font-bold text-sm text-[var(--text-primary)]">Share Streak Progress</span>
          </button>
          <button
            onClick={() => { setIsSheetOpen(false); triggerToast("Notification preference saved!"); }}
            className="flex items-center gap-3 w-full py-3 px-4 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors text-left"
          >
            <Bell size={20} className="text-[var(--blue)]" />
            <span className="font-body font-bold text-sm text-[var(--text-primary)]">Mute notifications for 24h</span>
          </button>
        </div>
      </BottomSheet>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
