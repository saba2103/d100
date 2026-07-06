-- =============================================================================
-- Seed Video Course Articles for Phase 2 (Lessons 2.1 to 2.12)
-- Migration: 20260707000001_seed_phase2_video_articles.sql
-- =============================================================================

-- 2.1: Goal & Duration Of This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.1',
  'Goal & Duration Of This Phase',
  'phase-2-goal-duration',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.1 Goal & Duration Of This Phase.mp4", "caption": "Goal & Duration Of This Phase Walkthrough"},
    {"type": "heading", "text": "Core Objectives of Phase 2"},
    {"type": "paragraph", "text": "Phase 2 represents building the base of your muscle growth and fat loss journey. We transition from a simple introductory week to a structured calorie deficit and split training routine. Watch the video above for the complete breakdown."}
  ]'::jsonb,
  5,
  ARRAY['overview', 'phase-2'],
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


-- 2.2: Nutrition Plan For This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.2',
  'Nutrition Plan For This Phase',
  'phase-2-nutrition-plan',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.2 Nutrition Plan For This Phase.mp4", "caption": "Nutrition Plan Detailed Breakdown"},
    {"type": "heading", "text": "Phase 2 Diet & Intermittent Fasting"},
    {"type": "paragraph", "text": "We implement a strict 16:8 intermittent fasting window this phase. Zero calories during the fast, and prioritizing protein during the eating window. Watch the video for instructions."}
  ]'::jsonb,
  8,
  ARRAY['nutrition', 'diet', 'phase-2'],
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


-- 2.3: Calorie & Macro Calculation
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.3',
  'Calorie & Macro Calculation',
  'phase-2-calorie-macro',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.3 Calorie and Macro Calculation.mp4", "caption": "Calorie and Macro Formula Walkthrough"},
    {"type": "heading", "text": "How to Determine Your Targets"},
    {"type": "paragraph", "text": "Watch this video guide on how to calculate maintenance calories, subtract 500 calories for fat loss, and split your macros (2g protein/kg body weight, 0.9g fat/kg body weight, and remaining calories for carbs)."}
  ]'::jsonb,
  6,
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


-- 2.4: Workout Plan For This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.4',
  'Workout Plan For This Phase',
  'phase-2-workout-plan',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.4 Workout Plan For This Phase.mp4", "caption": "Phase 2 Training Overview"},
    {"type": "heading", "text": "Split Training Introduction"},
    {"type": "paragraph", "text": "We are moving into a Push, Pull, Legs training split. Watch the video to learn why this split is optimal for hypertrophy, fatigue management, and burning body fat."}
  ]'::jsonb,
  7,
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


-- 2.5: Introduction To Workout Split
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.5',
  'Introduction To Workout Split',
  'phase-2-workout-split',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.5 Introduction To Workout Split.mp4", "caption": "PPL Schedule and Structure"},
    {"type": "heading", "text": "Understanding Push / Pull / Legs"},
    {"type": "paragraph", "text": "This guide explains the physiological benefits of training muscles that perform similar movements together on the same day. Watch the video for the explanation."}
  ]'::jsonb,
  5,
  ARRAY['workout', 'split', 'phase-2'],
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


-- 2.6: Pull Day Demonstration
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.6',
  'Pull Day Demonstration',
  'phase-2-pull-day',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.6 Pull Day.mp4", "caption": "Pull Day Exercise Walkthrough"},
    {"type": "heading", "text": "Back, Biceps, and Traps Form Guide"},
    {"type": "paragraph", "text": "Learn the proper form for lat pulldowns, T-bar rows, seated cable rows, face pulls, dumbbell shrugs, bicep curls, and preacher curls. Squeeze your lats and control the negative."}
  ]'::jsonb,
  10,
  ARRAY['workout', 'pull-day', 'form', 'phase-2'],
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


-- 2.7: Push Day Demonstration
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.7',
  'Push Day Demonstration',
  'phase-2-push-day',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.7 Push Day.mp4", "caption": "Push Day Exercise Walkthrough"},
    {"type": "heading", "text": "Chest, Shoulders, and Triceps Form Guide"},
    {"type": "paragraph", "text": "Watch this video to master the form for incline bench press, incline dumbbell press, flat dumbbell flies, shoulder presses, lateral raises, tricep pushdowns, and skull crushers."}
  ]'::jsonb,
  10,
  ARRAY['workout', 'push-day', 'form', 'phase-2'],
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


-- 2.8: Leg Day Demonstration
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.8',
  'Leg Day Demonstration',
  'phase-2-leg-day',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.8 Leg Day.mp4", "caption": "Leg Day Exercise Walkthrough"},
    {"type": "heading", "text": "Quads, Hamstrings, Glutes, and Calves Guide"},
    {"type": "paragraph", "text": "Proper leg training is essential. Watch the video breakdown of squats, leg press, extensions, curls, lunges, and calf raises."}
  ]'::jsonb,
  10,
  ARRAY['workout', 'leg-day', 'form', 'phase-2'],
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


-- 2.9: Summary of the Workout Split
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.9',
  'Summary of the Workout Split',
  'phase-2-workout-summary',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.9 Summary of the workout.mp4", "caption": "Workout Routine Review"},
    {"type": "heading", "text": "Phase 2 Training Core Rules"},
    {"type": "paragraph", "text": "A brief summary video wrapping up our workout schedule, rest intervals, and target weights rules."}
  ]'::jsonb,
  5,
  ARRAY['workout', 'summary', 'phase-2'],
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


-- 2.10: Supplements For This Phase
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.10',
  'Supplements For This Phase',
  'phase-2-supplements',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.10 Supplements For This Phase.mp4", "caption": "Phase 2 Supplement Guide"},
    {"type": "heading", "text": "Optimizing Recovery and Performance"},
    {"type": "paragraph", "text": "Watch this video to understand the supplementation needed this week to support your recovery, hydration, and vitamin baseline during the caloric deficit."}
  ]'::jsonb,
  5,
  ARRAY['supplements', 'phase-2'],
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


-- 2.11: Mistakes To Avoid
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.11',
  'Mistakes To Avoid',
  'phase-2-mistakes',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.11 Mistakes To Avoid.mp4", "caption": "Top Errors in Fat Burning Mode"},
    {"type": "heading", "text": "How to Stay On Track"},
    {"type": "paragraph", "text": "Avoid ego lifting, skipping post-workout cardio, not tracking weights, or resting too long. Watch this video to steer clear of these pitfalls."}
  ]'::jsonb,
  5,
  ARRAY['overview', 'mistakes', 'phase-2'],
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


-- 2.12: Action Plan
INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  2,
  '2.12',
  'Action Plan',
  'phase-2-action-plan',
  '[
    {"type": "phase_tag", "text": "Phase 2 — Video Lesson"},
    {"type": "video", "url": "/videos/2.12 Action Plan.mp4", "caption": "Phase 2 execution strategy"},
    {"type": "heading", "text": "Show Up and Execute"},
    {"type": "paragraph", "text": "Final video walkthrough setting up the mindset and checklist for the next 28 days of base building. Stay consistent."}
  ]'::jsonb,
  5,
  ARRAY['overview', 'checklist', 'phase-2'],
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
