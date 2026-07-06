/**
 * Shared configuration for workouts and supplements plan.
 * Modify these arrays to update the coach plans across the application.
 */

export interface ExercisePlanItem {
  name: string;
  sets: number;
  reps: string;
  repsRange: string;
  target: string;
  weight?: string;
}

export interface SupplementPlanItem {
  name: string;
  dose: string;
  timing: string;
  note: string;
  why: string;       // Backwards compatibility with SupplementsClient.tsx
  bestTime: string;  // Backwards compatibility with SupplementsClient.tsx
}

export const COACH_WORKOUT_PLAN: ExercisePlanItem[] = [
  { name: 'Incline Dumbbell Press', sets: 3, reps: '12', repsRange: '12–15', target: 'Upper Chest' },
  { name: 'Pec Deck Fly',           sets: 3, reps: '12', repsRange: '12–15', target: 'Chest' },
  { name: 'Lat Pulldown',           sets: 3, reps: '12', repsRange: '12–15', target: 'Back' },
  { name: 'Face Pulls',             sets: 3, reps: '15', repsRange: '15–20', target: 'Rear Delts / Upper Back' },
  { name: 'Leg Extension',          sets: 3, reps: '12', repsRange: '12–15', target: 'Quads' },
  { name: 'Leg Curl',               sets: 3, reps: '12', repsRange: '12–15', target: 'Hamstrings' },
  { name: 'Calf Raises',            sets: 3, reps: '15', repsRange: '15–20', target: 'Calves' },
  { name: 'Lateral Delt Raises',    sets: 3, reps: '12', repsRange: '12–15', target: 'Shoulders' },
  { name: 'Plank',                  sets: 3, reps: '30', repsRange: '30–60 sec', target: 'Core' },
  { name: 'Cardio',                 sets: 1, reps: '10', repsRange: '10–15 min', target: 'Conditioning' },
];

