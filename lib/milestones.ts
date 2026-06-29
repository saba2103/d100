export interface Phase {
  number: number;
  label: string;
  days: [number, number];
  theme: string;
  color: string;
}

export const PHASES: Phase[] = [
  { number: 1, label: "Phase 1", days: [1, 7],   theme: "Foundation Week",     color: "var(--accent-start)" },
  { number: 2, label: "Phase 2", days: [8, 35],  theme: "Building the Base",   color: "#A855F7" },
  { number: 3, label: "Phase 3", days: [36, 63], theme: "Muscle Building Mode", color: "#3B82F6" },
  { number: 4, label: "Phase 4", days: [64, 91], theme: "Shredding Phase",     color: "#EF4444" },
  { number: 5, label: "Phase 5", days: [92, 100], theme: "Peak Week",           color: "#10B981" },
];

export interface Milestone {
  id: string;
  label: string;
  day: number;
  icon: string;
  badge_id: string | null;
}

export const MILESTONES: Milestone[] = [
  { id: "first_spark",  label: "First Spark",   day: 1,   icon: "fire",       badge_id: "first_spark"  },
  { id: "week_one",     label: "Week Warrior",   day: 7,   icon: "seal-check", badge_id: "week_warrior" },
  { id: "iron_will",    label: "Iron Will",      day: 14,  icon: "lightning",  badge_id: "iron_will"    },
  { id: "phase_1_done", label: "Phase Champ",    day: 35,  icon: "crown",      badge_id: "phase_champ"  },
  { id: "golden_run",   label: "Golden Run",     day: 21,  icon: "trophy",     badge_id: "golden_run"   },
  { id: "halfway",      label: "Halfway There",  day: 50,  icon: "flag",       badge_id: null           },
  { id: "final_week",   label: "Final Week",     day: 92,  icon: "rocket",     badge_id: null           },
  { id: "century",      label: "Day 100",        day: 100, icon: "star",       badge_id: null           },
];

export const MOTIVATIONAL_QUOTES = [
  "Every rep counts. Every meal matters. Every day builds.",
  "Form over ego. Always.",
  "The person you're becoming is worth every early morning.",
  "Discipline is freedom. You chose this.",
  "Consistency beats perfection. Show up.",
  "Day {day} is one day closer to the person you promised yourself.",
  "Progress is quiet. Keep going anyway.",
];
