export type BlockType =
  | "heading"
  | "subheading"
  | "paragraph"
  | "callout"
  | "list"
  | "metric_card"
  | "divider"
  | "quote"
  | "image"
  | "video"
  | "phase_tag";

export interface ContentBlock {
  type: BlockType;
  text?: string;
  level?: number;
  style?: "bullet" | "number" | "tip" | "warning" | "coach";
  title?: string;
  items?: string[];
  label?: string;
  value?: string;
  unit?: string;
  icon?: string;
  url?: string;
  caption?: string;
}

export interface CourseLesson {
  lesson_number: string;
  title: string;
  slug: string;
  estimated_read_minutes: number;
  published: boolean;
}

export interface CoursePhase {
  id: number;
  name: string;
  locked: boolean;
  isDrip?: boolean;
  lessons: CourseLesson[];
}

export const COURSE_PHASES: CoursePhase[] = [
  {
    id: 0,
    name: "Introduction",
    locked: false,
    lessons: [],
  },
  {
    id: 1,
    name: "Phase 1 | Foundation Week | Day (1-7)",
    locked: false,
    lessons: [
      {
        lesson_number: "1.1",
        title: "Goal & Duration Of This Phase",
        slug: "goal-duration",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "1.2",
        title: "Nutrition Plan For This Phase",
        slug: "nutrition-plan",
        estimated_read_minutes: 8,
        published: true,
      },
      {
        lesson_number: "1.3",
        title: "Workout Plan For This Phase",
        slug: "workout-plan",
        estimated_read_minutes: 10,
        published: true,
      },
      {
        lesson_number: "1.4",
        title: "Exercise Demonstration",
        slug: "exercise-demo",
        estimated_read_minutes: 6,
        published: true,
      },
      {
        lesson_number: "1.5",
        title: "Supplements For This Phase",
        slug: "supplements-phase",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "1.6",
        title: "Mistakes To Avoid",
        slug: "mistakes-avoid",
        estimated_read_minutes: 7,
        published: true,
      },
      {
        lesson_number: "1.7",
        title: "Checklist & Action Plan",
        slug: "checklist-action",
        estimated_read_minutes: 6,
        published: true,
      },
      {
        lesson_number: "1.a",
        title: "Warm-Up & Cool-Down Guide",
        slug: "phase-1-warmup-cooldown",
        estimated_read_minutes: 6,
        published: true,
      },
      {
        lesson_number: "1.b",
        title: "Phase 1 Workout Plan — Quick Reference",
        slug: "phase-1-workout-reference",
        estimated_read_minutes: 3,
        published: true,
      },
      {
        lesson_number: "1.c",
        title: "Phase 1 Supplements — Quick Reference",
        slug: "phase-1-supplements-reference",
        estimated_read_minutes: 3,
        published: true,
      },
      {
        lesson_number: "1.d",
        title: "Mistakes to Avoid — Quick Reference",
        slug: "phase-1-mistakes-reference",
        estimated_read_minutes: 3,
        published: true,
      },
    ],
  },
  {
    id: 2,
    name: "Phase 2 | BUILDING THE BASE | Day (8-35)",
    locked: false,
    lessons: [
      {
        lesson_number: "2.1",
        title: "Goal & Duration Of This Phase",
        slug: "phase-2-goal-duration",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.2",
        title: "Nutrition Plan For This Phase",
        slug: "phase-2-nutrition-plan",
        estimated_read_minutes: 8,
        published: true,
      },
      {
        lesson_number: "2.3",
        title: "Calorie & Macro Calculation",
        slug: "phase-2-calorie-macro",
        estimated_read_minutes: 6,
        published: true,
      },
      {
        lesson_number: "2.4",
        title: "Workout Plan For This Phase",
        slug: "phase-2-workout-plan",
        estimated_read_minutes: 7,
        published: true,
      },
      {
        lesson_number: "2.5",
        title: "Introduction To Workout Split",
        slug: "phase-2-workout-split",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.6",
        title: "Pull Day Demonstration",
        slug: "phase-2-pull-day",
        estimated_read_minutes: 10,
        published: true,
      },
      {
        lesson_number: "2.7",
        title: "Push Day Demonstration",
        slug: "phase-2-push-day",
        estimated_read_minutes: 10,
        published: true,
      },
      {
        lesson_number: "2.8",
        title: "Leg Day Demonstration",
        slug: "phase-2-leg-day",
        estimated_read_minutes: 10,
        published: true,
      },
      {
        lesson_number: "2.9",
        title: "Summary of the Workout Split",
        slug: "phase-2-workout-summary",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.10",
        title: "Supplements For This Phase",
        slug: "phase-2-supplements",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.11",
        title: "Mistakes To Avoid",
        slug: "phase-2-mistakes",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.12",
        title: "Action Plan",
        slug: "phase-2-action-plan",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.a",
        title: "Phase 2 Workout Plan — Quick Reference",
        slug: "phase-2-workout-reference",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.b",
        title: "Phase 2 Abs Workout Guide — Quick Reference",
        slug: "phase-2-abs-reference",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.c",
        title: "Phase 2 Calorie & Macro Calculator — Quick Reference",
        slug: "phase-2-calculator-reference",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.d",
        title: "Phase 2 Veg Diet Plan — Quick Reference",
        slug: "phase-2-veg-diet-reference",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.e",
        title: "Phase 2 Eggetarian Diet Plan — Quick Reference",
        slug: "phase-2-eggetarian-diet-reference",
        estimated_read_minutes: 5,
        published: true,
      },
      {
        lesson_number: "2.f",
        title: "Phase 2 Non-Veg Diet Plan — Quick Reference",
        slug: "phase-2-nonveg-diet-reference",
        estimated_read_minutes: 5,
        published: true,
      },
    ],
  },
  {
    id: 3,
    name: "Phase 3 | MUSCLE BUILDING MODE | Day (36-63)",
    locked: true,
    lessons: [],
  },
  {
    id: 4,
    name: "Phase 4 | SHREDDING PHASE | Day (64-91)",
    locked: true,
    lessons: [],
  },
  {
    id: 5,
    name: "Phase 5 | PEAK WEEK | Day (92-100)",
    locked: true,
    lessons: [],
  },
];