export const PHASE2_PUSH_PLAN: ExercisePlanItem[] = [
  { name: 'Incline Bench Press', sets: 3, reps: '10', repsRange: '10', target: 'Upper Chest' },
  { name: 'Incline Dumbbell Press', sets: 3, reps: '12', repsRange: '12', target: 'Upper Chest' },
  { name: 'Flat Dumbbell Fly', sets: 3, reps: '15', repsRange: '15', target: 'Mid/Inner Chest' },
  { name: 'Machine Incline Press', sets: 3, reps: '12', repsRange: '12', target: 'Upper Chest' },
  { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', repsRange: '10', target: 'Front/Side Delts' },
  { name: 'Side Lateral Raises', sets: 3, reps: '15', repsRange: '15', target: 'Side Delts' },
  { name: 'Tricep Pushdown', sets: 3, reps: '12', repsRange: '12', target: 'Triceps' },
  { name: 'Skull Crushers', sets: 3, reps: '12', repsRange: '12', target: 'Triceps' },
];

export const PHASE2_PULL_PLAN: ExercisePlanItem[] = [
  { name: 'Lat Pulldown', sets: 3, reps: '12', repsRange: '12', target: 'Lats (Width)' },
  { name: 'T-Bar Row', sets: 3, reps: '12', repsRange: '12', target: 'Mid Back (Thickness)' },
  { name: 'Seated Cable Row', sets: 3, reps: '12', repsRange: '12', target: 'Mid Back' },
  { name: 'Face Pulls', sets: 3, reps: '12', repsRange: '12', target: 'Rear Delts / Traps' },
  { name: 'Dumbbell Shrugs', sets: 3, reps: '15', repsRange: '15', target: 'Upper Traps' },
  { name: 'Dumbbell Bicep Curls', sets: 3, reps: '12', repsRange: '12', target: 'Biceps' },
  { name: 'Preacher Curls', sets: 3, reps: '12', repsRange: '12', target: 'Biceps (Peak)' },
];

export const PHASE2_LEGS_PLAN: ExercisePlanItem[] = [
  { name: 'Barbell Squats', sets: 4, reps: '10', repsRange: '10', target: 'Quads / Glutes' },
  { name: 'Leg Extension', sets: 3, reps: '15', repsRange: '15', target: 'Quads (Isolation)' },
  { name: 'Leg Press', sets: 3, reps: '12', repsRange: '12', target: 'Quads / Glutes' },
  { name: 'Leg Curls', sets: 3, reps: '12', repsRange: '12', target: 'Hamstrings' },
  { name: 'Walking Lunges', sets: 3, reps: '20 steps', repsRange: '20 steps', target: 'Quads / Glutes' },
  { name: 'Calf Raises', sets: 3, reps: '15', repsRange: '15', target: 'Calves' },
  { name: 'Back Extension', sets: 3, reps: '15', repsRange: '15', target: 'Lower Back / Glutes' },
];

export function getWorkoutPlanForDay(day: number): { name: string; exercises: ExercisePlanItem[] } | null {
  if (day >= 1 && day <= 6) {
    return { name: "PHASE 1 — FULL BODY", exercises: COACH_WORKOUT_PLAN };
  } else if (day === 7) {
    return null; // Rest Day
  } else if (day >= 8 && day <= 35) {
    const dayIndexWithinWeek = (day - 8) % 7 + 1;
    if (dayIndexWithinWeek === 1 || dayIndexWithinWeek === 4) {
      return { name: "PHASE 2 — PUSH DAY", exercises: PHASE2_PUSH_PLAN };
    } else if (dayIndexWithinWeek === 2 || dayIndexWithinWeek === 5) {
      return { name: "PHASE 2 — PULL DAY", exercises: PHASE2_PULL_PLAN };
    } else if (dayIndexWithinWeek === 3 || dayIndexWithinWeek === 6) {
      return { name: "PHASE 2 — LEG DAY", exercises: PHASE2_LEGS_PLAN };
    } else {
      return null; // Rest Day
    }
  }
  return null;
}

export const COACH_SUPPLEMENT_PLAN: SupplementPlanItem[] = [
  {
    name: 'Whey Protein',
    dose: '1 scoop (25–30g)',
    timing: 'Post-workout',
    note: 'Only if you struggle to get enough protein from food. Not mandatory.',
    why: 'Only if you struggle to get enough protein from food. Not mandatory.',
    bestTime: 'Post-workout',
  },
  {
    name: 'Creatine Monohydrate',
    dose: '5g',
    timing: 'Post-workout — mix with protein shake',
    note: 'Most researched supplement. Safe, effective, helps strength and recovery.',
    why: 'Most researched supplement. Safe, effective, helps strength and recovery.',
    bestTime: 'Post-workout — mix with protein shake',
  },
  {
    name: 'Multivitamin',
    dose: '1 serving',
    timing: 'With breakfast',
    note: 'Covers basic deficiencies. Think of it as insurance.',
    why: 'Covers basic deficiencies. Think of it as insurance.',
    bestTime: 'With breakfast',
  },
  {
    name: 'Fish Oil (Omega-3)',
    dose: '1 serving (1000mg)',
    timing: 'With breakfast',
    note: 'Omega-3s for heart health, joints, and inflammation.',
    why: 'Omega-3s for heart health, joints, and inflammation.',
    bestTime: 'With breakfast',
  },
  {
    name: 'Vitamin D3 + K2',
    dose: '5000 IU D3',
    timing: 'With a meal (lunch or dinner)',
    note: 'Most people are deficient. Essential for bones and immunity.',
    why: 'Most people are deficient. Essential for bones and immunity.',
    bestTime: 'With a meal (lunch or dinner)',
  },
];

export interface WarmUpStep {
  num: string;
  text: string;
  detail: string;
}

export interface CoolDownStep {
  num: string;
  text: string;
  detail: string;
}

export const PUSH_WARMUP: WarmUpStep[] = [
  { num: "01", text: "3 min light cardio", detail: "Treadmill / Cross Trainer" },
  { num: "02", text: "Arm circles", detail: "15 each direction" },
  { num: "03", text: "Band pull-aparts", detail: "15 reps" },
  { num: "04", text: "Push-ups", detail: "10–15 reps (slow & controlled)" },
  { num: "05", text: "Light lateral raises", detail: "15 reps" },
  { num: "06", text: "First exercise warm-up set", detail: "1 set at 50% working weight" },
];

export const PUSH_COOLDOWN: CoolDownStep[] = [
  { num: "01", text: "Chest stretch (doorway)", detail: "30 sec each side" },
  { num: "02", text: "Overhead tricep stretch", detail: "30 sec each arm" },
  { num: "03", text: "Cross-body shoulder stretch", detail: "30 sec each arm" },
  { num: "04", text: "Chest opener", detail: "30 seconds" },
  { num: "05", text: "Neck rolls", detail: "30 seconds" },
];

export const PULL_WARMUP: WarmUpStep[] = [
  { num: "01", text: "3 min light cardio", detail: "Rowing / Cross Trainer" },
  { num: "02", text: "Arm circles", detail: "15 each direction" },
  { num: "03", text: "Cat-Cow stretch", detail: "10 reps (slow)" },
  { num: "04", text: "Band pull-aparts", detail: "15 reps" },
  { num: "05", text: "Straight arm pulldown", detail: "15 reps (very light)" },
  { num: "06", text: "First exercise warm-up set", detail: "1 set at 50% working weight" },
];

export const PULL_COOLDOWN: CoolDownStep[] = [
  { num: "01", text: "Lat stretch", detail: "30 sec each side (grab pole & lean)" },
  { num: "02", text: "Child's pose", detail: "45 seconds" },
  { num: "03", text: "Bicep wall stretch", detail: "30 sec each arm" },
  { num: "04", text: "Trap stretch", detail: "30 sec each side" },
  { num: "05", text: "Thread the needle", detail: "30 sec each side" },
];

export const LEGS_WARMUP: WarmUpStep[] = [
  { num: "01", text: "3–5 min light cardio", detail: "Treadmill incline walk / cycling" },
  { num: "02", text: "Hip circles", detail: "10 each direction each leg" },
  { num: "03", text: "Leg swings", detail: "10 each direction each leg" },
  { num: "04", text: "Glute bridges", detail: "15 reps (bodyweight)" },
  { num: "05", text: "Bodyweight squats", detail: "15 reps (slow)" },
  { num: "06", text: "Walking lunges", detail: "10 steps each leg" },
  { num: "07", text: "Squat warm-up sets", detail: "2 sets: 15 reps (bar only), 10 reps (50% weight)" },
];

export const LEGS_COOLDOWN: CoolDownStep[] = [
  { num: "01", text: "Standing quad stretch", detail: "30 sec each leg" },
  { num: "02", text: "Standing hamstring stretch", detail: "30 sec each leg" },
  { num: "03", text: "Pigeon pose", detail: "45 sec each leg" },
  { num: "04", text: "Hip flexor stretch", detail: "30 sec each leg" },
  { num: "05", text: "Seated butterfly stretch", detail: "45 seconds" },
  { num: "06", text: "Calf stretch", detail: "30 sec each leg" },
];

export function getWarmUpAndCoolDown(planName: string): { warmup: WarmUpStep[]; cooldown: CoolDownStep[] } {
  const nameUpper = planName.toUpperCase();
  if (nameUpper.includes("PULL")) {
    return { warmup: PULL_WARMUP, cooldown: PULL_COOLDOWN };
  } else if (nameUpper.includes("LEG")) {
    return { warmup: LEGS_WARMUP, cooldown: LEGS_COOLDOWN };
  }
  return { warmup: PUSH_WARMUP, cooldown: PUSH_COOLDOWN };
}
