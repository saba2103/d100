-- =============================================================================
-- Update Phase 2 Video Lessons to be Rich Text Articles (replacing videos)
-- Migration: 20260707000002_update_phase2_articles_text.sql
-- =============================================================================

-- 2.1: Goal & Duration Of This Phase
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Days 8–35"},
  {"type": "heading", "text": "Building the Base"},
  {"type": "paragraph", "text": "Phase 2 is where the real work begins. Now that you have built a foundation of showing up and eating clean in Phase 1, we are shifting gears. This phase lasts for 28 days (Weeks 2–5). The goal is simple: maximize fat loss while retaining or building your muscle base."},
  {"type": "callout", "style": "coach", "title": "Message From Coach", "text": "Phase 1 was the runway. Phase 2 is the takeoff. This is where we start tracking numbers — both on the barbell and in the kitchen. Commit to the process for the next 28 days."},
  {"type": "metric_card", "label": "Phase 2 Duration", "value": "28", "unit": "Days (Weeks 2-5)", "icon": "calendar"},
  {"type": "metric_card", "label": "Key Focus", "value": "Hypertrophy", "unit": "& Fat Loss", "icon": "clock"},
  {"type": "divider"},
  {"type": "heading", "text": "Your Objectives This Phase"},
  {"type": "list", "style": "bullet", "items": [
    "Track your daily macros and calories precisely using the new calculator.",
    "Apply progressive overload on all Push, Pull, and Leg workouts.",
    "Execute 15-20 minutes of LISS cardio after every weight session.",
    "Log all body measurements and scale weight weekly to track real progress."
  ]},
  {"type": "quote", "text": "Consistency in Phase 2 dictates 80% of your final results. Don''t skip details."}
]'::jsonb, estimated_read_minutes = 5
WHERE slug = 'phase-2-goal-duration';


-- 2.2: Nutrition Plan For This Phase
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Nutrition"},
  {"type": "heading", "text": "The Intermittent Fasting Schedule"},
  {"type": "paragraph", "text": "In Phase 2, we implement a strict 16:8 intermittent fasting protocol. This means you will fast for 16 hours and eat all your daily meals within an 8-hour window. Fasting helps control insulin levels, increases growth hormone, and makes staying in a caloric deficit much easier."},
  {"type": "callout", "style": "tip", "title": "The 16:8 Schedule", "text": "Eating Window: 12:00 PM to 8:00 PM | Fasting Window: 8:00 PM to 12:00 PM next day. Water, black coffee, and green tea are allowed during the fast."},
  {"type": "divider"},
  {"type": "heading", "text": "Nutrition Core Rules"},
  {"type": "list", "style": "number", "items": [
    "Eat home-cooked food only. Avoid processed foods, sugar, and alcohol completely.",
    "Cook with minimal oil (1-2 teaspoons per meal maximum).",
    "Prioritize high-protein food sources in every single meal.",
    "Adjust your portion sizes based on your custom calorie calculation."
  ]},
  {"type": "callout", "style": "warning", "title": "Why Fat Loss Fails", "text": "Even clean home-cooked food has calories. If you cook with excess oil, butter, or ghee, you will easily wipe out your caloric deficit. Use a kitchen scale to measure raw ingredients."}
]'::jsonb, estimated_read_minutes = 8
WHERE slug = 'phase-2-nutrition-plan';


-- 2.3: Calorie & Macro Calculation
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Calorie Math"},
  {"type": "heading", "text": "Understanding the Fat Loss Equation"},
  {"type": "paragraph", "text": "To lose body fat, you must consume fewer calories than your body burns (a caloric deficit). In Phase 2, we use a simple, science-backed formula to find your exact daily targets based on your current body weight."},
  {"type": "divider"},
  {"type": "heading", "text": "The 4-Step Formula"},
  {"type": "list", "style": "number", "items": [
    "Find Maintenance: Multiply bodyweight in kg by 29 (e.g. 80kg × 29 = 2,320 kcal).",
    "Create Deficit: Subtract 500 calories from maintenance (e.g. 2,320 − 500 = 1,820 kcal target).",
    "Set Protein: 2g of protein per kg of bodyweight (e.g. 80kg × 2 = 160g protein).",
    "Set Fat: 0.9g of healthy fat per kg of bodyweight (e.g. 80kg × 0.9 = 72g fat).",
    "Set Carbs: Remaining calories divided by 4."
  ]},
  {"type": "callout", "style": "coach", "title": "Protein is King", "text": "Never reduce your protein target to save calories. Protein keeps you full, preserves lean muscle tissue, and has the highest thermic effect of food."},
  {"type": "metric_card", "label": "Protein Value", "value": "4", "unit": "kcal / gram", "icon": "clock"},
  {"type": "metric_card", "label": "Carbs Value", "value": "4", "unit": "kcal / gram", "icon": "clock"},
  {"type": "metric_card", "label": "Fat Value", "value": "9", "unit": "kcal / gram", "icon": "clock"}
]'::jsonb, estimated_read_minutes = 6
WHERE slug = 'phase-2-calorie-macro';


