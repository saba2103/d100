-- =============================================================================
-- Seed Course Articles for Phase 3 Video Lessons (Lessons 3.1 to 3.6)
-- Migration: 20260807000001_seed_phase3_video_articles.sql
-- =============================================================================

-- 3.1: Goal & Duration Of This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.1',
  'Goal & Duration Of This Phase',
  'phase-3-goal-duration',
  '[
    {"type": "phase_tag", "text": "Lesson 3.1 • Introduction"},
    {"type": "heading", "text": "Phase 3: Muscle Building Mode"},
    {"type": "paragraph", "text": "Welcome to Phase 3 of the 100 Day Bollywood Body Program! You have officially crossed the halfway mark (Days 36-63). In this phase, we shift our focus from pure fat loss to muscle hypertrophy and body recomposition. We want to pack on clean muscle mass while continuing to shed any remaining body fat."},
    {"type": "metric_card", "label": "Duration", "value": "4 Weeks", "unit": "Days 36-63", "icon": "calendar"},
    {"type": "metric_card", "label": "Primary Focus", "value": "Muscle Building", "unit": "Hypertrophy", "icon": "barbell"},
    {"type": "metric_card", "label": "Calorie Adjust", "value": "+200 kcal", "unit": "Add to Daily Target", "icon": "plus"},
    {"type": "divider"},
    {"type": "heading", "text": "Why We Add Calories"},
    {"type": "paragraph", "text": "As your workouts grow more intense with supersets, drop sets, and giant sets, your body needs extra energy to sustain performance and recover. We are increasing your calorie target by 200 calories per day (shifting from a 500-calorie deficit to a 300-calorie deficit). This is not a bulking phase — you are still in a deficit, just a smaller one. This mild deficit maximizes muscle repair while maintaining a lean state."},
    {"type": "callout", "style": "coach", "title": "Coach Akash Says", "text": "Do not fear the extra food. It is structured fuel designed specifically to make you look full, round, and athletic. Trust the process."},
    {"type": "quote", "text": "You are no longer trying to survive the program — you are now building the physique."}
  ]'::jsonb,
  5,
  ARRAY['goal', 'introduction', 'phase-3'],
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


