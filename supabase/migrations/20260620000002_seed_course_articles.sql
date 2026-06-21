-- =============================================================================
-- Seed Course Article for Lesson 1.1
-- Migration: 20260620000002_seed_course_articles.sql
-- =============================================================================

INSERT INTO course_articles (phase, lesson_number, title, slug, content, estimated_read_minutes, tags, published)
VALUES (
  1,
  '1.1',
  'Goal & Duration Of This Phase',
  'goal-duration',
  '[
    {"type": "heading", "text": "Welcome to Phase 1: The Foundation", "level": 1},
    {"type": "paragraph", "text": "Phase 1 is a foundation-building week. It is not about dramatic results on the scale, but about building the habits, form, and discipline needed to succeed in the remaining 93 days of the program. The coach is deliberate: if you can''t do this simple first week, the rest of the program will be impossible."},
    {"type": "metric_card", "label": "Program Duration", "value": "100", "unit": "Days", "icon": "calendar"},
    {"type": "metric_card", "label": "Phase 1 Duration", "value": "7", "unit": "Days", "icon": "clock"},
    {"type": "subheading", "text": "What Success Looks Like This Week"},
    {"type": "paragraph", "text": "Don''t measure success by the scale this week. Measure it by showing up. At the end of week 1, success means:"},
    {"type": "list", "style": "bullet", "items": [
      "You completed all 6 scheduled workouts",
      "You cleaned up your diet (no junk, sugar, or processed foods)",
      "You did not quit and maintained daily discipline"
    ]},
    {"type": "callout", "style": "warning", "title": "A Message From Coach", "text": "If you can''t follow this simple detox and workout plan for 7 days, the next 93 days are going to be impossible. Focus on the runway first."},
    {"type": "subheading", "text": "Core Objectives for Phase 1"},
    {"type": "list", "style": "number", "items": [
      "Build the habit of showing up daily — check off every daily task.",
      "Learn proper exercise form — repetition of the same full-body workout builds movement patterns.",
      "Clean up nutrition — no macro counting yet, just eliminate sugar, processed foods, and alcohol.",
      "Create momentum and confidence — build belief that you can follow a structured plan."
    ]},
    {"type": "quote", "text": "Form > Weight in Week 1, always. The goal of week 1 is to show up 6 times and not quit."}
  ]'::jsonb,
  5,
  ARRAY['Coach', 'Phase 1'],
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