-- 2.4: Workout Plan For This Phase
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Workout Plan"},
  {"type": "heading", "text": "Transition to Split Training"},
  {"type": "paragraph", "text": "In Phase 1, you performed full-body workouts daily to build basic motor skills. In Phase 2, we are introducing a structured Push / Pull / Legs (PPL) split. This allows us to target muscle groups with more volume and intensity while ensuring they get 72 hours of recovery before being trained again."},
  {"type": "metric_card", "label": "Weekly Workouts", "value": "6", "unit": "Days", "icon": "calendar"},
  {"type": "metric_card", "label": "Rest Days", "value": "1", "unit": "Day (Day 7)", "icon": "calendar"},
  {"type": "metric_card", "label": "Duration", "value": "45-60", "unit": "Minutes", "icon": "clock"},
  {"type": "divider"},
  {"type": "heading", "text": "The Weekly PPL Split"},
  {"type": "list", "style": "bullet", "items": [
    "Day 1 & 4: PUSH DAY (Chest, Shoulders, Triceps)",
    "Day 2 & 5: PULL DAY (Back, Biceps, Rear Delts, Traps)",
    "Day 3 & 6: LEGS & LOWER BACK (Quads, Hamstrings, Calves, Glutes)",
    "Day 7: REST (Active Recovery & Mobility)"
  ]},
  {"type": "callout", "style": "tip", "title": "The Recovery Principle", "text": "Muscles grow during rest, not during workouts. Do not add extra exercises or training days. Follow the split as written and rest completely on Day 7."}
]'::jsonb, estimated_read_minutes = 7
WHERE slug = 'phase-2-workout-plan';


-- 2.5: Introduction To Workout Split
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Split Guide"},
  {"type": "heading", "text": "Why Push / Pull / Legs?"},
  {"type": "paragraph", "text": "The Push/Pull/Legs split is one of the most effective training splits ever created. By grouping muscles by their biomechanical actions, you avoid overlap and joint strain. For example, when you press for chest (Push), your shoulders and triceps are also working. By training them on the same day, they get complete rest on Pull and Legs days."},
  {"type": "divider"},
  {"type": "heading", "text": "Training Flow"},
  {"type": "list", "style": "number", "items": [
    "Warm-Up: 5-10 minutes of mobility work specific to the day.",
    "Main Lift: Heavy compound exercise (e.g. Squat or Bench Press).",
    "Accessory Work: Isolation movements targeting specific heads of the muscle.",
    "Core / Abs: 5-8 minutes of targeted core stability.",
    "Cardio: 15-20 minutes of steady-state fat burning."
  ]},
  {"type": "quote", "text": "Structure breeds results. Know exactly what you are doing before you step on the gym floor."}
]'::jsonb, estimated_read_minutes = 5
WHERE slug = 'phase-2-workout-split';


-- 2.6: Pull Day Demonstration
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Pull Day"},
  {"type": "heading", "text": "Back, Biceps, and Traps Mastery"},
  {"type": "paragraph", "text": "Pull Day focuses on the posterior chain muscles responsible for pulling weights toward your body. A strong back is the foundation for posture, shoulder health, and a wide V-taper look."},
  {"type": "divider"},
  {"type": "heading", "text": "Key Movement Guides"},
  {"type": "subheading", "text": "1. Lat Pulldown (Lats Width)"},
  {"type": "paragraph", "text": "Grip slightly wider than shoulders. Pull the bar to your upper chest by driving your elbows down. Squeeze your shoulder blades together at the bottom."},
  {"type": "subheading", "text": "2. T-Bar Row (Mid Back Thickness)"},
  {"type": "paragraph", "text": "Keep a flat back, hinge at the hips, and pull the handle toward your lower abdomen. Do not swing or use momentum."},
  {"type": "subheading", "text": "3. Face Pulls (Rear Delts / Rotator Cuff)"},
  {"type": "paragraph", "text": "Set cable at eye level. Pull rope toward your ears, flaring your elbows high. Rotate your wrists out at the end of the rep."},
  {"type": "callout", "style": "tip", "title": "The Elbow Cue", "text": "To activate your back instead of your biceps, imagine your hands are just hooks. Pull the weight by driving your elbows backward."}
]'::jsonb, estimated_read_minutes = 10
WHERE slug = 'phase-2-pull-day';


