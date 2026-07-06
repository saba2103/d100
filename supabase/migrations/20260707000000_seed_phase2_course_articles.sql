-- =============================================================================
-- Seed Course Articles for Phase 2 Documents (Lessons 2.a to 2.f)
-- Migration: 20260707000000_seed_phase2_course_articles.sql
-- =============================================================================

-- 2.a: Phase 2 Workout Plan — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.a',
  'Phase 2 Workout Plan — Quick Reference',
  'phase-2-workout-reference',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Quick Reference"},
    {"type": "heading", "text": "Phase 2 Workout Plan Overview"},
    {"type": "paragraph", "text": "Welcome to Phase 2 (Days 8-35). We are moving from the Phase 1 full-body routine to a structured Push / Pull / Legs split. The frequency is 6 days per week with 1 rest day (Day 7 of each week). Weight training is followed by 15-20 minutes of LISS cardio."},
    {"type": "metric_card", "label": "Phase 2 Duration", "value": "4 Weeks", "unit": "Days 8-35", "icon": "calendar"},
    {"type": "metric_card", "label": "Weekly Split", "value": "PPL", "unit": "Push/Pull/Legs", "icon": "barbell"},
    {"type": "metric_card", "label": "Post-Workout Cardio", "value": "15-20", "unit": "Minutes LISS", "icon": "clock"},
    {"type": "divider"},
    {"type": "heading", "text": "Weekly Schedule"},
    {"type": "list", "style": "number", "items": [
      "Day 1: PUSH (Chest, Shoulders, Triceps)",
      "Day 2: PULL (Back, Biceps, Rear Delts, Traps)",
      "Day 3: LEGS (Quads, Hamstrings, Glutes, Calves, Lower Back)",
      "Day 4: PUSH (Chest, Shoulders, Triceps)",
      "Day 5: PULL (Back, Biceps, Rear Delts, Traps)",
      "Day 6: LEGS (Quads, Hamstrings, Glutes, Calves, Lower Back)",
      "Day 7: REST / Active Recovery"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Push Day Exercises"},
    {"type": "list", "style": "bullet", "items": [
      "Incline Bench Press — 3 sets × 10 reps (Upper Chest)",
      "Incline Dumbbell Press — 3 sets × 12 reps (Upper Chest)",
      "Flat Dumbbell Fly — 3 sets × 15 reps (Mid/Inner Chest)",
      "Machine Incline Press — 3 sets × 12 reps (Upper Chest)",
      "Dumbbell Shoulder Press — 3 sets × 10 reps (Front/Side Delts)",
      "Side Lateral Raises — 3 sets × 15 reps (Side Delts)",
      "Tricep Pushdown — 3 sets × 12 reps (Triceps)",
      "Skull Crushers — 3 sets × 12 reps (Triceps)"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Pull Day Exercises"},
    {"type": "list", "style": "bullet", "items": [
      "Lat Pulldown — 3 sets × 12 reps (Lats Width)",
      "T-Bar Row — 3 sets × 12 reps (Mid Back Thickness)",
      "Seated Cable Row — 3 sets × 12 reps (Mid Back)",
      "Face Pulls — 3 sets × 12 reps (Rear Delts / Traps)",
      "Dumbbell Shrugs — 3 sets × 15 reps (Upper Traps)",
      "Dumbbell Bicep Curls — 3 sets × 12 reps (Biceps)",
      "Preacher Curls — 3 sets × 12 reps (Biceps Peak)"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Leg Day Exercises"},
    {"type": "list", "style": "bullet", "items": [
      "Barbell Squats — 4 sets × 10 reps (Quads / Glutes)",
      "Leg Extension — 3 sets × 15 reps (Quads Isolation)",
      "Leg Press — 3 sets × 12 reps (Quads / Glutes)",
      "Leg Curls — 3 sets × 12 reps (Hamstrings)",
      "Walking Lunges — 3 sets × 20 steps (Quads / Glutes)",
      "Calf Raises — 3 sets × 15 reps (Calves)",
      "Back Extension — 3 sets × 15 reps (Lower Back / Glutes)"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Progressive Overload & Cardio Rules"},
    {"type": "paragraph", "text": "Every week, focus on progressing in one of four ways: adding reps, adding weight, slowing the tempo (more time under tension), or improving form. Do your LISS cardio AFTER weight training to burn fat efficiently."},
    {"type": "callout", "style": "warning", "title": "Avoid Ego Lifting", "text": "Use weights you can control. Avoid training through sharp pain, time your rest intervals (90s for compound, 60s for isolation), and track every weight you lift."},
    {"type": "quote", "text": "Show up. Train hard. Do your cardio. Track everything."}
  ]'::jsonb,
  5,
  ARRAY['workout', 'training', 'phase-2'],
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
  phase = EXCLUDED.phase,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_read_minutes = EXCLUDED.estimated_read_minutes,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published;


-- 2.b: Phase 2 Abs Workout Guide — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.b',
  'Phase 2 Abs Workout Guide — Quick Reference',
  'phase-2-abs-reference',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Abs Guide"},
    {"type": "heading", "text": "Phase 2 Ab Training Guide"},
    {"type": "paragraph", "text": "Core training in Phase 2 requires 2 exercises per session, performed 6 days a week after your main workout and before your cardio. The workouts take 5-8 minutes with 30s rest between exercises."},
    {"type": "metric_card", "label": "Frequency", "value": "6", "unit": "Days Per Week", "icon": "calendar"},
    {"type": "metric_card", "label": "Daily Duration", "value": "5-8", "unit": "Minutes", "icon": "clock"},
    {"type": "divider"},
    {"type": "heading", "text": "Weekly Ab Schedule"},
    {"type": "list", "style": "bullet", "items": [
      "Day 1 (Upper Abs): Crunches (3 × 20) + Toe Touches (3 × 15)",
      "Day 2 (Lower Abs): Reverse Crunches (3 × 15) + Leg Raises (3 × 12)",
      "Day 3 (Obliques): Bicycle Crunches (3 × 20 each side) + Side Plank (3 × 30 sec each)",
      "Day 4 (Core Stability): Plank (3 × 45-60 sec) + Dead Bug (3 × 12 each side)",
      "Day 5 (Upper + Lower): V-Ups (3 × 12) + Mountain Climbers (3 × 30 sec)",
      "Day 6 (Total Core): Crunches (3 × 20) + Plank (3 × 45-60 sec)",
      "Day 7: REST"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Core Training Rules"},
    {"type": "list", "style": "number", "items": [
      "Perform ab training AFTER your weight lifting but BEFORE your cardio.",
      "Quality over quantity — slow, controlled reps beat fast, sloppy movements.",
      "Exhale during the contraction (the crunch or squeeze).",
      "Abs are built in the gym but revealed in the kitchen. Keep your diet clean."
    ]}
  ]'::jsonb,
  5,
  ARRAY['workout', 'abs', 'phase-2'],
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
  phase = EXCLUDED.phase,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_read_minutes = EXCLUDED.estimated_read_minutes,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published;


-- 2.c: Phase 2 Calorie & Macro Calculator — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.c',
  'Phase 2 Calorie & Macro Calculator — Quick Reference',
  'phase-2-calculator-reference',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Calorie Math"},
    {"type": "heading", "text": "How to Calculate Your Calorie & Macro Targets"},
    {"type": "paragraph", "text": "Follow these simple steps once to find your specific daily targets for Phase 2 (Fat Burning Mode)."},
    {"type": "divider"},
    {"type": "heading", "text": "Step 1: Find Maintenance Calories"},
    {"type": "paragraph", "text": "Multiply your current body weight in kg by 29. For example, if you weigh 80kg: 80 × 29 = 2,320 calories."},
    {"type": "heading", "text": "Step 2: Create Your Fat Loss Deficit"},
    {"type": "paragraph", "text": "Subtract 500 calories from your maintenance target. Continuing the 80kg example: 2,320 - 500 = 1,820 calories."},
    {"type": "heading", "text": "Step 3: Set Your Macro Targets"},
    {"type": "list", "style": "bullet", "items": [
      "Protein: Body weight (kg) × 2 grams (1g protein = 4 kcal)",
      "Fat: Body weight (kg) × 0.9 grams (1g fat = 9 kcal)",
      "Carbohydrates: Remaining calories divided by 4 (1g carb = 4 kcal)"
    ]},
    {"type": "callout", "style": "tip", "title": "Example (80kg Man)", "text": "Calories: 1,820 kcal | Protein: 160g | Fat: 72g | Carbs: 133g"},
    {"type": "divider"},
    {"type": "heading", "text": "Weight Adjustments for Meal Plans"},
    {"type": "paragraph", "text": "If your personal target is lower than 1,820 kcal, reduce carbohydrate portions. If higher, increase them. Never reduce your protein target."}
  ]'::jsonb,
  5,
  ARRAY['nutrition', 'calculator', 'phase-2'],
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
  phase = EXCLUDED.phase,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_read_minutes = EXCLUDED.estimated_read_minutes,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published;


-- 2.d: Phase 2 Veg Diet Plan — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.d',
  'Phase 2 Veg Diet Plan — Quick Reference',
  'phase-2-veg-diet-reference',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Veg Diet"},
    {"type": "heading", "text": "Vegetarian Meal Plan — Sample Days"},
    {"type": "paragraph", "text": "Sample eating structure for an 80kg man targeting ~1,820 calories and 160g protein, using Intermittent Fasting (16:8 window)."},
    {"type": "divider"},
    {"type": "heading", "text": "Option A (Day 1)"},
    {"type": "list", "style": "bullet", "items": [
      "Meal 1 (12:00 PM): 200g Paneer Bhurji + 1 big bowl Chole/Rajma + 2 Whole Wheat Rotis + Salad",
      "Snack (3:00 PM): Double Whey Protein Shake (2 scoops in water) + 30g Roasted Peanuts",
      "Meal 2 (7:00 PM): 150g Tofu / 50g dry Soy chunks curry + 1 bowl Moong Dal + 1 cup cooked Rice + 1 bowl Sabzi"
    ]},
    {"type": "heading", "text": "Option B (Day 2)"},
    {"type": "list", "style": "bullet", "items": [
      "Meal 1 (12:00 PM): 50g dry Soy chunks dry sabzi + 2 Paneer Parathas (150g paneer) + 200g Curd/Raita",
      "Snack (3:00 PM): Double Whey Protein Shake (2 scoops in water) + 200ml Soy Milk + 1 tbsp Peanut Butter",
      "Meal 2 (7:00 PM): 200g Tofu Tikka + 1 bowl Dal Makhani + 1 cup cooked Rice + 1 glass Buttermilk/Chaas"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Vegetarian Protein Arsenal (Per 100g/serving)"},
    {"type": "list", "style": "bullet", "items": [
      "Paneer (100g): 18g protein",
      "Soy Chunks (dry, 50g): 25g protein",
      "Tofu (100g): 10g protein",
      "Greek Yogurt (150g): 10-12g protein",
      "Whey Protein (1 scoop): 25g protein"
    ]}
  ]'::jsonb,
  5,
  ARRAY['nutrition', 'diet', 'veg', 'phase-2'],
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
  phase = EXCLUDED.phase,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_read_minutes = EXCLUDED.estimated_read_minutes,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published;


-- 2.e: Phase 2 Eggetarian Diet Plan — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.e',
  'Phase 2 Eggetarian Diet Plan — Quick Reference',
  'phase-2-eggetarian-diet-reference',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Eggetarian Diet"},
    {"type": "heading", "text": "Egg-etarian Meal Plan — Sample Days"},
    {"type": "paragraph", "text": "Sample structure targeting 160g protein and ~1,820 calories, utilizing whole eggs, whites, paneer, and whey."},
    {"type": "divider"},
    {"type": "heading", "text": "Option A (Day 1)"},
    {"type": "list", "style": "bullet", "items": [
      "Meal 1 (12:00 PM): Omelette (4 whole eggs + 2 whites) + 150g Paneer Bhurji + 2 Whole Wheat Rotis + Salad",
      "Snack (3:00 PM): 1 scoop Whey Protein Shake + 2 Boiled Eggs + 150g Curd/Yogurt",
      "Meal 2 (7:00 PM): Egg Curry (4 eggs) + 100g Paneer (in dal/sabzi) + 1 small cup cooked Rice"
    ]},
    {"type": "heading", "text": "Option B (Day 2)"},
    {"type": "list", "style": "bullet", "items": [
      "Meal 1 (12:00 PM): Egg Bhurji (5 whole eggs) + 2 Whole Wheat Rotis + 200g Curd/Raita",
      "Snack (3:00 PM): Double Whey Protein Shake (2 scoops in water) + 10 pieces Almonds",
      "Meal 2 (7:00 PM): 200g Paneer Tikka + Egg Fried Rice (1 cup rice + 3 eggs) + Salad"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Egg-etarian Protein Boosting Tips"},
    {"type": "list", "style": "bullet", "items": [
      "Egg whites are your best friend — add 2-3 extra whites for +10g protein with minimal calories.",
      "Paneer and eggs are your primary tools. Cottage cheese (chenna) and tofu can be swapped freely."
    ]}
  ]'::jsonb,
  5,
  ARRAY['nutrition', 'diet', 'egg', 'phase-2'],
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
  phase = EXCLUDED.phase,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_read_minutes = EXCLUDED.estimated_read_minutes,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published;


-- 2.f: Phase 2 Non-Veg Diet Plan — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.f',
  'Phase 2 Non-Veg Diet Plan — Quick Reference',
  'phase-2-nonveg-diet-reference',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Non-Veg Diet"},
    {"type": "heading", "text": "Non-Veg Meal Plan — Sample Days"},
    {"type": "paragraph", "text": "Sample structure for meat-eaters, focusing on boneless chicken, fish, eggs, and whey protein."},
    {"type": "divider"},
    {"type": "heading", "text": "Option A (Day 1)"},
    {"type": "list", "style": "bullet", "items": [
      "Meal 1 (12:00 PM): 200g Chicken Curry + 2 Whole Wheat Rotis + 2 Whole Eggs + Salad",
      "Snack (3:00 PM): 1 scoop Whey Protein Shake + 1 Boiled Egg + 10 pieces Almonds",
      "Meal 2 (7:00 PM): 200g Grilled Chicken Breast + 1 small cup cooked Rice + 1 bowl Dal + 1 bowl Sabzi"
    ]},
    {"type": "heading", "text": "Option B (Day 2)"},
    {"type": "list", "style": "bullet", "items": [
      "Meal 1 (12:00 PM): 250g Fish Curry + 1 small cup cooked Rice + Egg Bhurji (3 eggs) + Salad",
      "Snack (3:00 PM): 1 scoop Whey Protein Shake + 1 tbsp Peanut Butter + 150g Greek Yogurt/Hung Curd",
      "Meal 2 (7:00 PM): 200g Tandoori Chicken + 1 Whole Wheat Roti + 1 bowl Mixed Dal + 1 bowl Palak/Green Sabzi"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Golden Rules"},
    {"type": "list", "style": "bullet", "items": [
      "Always hit your protein target first, then adjust carbs/fats.",
      "Cook with minimal oil (1-2 tsp per meal max). No sugar, junk food, or alcohol."
    ]}
  ]'::jsonb,
  5,
  ARRAY['nutrition', 'diet', 'nonveg', 'phase-2'],
  TRUE
)
ON CONFLICT (slug) DO UPDATE
SET
  phase = EXCLUDED.phase,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  estimated_read_minutes = EXCLUDED.estimated_read_minutes,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published;
