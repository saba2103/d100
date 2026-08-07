-- =============================================================================
-- Seed Course Articles for Phase 3 Documents (Lessons 3.a to 3.c)
-- Migration: 20260807000000_seed_phase3_course_articles.sql
-- =============================================================================

-- 3.a: Phase 3 Workout Plan — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.a',
  'Phase 3 Workout Plan — Quick Reference',
  'phase-3-workout-reference',
  '[
    {"type": "phase_tag", "text": "Phase 3 — Quick Reference"},
    {"type": "heading", "text": "Phase 3 Workout splits & splits"},
    {"type": "paragraph", "text": "Welcome to Phase 3 (Days 36-63). We are transitioning into a high-intensity bodybuilding routine to build clean lean muscle. We use advanced lifting techniques like Supersets [SS], Drop Sets [DS], and Giant Sets [GS] to increase volume and intensity. The training schedule consists of 5 weight training sessions and 2 active recovery/rest days per week."},
    {"type": "metric_card", "label": "Phase 3 Duration", "value": "4 Weeks", "unit": "Days 36-63", "icon": "calendar"},
    {"type": "metric_card", "label": "Lifting Days", "value": "5 Days", "unit": "Per Week", "icon": "barbell"},
    {"type": "metric_card", "label": "Rest Days", "value": "2 Days", "unit": "Per Week", "icon": "clock"},
    {"type": "divider"},
    {"type": "heading", "text": "Weekly Schedule"},
    {"type": "list", "style": "number", "items": [
      "Day 1: PUSH (Chest, Shoulders, Triceps) + 15 min LISS",
      "Day 2: PULL (Back, Biceps, Rear Delts) + Sprints",
      "Day 3: LEGS (Quads, Hamstrings, Glutes, Calves) + 15 min LISS",
      "Day 4: REST / Recovery Day",
      "Day 5: CHEST + BACK (Giant Sets) + Sprints",
      "Day 6: ARMS & DELTS (Supersets) + 15 min LISS",
      "Day 7: REST / Recovery Day"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Advanced Techniques Defined"},
    {"type": "callout", "style": "coach", "title": "Superset [SS]", "text": "Perform two exercises back-to-back with zero rest. Take your rest intervals (60-90s) only after completing both exercises."},
    {"type": "callout", "style": "coach", "title": "Drop Set [DS]", "text": "Do a regular set to failure. Immediately drop the weight by 30-40% and continue doing reps to failure again without resting. (Apply only on the last set of selected exercises)."},
    {"type": "callout", "style": "coach", "title": "Giant Set [GS]", "text": "Perform three exercises back-to-back with zero rest in between. Rest 90 seconds after all three are done. Repeat for 3 total rounds."},
    {"type": "divider"},
    {"type": "heading", "text": "Day 1: Push Day Routine"},
    {"type": "list", "style": "bullet", "items": [
      "Incline Barbell Press — 4 sets × 8-10 reps (Upper Chest)",
      "Flat Dumbbell Press — 3 sets × 10-12 reps (Chest)",
      "Cable Fly (Low to High) [SS] — 3 sets × 12-15 reps (Mid/Inner Chest)",
      "Push-Ups [SS] — 3 sets × Failure (Immediately after Cable Fly)",
      "Seated DB Shoulder Press — 3 sets × 10-12 reps (Front/Side Delts)",
      "Lateral Raises [DS] — 3 sets × 15 reps (Side Delts - drop set last set)",
      "Tricep Rope Pushdown [DS] — 3 sets × 12 reps (Triceps - drop set last set)"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Day 2: Pull Day Routine"},
    {"type": "list", "style": "bullet", "items": [
      "Deadlift / Rack Pulls — 4 sets × 6-8 reps (Posterior Chain)",
      "Weighted Pull-Ups / Lat Pulldown — 3 sets × 8-10 reps (Lats Width)",
      "T-Bar Row — 3 sets × 10-12 reps (Mid Back Thickness)",
      "Seated Cable Row [SS] — 3 sets × 12 reps (Mid Back)",
      "Face Pulls [SS] — 3 sets × 15 reps (Rear Delts / Traps)",
      "Barbell Curls — 3 sets × 10-12 reps (Biceps)",
      "Hammer Curls [DS] — 3 sets × 12 reps (Biceps / Brachialis - drop set last set)"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Day 3: Legs Day Routine"},
    {"type": "list", "style": "bullet", "items": [
      "Barbell Squats — 4 sets × 8-10 reps (Quads / Glutes)",
      "Romanian Deadlifts (RDL) — 3 sets × 10-12 reps (Hamstrings)",
      "Leg Press [DS] — 3 sets × 12 reps (Quads / Glutes - drop set last set)",
      "Walking Lunges — 3 sets × 12 each leg (Quads / Glutes)",
      "Leg Extension [SS] — 3 sets × 15 reps (Quads)",
      "Leg Curls [SS] — 3 sets × 15 reps (Hamstrings)",
      "Calf Raises [DS] — 4 sets × 15-20 reps (Calves - drop set last set)",
      "Plank — 3 sets × 60 sec (Core)"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Day 5: Chest & Back Giant Sets"},
    {"type": "paragraph", "text": "Complete GIANT SET A (Incline DB Press, Lat Pulldown, DB Pullover) back-to-back with no rest. Rest 90 seconds after all three. Complete 3 rounds total. Then do GIANT SET B (Pec Deck Fly, Seated Cable Row, Push-Ups) back-to-back. Rest 90 seconds. Complete 3 rounds total."},
    {"type": "divider"},
    {"type": "heading", "text": "Day 6: Arms & Delts Supersets"},
    {"type": "list", "style": "bullet", "items": [
      "Barbell Curl [SS A] — 3 sets × 10-12 reps (Biceps)",
      "Skull Crushers [SS A] — 3 sets × 10-12 reps (Triceps)",
      "Preacher Curls [SS B] — 3 sets × 12 reps (Biceps Peak)",
      "Tricep Rope Pushdown [SS B] — 3 sets × 12 reps (Triceps)",
      "Hammer Curls [SS C] — 3 sets × 12 reps (Biceps - drop set last set)",
      "Overhead Tricep Extension [SS C] — 3 sets × 12 reps (Triceps - drop set last set)",
      "Seated DB Shoulder Press — 3 sets × 10-12 reps (Shoulders)",
      "Lateral Raises [DS] — 3 sets × 15 reps (Side Delts - drop set last set)",
      "Rear Delt Fly / Face Pulls — 3 sets × 15 reps (Rear Delts)"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Progressive Overload Rules"},
    {"type": "paragraph", "text": "If you lift the same weight for the same reps as last week, you did not grow. Add weight or reps every week, track everything in a notebook, and keep your form strictly controlled. Do not skip recovery!"},
    {"type": "quote", "text": "Progressive overload is the absolute key. Get stronger, build muscle, keep the discipline."}
  ]'::jsonb,
  10,
  ARRAY['workout', 'training', 'phase-3'],
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


-- 3.b: Phase 3 Nutrition Plan — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.b',
  'Phase 3 Nutrition Plan — Quick Reference',
  'phase-3-nutrition-reference',
  '[
    {"type": "phase_tag", "text": "Phase 3 — Nutrition Reference"},
    {"type": "heading", "text": "Phase 3 Nutrition: Muscle Building Mode"},
    {"type": "paragraph", "text": "In Phase 3, we transition from an aggressive 500-calorie deficit to a mild 300-calorie deficit. This adds 200 calories back into your daily target. The extra food fuels your high-intensity workouts and promotes muscle building while keeping fat loss active. This is the sweet spot for body recomposition."},
    {"type": "metric_card", "label": "Calorie Deficit", "value": "300 kcal", "unit": "Mild Deficit", "icon": "flame"},
    {"type": "metric_card", "label": "Calorie Increase", "value": "+200 kcal", "unit": "From Phase 2", "icon": "plus"},
    {"type": "metric_card", "label": "Hydration Target", "value": "4L", "unit": "Water Daily", "icon": "drop"},
    {"type": "divider"},
    {"type": "heading", "text": "Formula for Calorie Target"},
    {"type": "list", "style": "number", "items": [
      "Calculate Maintenance Calories: Bodyweight (kg) x 29",
      "Subtract Deficit: Maintenance Calories - 300 kcal",
      "Custom Calorie Target = (Weight x 29) - 300 kcal"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Macro Distribution Rules"},
    {"type": "list", "style": "bullet", "items": [
      "Protein: Remains at 2g per kg of bodyweight (non-negotiable).",
      "Fat: Remains at 0.9g per kg of bodyweight.",
      "Carbohydrates: The extra 200 calories comes entirely from clean CARBS. Do not increase fat or protein targets."
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Practical Ways to Add 200 Calories in Carbs"},
    {"type": "paragraph", "text": "Simply add any of these options to your pre-workout or post-workout meals:"},
    {"type": "list", "style": "bullet", "items": [
      "1 extra whole wheat roti (~100 cal)",
      "1/2 cup extra cooked rice (~100 cal)",
      "1 medium banana (~100 cal)",
      "2 slices of whole wheat bread (~150 cal)",
      "1 bowl of poha or upma (~200 cal)",
      "1 medium sweet potato (~115 cal)"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Rules that remain the same"},
    {"type": "list", "style": "bullet", "items": [
      "16:8 Intermittent Fasting: Continue eating in the 12 PM - 8 PM window.",
      "Clean Indian Foods: Stick to roti, rice, dal, sabzi, chicken, eggs, paneer.",
      "No Junk: Absolutely zero sugar, maida, deep-fried food, or alcohol."
    ]},
    {"type": "quote", "text": "More fuel. More muscle. Same strict discipline."}
  ]'::jsonb,
  8,
  ARRAY['nutrition', 'diet', 'phase-3'],
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


-- 3.c: Phase 3 Warm-Up & Cool-Down Guide — Quick Reference
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.c',
  'Phase 3 Warm-Up & Cool-Down Guide — Quick Reference',
  'phase-3-warmup-cooldown-reference',
  '[
    {"type": "phase_tag", "text": "Phase 3 — Warm-Up & Cool-Down"},
    {"type": "heading", "text": "Warm-Up & Cool-Down Protocols"},
    {"type": "paragraph", "text": "Phase 3 training is highly intense and demands maximum joint mobility and recovery. A proper warm-up increases blood flow and prepares your joints, while the cool-down reduces muscle soreness (DOMS) and lengthens tight fibers. Never jump directly into working sets!"},
    {"type": "metric_card", "label": "Warm-Up Time", "value": "5-10 min", "unit": "Before Lift", "icon": "clock"},
    {"type": "metric_card", "label": "Cool-Down Time", "value": "5 min", "unit": "After Lift", "icon": "clock"},
    {"type": "divider"},
    {"type": "heading", "text": "Push Day Routine"},
    {"type": "paragraph", "text": "Warm-Up (5-7 mins): 3 min light cardio + 15 arm circles + 15 band pull-aparts + 10-15 slow pushups + 15 light DB lateral raises + 1 specific warm-up set at 50% weight."},
    {"type": "paragraph", "text": "Cool-Down (5 mins): 30s chest doorway stretch + 30s overhead tricep stretch + 30s cross-body shoulder stretch + 30s neck rolls."},
    {"type": "divider"},
    {"type": "heading", "text": "Pull Day Routine"},
    {"type": "paragraph", "text": "Warm-Up (5-7 mins): 3 min light cardio + 15 arm circles + 10 slow cat-cow stretches + 15 band pull-aparts + 15 light straight arm pulldowns + 1 specific warm-up set at 50% weight."},
    {"type": "paragraph", "text": "Cool-Down (5 mins): 30s overhead lat stretch + 45s childs pose + 30s bicep wall stretch + 30s trap stretch."},
    {"type": "divider"},
    {"type": "heading", "text": "Leg Day Routine"},
    {"type": "paragraph", "text": "Warm-Up (7-10 mins): 3-5 min treadmill incline walk + 10 standing hip circles + 10 leg swings + 15 glute bridges + 15 bodyweight squats + 10 walking lunges + 2 warm-up sets of squats (bar only, then 50% weight)."},
    {"type": "paragraph", "text": "Cool-Down (5 mins): 30s standing quad stretch + 30s standing hamstring stretch + 45s pigeon pose + 30s hip flexor stretch + 45s butterfly stretch."},
    {"type": "quote", "text": "5 minutes of warm-up can save you 5 months of injury recovery. Don''t skip it."}
  ]'::jsonb,
  6,
  ARRAY['workout', 'warmup', 'cooldown', 'phase-3'],
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