-- 2.7: Push Day Demonstration
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Push Day"},
  {"type": "heading", "text": "Chest, Shoulders, and Triceps Mastery"},
  {"type": "paragraph", "text": "Push Day targets the anterior chain pushing muscles. The focus is on chest hypertrophy, shoulder stability, and tricep power."},
  {"type": "divider"},
  {"type": "heading", "text": "Key Movement Guides"},
  {"type": "subheading", "text": "1. Incline Bench Press (Upper Chest)"},
  {"type": "paragraph", "text": "Set bench to 30-45 degrees. Lower the bar slowly to your upper chest, keep elbows tucked at 45 degrees (do not flare them), and press up."},
  {"type": "subheading", "text": "2. Dumbbell Shoulder Press (Front Delts)"},
  {"type": "paragraph", "text": "Sit upright. Press dumbbells overhead in a controlled arc, stopping just before lockout to keep tension on the shoulders."},
  {"type": "subheading", "text": "3. Side Lateral Raises (Side Delts)"},
  {"type": "paragraph", "text": "Lean slightly forward. Throw the dumbbells out to the sides (not up), keeping a slight bend in your elbows. Lead with your pinkies."},
  {"type": "callout", "style": "warning", "title": "Protect Your Shoulders", "text": "Never flare your elbows straight out to the sides on presses. Tucking them slightly inward protects your rotator cuffs from impingement."}
]'::jsonb, estimated_read_minutes = 10
WHERE slug = 'phase-2-push-day';


-- 2.8: Leg Day Demonstration
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Leg Day"},
  {"type": "heading", "text": "Quads, Hamstrings, Glutes, and Calves"},
  {"type": "paragraph", "text": "Leg training is the most demanding part of the program, but it is non-negotiable. Lower body training releases growth hormone, burns massive calories, and builds structural balance."},
  {"type": "divider"},
  {"type": "heading", "text": "Key Movement Guides"},
  {"type": "subheading", "text": "1. Barbell Back Squats"},
  {"type": "paragraph", "text": "Place bar on upper traps. Step back, stand shoulder-width apart. Squat down by pushing hips back and bending knees until thighs are parallel to the floor. Drive through heels."},
  {"type": "subheading", "text": "2. Walking Lunges"},
  {"type": "paragraph", "text": "Take a long step forward, lower hips until back knee is near the floor. Keep front knee behind toes. Step forward and alternate."},
  {"type": "subheading", "text": "3. Calf Raises"},
  {"type": "paragraph", "text": "Rise as high as possible on toes, pause for 1 second, and lower slowly below the step level for a full stretch."},
  {"type": "callout", "style": "warning", "title": "Knee Alignment", "text": "Make sure your knees track in line with your toes. Do not let them cave inward (valgus collapse) during squats or lunges."}
]'::jsonb, estimated_read_minutes = 10
WHERE slug = 'phase-2-leg-day';


-- 2.9: Summary of the Workout Split
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Training Rules"},
  {"type": "heading", "text": "The Hypertrophy Protocol"},
  {"type": "paragraph", "text": "To get the most out of Phase 2 training, you must adhere to the hypertrophy parameters. Weight lifting is a stimulus — if the stimulus is weak, the body won''t adapt."},
  {"type": "divider"},
  {"type": "heading", "text": "Core Training Parameters"},
  {"type": "metric_card", "label": "Rest Intervals", "value": "60-90", "unit": "seconds", "icon": "clock"},
  {"type": "metric_card", "label": "Rep Tempo", "value": "3-1-1-0", "unit": "tempo", "icon": "clock"},
  {"type": "metric_card", "label": "Reps in Reserve", "value": "1-2", "unit": "RIR", "icon": "clock"},
  {"type": "divider"},
  {"type": "heading", "text": "Tempo Explanation (3-1-1-0)"},
  {"type": "list", "style": "bullet", "items": [
    "3 seconds eccentric (lowering the weight slowly under control)",
    "1 second pause at the bottom (stretch phase)",
    "1 second concentric (pushing or pulling with power)",
    "0 seconds pause at the top (keep constant tension)"
  ]},
  {"type": "callout", "style": "coach", "title": "Mind-Muscle Connection", "text": "Do not just move the weight from point A to point B. Feel the muscle contract, squeeze at the peak, and control the weight on the way down."}
]'::jsonb, estimated_read_minutes = 5
WHERE slug = 'phase-2-workout-summary';