-- 3.2: Nutrition Plan For This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.2',
  'Nutrition Plan For This Phase',
  'phase-3-nutrition-plan',
  '[
    {"type": "phase_tag", "text": "Lesson 3.2 • Nutrition"},
    {"type": "heading", "text": "Fueling Phase 3"},
    {"type": "paragraph", "text": "The nutrition plan for Phase 3 builds upon your current Intermittent Fasting schedule. You will continue to eat in a 16:8 window (12 PM to 8 PM) and consume 2 meals and 1 snack. However, we are increasing your carbohydrate intake to support your heavy lifting and high-intensity supersets."},
    {"type": "divider"},
    {"type": "heading", "text": "Key Nutrition Rules"},
    {"type": "list", "style": "bullet", "items": [
      "Deficit Shifting: Eat at a mild 300-calorie deficit. (Maintenance Calories = Weight x 29; Target = Maintenance - 300).",
      "Macro Composition: Protein remains at 2g per kg of bodyweight, and fat remains at 0.9g per kg. The extra 200 calories should come entirely from clean carbs.",
      "Nutrient Timing: Place your extra carbs in your pre-workout meal (for energy) or your post-workout meal (for muscle glycogen replenishment)."
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Recommended Carb Sources"},
    {"type": "paragraph", "text": "Choose clean, complex carbohydrates to hit your new target:"},
    {"type": "list", "style": "bullet", "items": [
      "Oats, sweet potatoes, brown or white rice, whole wheat roti.",
      "Bananas or apples as immediate pre/post-workout snack options.",
      "Avoid processed carbs like white bread, sugar, and packaged items."
    ]},
    {"type": "callout", "style": "tip", "title": "Hydration Reminder", "text": "Drink a minimum of 4 liters of clean water daily. Hydration is critical for cell volumization, strength, and recovery during intense training blocks."},
    {"type": "quote", "text": "Carbohydrates are not your enemy. In Phase 3, they are the fuel that builds your muscle."}
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


-- 3.3: Workout Plan For This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.3',
  'Workout Plan For This Phase',
  'phase-3-workout-plan',
  '[
    {"type": "phase_tag", "text": "Lesson 3.3 • Workout Split"},
    {"type": "heading", "text": "Phase 3 Training Strategy"},
    {"type": "paragraph", "text": "Phase 3 introduces advanced bodybuilding volume. We utilize Supersets, Drop Sets, and Giant Sets to push muscles to their limits and stimulate maximum hypertrophy. You will train 5 days a week with 2 dedicated recovery rest days."},
    {"type": "divider"},
    {"type": "heading", "text": "Weekly Workout Split"},
    {"type": "list", "style": "number", "items": [
      "Day 1: PUSH (Chest, Shoulders, Triceps) + 15 min LISS",
      "Day 2: PULL (Back, Biceps, Rear Delts) + Sprints",
      "Day 3: LEGS (Quads, Hamstrings, Glutes, Calves) + 15 min LISS",
      "Day 4: REST / Active Recovery",
      "Day 5: CHEST + BACK (Giant Sets) + Sprints",
      "Day 6: ARMS & DELTS (Supersets) + 15 min LISS",
      "Day 7: REST / Active Recovery"
    ]},
    {"type": "divider"},
    {"type": "heading", "text": "Understanding Advanced Techniques"},
    {"type": "paragraph", "text": "To get the most out of Phase 3, you must execute these techniques correctly:"},
    {"type": "list", "style": "bullet", "items": [
      "Supersets (SS): Do exercise A then immediately do exercise B. Rest only after both are complete.",
      "Drop Sets (DS): Do a set to failure, drop the weight by 30-40%, and immediately do reps to failure again. Do this only on the last set of selected isolation lifts.",
      "Giant Sets (GS): Perform three exercises consecutively with zero rest in between. Take a 90-second rest after completing a full round."
    ]},
    {"type": "callout", "style": "warning", "title": "Warm-Up is Mandatory", "text": "Spend 5-10 minutes performing general cardio and joint mobility exercises before starting. Do not skip warmups or cooldown stretches."},
    {"type": "quote", "text": "Intensity is the price of admission for muscle growth. Leave comfort outside the gym."}
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


-- 3.4: Supplements For This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.4',
  'Supplements For This Phase',
  'phase-3-supplements',
  '[
    {"type": "phase_tag", "text": "Lesson 3.4 • Supplements"},
    {"type": "heading", "text": "Phase 3 Supplement Stack"},
    {"type": "paragraph", "text": "Supplements are designed to fill nutritional gaps and optimize your biological state during intense training. While they are optional, they provide a proven edge when combined with strict training and nutrition."},
    {"type": "divider"},
    {"type": "heading", "text": "Recommended Supplement List"},
    {"type": "list", "style": "bullet", "items": [
      "Whey Protein: 1 scoop post-workout to deliver fast-acting amino acids directly to recovering muscle tissue.",
      "Creatine Monohydrate: 5g daily. Creatine increases ATP production, allowing you to lift heavier and recover faster between sets.",
      "Vitamin D3 + K2: 5,000 IU daily with lunch or dinner. Promotes calcium absorption, bone density, and natural testosterone production.",
      "Fish Oil (Omega-3): 1 serving with breakfast. Promotes cardiovascular health, reduces joint inflammation, and improves lipid profiles.",
      "Multivitamin: 1 serving with breakfast to cover micronutrient baselines."
    ]},
    {"type": "callout", "style": "tip", "title": "Timing is Key", "text": "Consistency is what makes supplements work. Set a daily alarm to take your vitamins and recovery stack at the same time each day."},
    {"type": "quote", "text": "Supplements supplement your effort — they do not replace it. Build the foundation first."}
  ]'::jsonb,
  5,
  ARRAY['supplements', 'nutrition', 'phase-3'],
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


-- 3.5: Common Mistakes To Avoid
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.5',
  'Common Mistakes To Avoid',
  'phase-3-mistakes',
  '[
    {"type": "phase_tag", "text": "Lesson 3.5 • Mistakes"},
    {"type": "heading", "text": "Mistakes that Stunt Growth"},
    {"type": "paragraph", "text": "Hypertrophy requires strict execution. Avoid these common training errors to maximize your muscle growth and keep your joints healthy during Phase 3:"},
    {"type": "divider"},
    {"type": "heading", "text": "Top 4 Phase 3 Mistakes"},
    {"type": "list", "style": "bullet", "items": [
      "Ego Lifting: Lifting weight that is too heavy, causing form breakdown. If you use body momentum, you are removing tension from the target muscle.",
      "Skipping Rest Rules: Rest intervals are strictly programmed. Do not cut rest short during compound lifts, and do not scroll on your phone between sets.",
      "Neglecting the Negative: Dropping the weights quickly on the eccentric phase. Focus on a controlled 2-3 second descent on every rep.",
      "Overtraining on Rest Days: Performing extra exercises or running on recovery days. Growth happens while resting, not while lifting."
    ]},
    {"type": "callout", "style": "warning", "title": "Protect Your Shoulders", "text": "Keep your elbows at a 45-60 degree angle during bench presses and shoulder presses. Flaring them too wide exposes your rotator cuffs to injury."},
    {"type": "quote", "text": "Don''t let ego ruin your progress. Control the weight, command the contraction."}
  ]'::jsonb,
  6,
  ARRAY['mistakes', 'safety', 'phase-3'],
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


-- 3.6: Action Plan For This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  3,
  '3.6',
  'Action Plan For This Phase',
  'phase-3-action-plan',
  '[
    {"type": "phase_tag", "text": "Lesson 3.6 • Action Plan"},
    {"type": "heading", "text": "Phase 3 Execution Blueprint"},
    {"type": "paragraph", "text": "Success is a system. Follow this daily action plan to execute Phase 3 with maximum efficiency and precision:"},
    {"type": "divider"},
    {"type": "heading", "text": "Your Checklist"},
    {"type": "list", "style": "bullet", "items": [
      "Track Every Workout: Record weights, sets, and reps in your workout log. Strive to beat last week by 1 rep or 1 kg.",
      "Meal Portion Adjustments: Add exactly 200 calories of clean carbs to your pre or post workout meals.",
      "Prioritize Sleep: Sleep 7-8 hours minimum. Growth hormone release peaks during deep sleep cycles.",
      "Take Rest Days Seriously: Rest means rest. Focus on stretching, light mobility, and hydration on Days 4 and 7."
    ]},
    {"type": "callout", "style": "coach", "title": "Commit to the Recomp", "text": "Your scale weight might stay stable during this phase, but your body composition will shift. Take weekly photos to track visual changes!"},
    {"type": "quote", "text": "\"Discipline is choosing between what you want now and what you want most.\" — Abraham Lincoln"}
  ]'::jsonb,
  6,
  ARRAY['action-plan', 'mindset', 'phase-3'],
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
