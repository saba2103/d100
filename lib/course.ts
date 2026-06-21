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
  lessons: CourseLesson[];
}

export const COURSE_PHASES: CoursePhase[] = [
  {
    id: 1,
    name: "Phase 1",
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
    name: "Phase 2",
    locked: true,
    lessons: [],
  },
  {
    id: 3,
    name: "Phase 3",
    locked: true,
    lessons: [],
  },
];