-- 2.10: Supplements For This Phase
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Supplements"},
  {"type": "heading", "text": "The Caloric Deficit Support Stack"},
  {"type": "paragraph", "text": "When in a calorie deficit, your body has less food to recover from training. This makes supplementation critical to protect joints, cover vitamin deficiencies, and keep performance high."},
  {"type": "divider"},
  {"type": "heading", "text": "The Phase 2 Stack"},
  {"type": "list", "style": "bullet", "items": [
    "Whey Protein (1 scoop post-workout): Helps hit daily protein targets conveniently.",
    "Creatine Monohydrate (5g daily): Increases muscle ATP stores, strength, and cell hydration.",
    "Multivitamin (1 serving with breakfast): Fills micro-nutrient gaps during dieting.",
    "Fish Oil (1000mg with breakfast): Reduces joint inflammation and supports heart health.",
    "Vitamin D3 + K2 (5000 IU with fat-containing meal): Critical for bone density and hormone levels."
  ]},
  {"type": "callout", "style": "warning", "title": "Consistency is Key", "text": "Creatine does not work if you take it on and off. It requires daily dosing (5g) to keep muscle creatine stores saturated. Take it every single day, including rest days."}
]'::jsonb, estimated_read_minutes = 5
WHERE slug = 'phase-2-supplements';


-- 2.11: Mistakes To Avoid
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Warnings"},
  {"type": "heading", "text": "Avoid These Fat Loss Pitfalls"},
  {"type": "paragraph", "text": "Phase 2 requires high precision. Even small mistakes can completely stall your fat loss and muscle retention. Study this checklist before starting."},
  {"type": "divider"},
  {"type": "heading", "text": "The 5 Biggest Mistakes"},
  {"type": "list", "style": "number", "items": [
    "Ego Lifting: Using weights too heavy, which ruins form, increases injury risk, and shifts tension away from target muscles.",
    "Skipping LISS Cardio: Thinking weight training is enough. Post-workout cardio burns the mobilized fat cells.",
    "Eyeballing Portions: Guessing meal weights. Ghee, oils, and nuts must be measured on a scale.",
    "Overtraining Abs: Doing hours of core work thinking it burns belly fat. Abs are revealed by overall calorie deficit.",
    "Poor Sleep: Sleeping less than 7 hours spikes cortisol, increases cravings, and breaks down muscle tissue."
  ]},
  {"type": "quote", "text": "Discipline is doing what needs to be done, even when you don''t feel like it."}
]'::jsonb, estimated_read_minutes = 5
WHERE slug = 'phase-2-mistakes';


-- 2.12: Action Plan
UPDATE course_articles
SET content = '[
  {"type": "phase_tag", "text": "Phase 2 — Kickoff"},
  {"type": "heading", "text": "Your Execution Blueprint"},
  {"type": "paragraph", "text": "Success in Phase 2 is about systematic execution. Here is your daily checklist for the next 28 days."},
  {"type": "divider"},
  {"type": "heading", "text": "Daily Checklist"},
  {"type": "list", "style": "bullet", "items": [
    "Wake up, hydrate, and maintain fasting window until 12:00 PM.",
    "Review your workout schedule (Push, Pull, or Legs) and pre-calculate targets.",
    "Follow the warm-up protocol before lifting.",
    "Log every exercise weight and rep inside the workout tracker.",
    "Perform 15-20 minutes of post-workout LISS cardio.",
    "Track all meals, hit your protein target first, and close eating window by 8:00 PM.",
    "Drink at least 3-4 liters of water throughout the day.",
    "Sleep 7-8 hours to maximize muscle recovery and fat burn."
  ]},
  {"type": "callout", "style": "coach", "title": "Let''s Execute", "text": "No excuses. No negotiations. Show up every single day and do the work. The results will follow."}
]'::jsonb, estimated_read_minutes = 5
WHERE slug = 'phase-2-action-plan';
