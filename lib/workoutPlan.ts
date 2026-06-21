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
