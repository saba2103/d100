export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  shape: "hex" | "circle" | "shield" | "square";
  color: "bronze" | "silver" | "emerald" | "steel" | "gold" | "purple" | "sapphire" | "crimson";
  icon: "fire" | "seal-check" | "leaf" | "lightning" | "trophy" | "crown" | "drop" | "skull";
  unlock_condition: string;
}

export const BADGES: BadgeDefinition[] = [
  { id: 'first_spark', name: 'First Spark', description: 'Complete Day 1', shape: 'hex', color: 'bronze',
    icon: 'fire', unlock_condition: 'workout_count >= 1' },
  { id: 'week_warrior', name: 'Week Warrior', description: '7 workouts done', shape: 'circle', color: 'silver',
    icon: 'seal-check', unlock_condition: 'workout_count >= 7' },
  { id: 'clean_machine', name: 'Clean Machine', description: '7 days clean eating logged', shape: 'shield', color: 'emerald',
    icon: 'leaf', unlock_condition: 'nutrition_streak >= 7' },
  { id: 'iron_will', name: 'Iron Will', description: '14 day workout streak', shape: 'hex', color: 'steel',
    icon: 'lightning', unlock_condition: 'workout_streak >= 14' },
  { id: 'golden_run', name: 'Golden Run', description: '21 days straight', shape: 'square', color: 'gold',
    icon: 'trophy', unlock_condition: 'workout_streak >= 21' },
  { id: 'phase_champ', name: 'Phase Champ', description: 'Complete Phase 1', shape: 'circle', color: 'purple',
    icon: 'crown', unlock_condition: 'phase_1_complete === true' },
  { id: 'hydration_hero', name: 'Hydration Hero', description: '30 days hitting water goal', shape: 'shield', color: 'sapphire',
    icon: 'drop', unlock_condition: 'water_goal_streak >= 30' },
  { id: 'no_mercy', name: 'No Mercy', description: 'Never missed a workout day', shape: 'hex', color: 'crimson',
    icon: 'skull', unlock_condition: 'workout_days_missed === 0 && program_day >= 30' },
];
