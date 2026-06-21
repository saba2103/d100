/**
 * seed_course.ts — D100 Phase 1 Course Articles Seed
 * Run: npx ts-node --skip-project supabase/seed_course.ts
 * IMPORTANT: Never use Coach's real name — always refer to as "Coach".
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Missing credentials"); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const articles = [
  // 1.1
  {
    phase: 1, lesson_number: "1.1", title: "Goal & Duration Of This Phase",
    slug: "goal-duration", estimated_read_minutes: 5, published: true,
    tags: ["mindset","overview","phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Days 1–7" },
      { type:"heading", text:"The Foundation Week" },
      { type:"paragraph", text:"Phase 1 is not about dramatic results. It is not about burning maximum fat or building visible muscle in seven days. It is about one thing: building the foundation that makes the next 93 days possible. Coach is deliberate — most people fail fitness programs not because they lack knowledge, but because they never built the habits to support them." },
      { type:"callout", style:"coach", title:"Coach's Opening Mindset", text:"If you can't do this for 7 days, the next 93 days are going to be impossible. This week is your baseline test — not of your fitness, but of your discipline." },
      { type:"divider" },
      { type:"heading", text:"The 100-Day Structure" },
      { type:"paragraph", text:"This is a 100-day transformation program broken into phases of increasing intensity. Phase 1 is the runway — it exists so that Phase 2 does not overwhelm you. Each phase builds directly on the habits, form, and discipline developed in the one before it." },
      { type:"metric_card", icon:"calendar", label:"Total Program Duration", value:"100", unit:"Days" },
      { type:"metric_card", icon:"clock", label:"Phase 1 Duration", value:"7", unit:"Days (Week 1)" },
      { type:"metric_card", icon:"clock", label:"Workouts Per Week", value:"6", unit:"days on, 1 rest" },
      { type:"divider" },
      { type:"heading", text:"What Phase 2 Looks Like" },
      { type:"paragraph", text:"From Day 8 onwards, the program accelerates significantly. Diet becomes structured with macros and calorie targets. Workout splits change from full-body daily to targeted splits. Intensity increases and new supplements may be added. Phase 1 exists specifically so none of this overwhelms you when the time comes." },
      { type:"callout", style:"tip", title:"Why Phase 1 Matters", text:"Phase 2 will feel easy if you nail Phase 1. The mindset that skips Week 1 is the exact same mindset that quits at Week 4. Show up every day this week." },
      { type:"divider" },
      { type:"heading", text:"Your 4 Goals This Week" },
      { type:"list", style:"number", items:["Build the habit of showing up daily — complete every assigned task without negotiation","Learn proper exercise form — the same workout daily so movement patterns become second nature","Clean up nutrition — no calorie counting, just cut the garbage from your current diet","Create momentum and confidence — build proof to yourself that you can follow a structured plan"] },
      { type:"divider" },
      { type:"heading", text:"How to Measure Success This Week" },
      { type:"paragraph", text:"Do not step on a scale every morning expecting to see dramatic change. Weight can actually go up in Week 1 — creatine and water retention are real. That is normal and expected." },
      { type:"callout", style:"warning", title:"Don't Measure By The Scale", text:"Your weight may increase in Week 1. This is normal — creatine causes water retention. Judge this week only by whether you showed up and followed the plan." },
      { type:"paragraph", text:"What success looks like at the end of Week 1:" },
      { type:"list", style:"number", items:["You completed 6 out of 7 workouts","You ate home-cooked food only for 7 days","You did not quit"] },
      { type:"quote", text:"This is a 100-day program. Phase 1 is the runway, not the destination. Show up 6 times, follow the nutrition rules, and do not quit. That is it." }
    ]
  },
  // 1.2
  {
    phase: 1, lesson_number: "1.2", title: "Nutrition Plan For This Phase",
    slug: "nutrition-plan", estimated_read_minutes: 8, published: true,
    tags: ["nutrition","diet","phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Nutrition" },
      { type:"heading", text:"The Week 1 Nutrition Philosophy" },
      { type:"paragraph", text:"Phase 1 nutrition is not a diet. There are no macros to track, no calories to count, no meal prep spreadsheets. It is a detox — a hard reset that removes the garbage from your system and your habits so your body can actually respond to training." },
      { type:"callout", style:"coach", title:"Coach Says", text:"I am not going to give you a complicated meal plan this week. I am going to give you one simple rule: eat home-cooked food only. That is it. Follow that one rule perfectly for 7 days and you have won Week 1 nutrition." },
      { type:"divider" },
      { type:"heading", text:"Foods To Avoid — Zero Exceptions" },
      { type:"paragraph", text:"This list is non-negotiable for the entire 7 days. Not mostly avoid. Not except on weekends. Every item below is out completely:" },
      { type:"list", style:"bullet", items:["Sugar — sweets, chocolates, biscuits, mithai of any kind","Sugary drinks — cold drinks, energy drinks, packaged juices, fresh fruit juice, diet coke","Junk food — pizza, burger, samosa, rolls, chips, any fast food","Maida products — naan, white bread, deep-fried parathas, biscuits","Alcohol — beer, hard liquor, wine — avoid for the entire 100 days, not just Phase 1","Fruits and fruit juices — yes, even natural sugar is out this week specifically","Dairy (optional) — if you have gut issues or feel sluggish, skip it this week"] },
      { type:"callout", style:"warning", title:"Why Cut Fruit This Week?", text:"Even natural fruit sugar spikes insulin and creates cravings. For 7 days only, Coach wants a complete sugar detox — no exceptions. Fruit comes back in Phase 2." },
      { type:"divider" },
      { type:"heading", text:"What You CAN Eat" },
      { type:"paragraph", text:"The rule Coach gives is simple: eat what your mother would approve of — minus the deep-fried versions and aloo parathas. Home-cooked food only." },
      { type:"list", style:"bullet", items:["Roti, sabji, dal, rice — basic home food is completely fine","Eggs — any style (boiled, scrambled, omelette) — no limit","Chicken, fish — home-cooked, not fried from outside","Paneer, tofu — fine if cooked at home","Curd/yogurt — if no gut issues","Any home-cooked vegetable dish — as much as you want"] },
      { type:"callout", style:"tip", title:"No Quantity Restriction", text:"There is no portion control this week. Eat as much home food as you need to feel full. The restriction is on what you eat, not how much." },
      { type:"divider" },
      { type:"heading", text:"Why This Approach Works" },
      { type:"subheading", text:"Physical Detox" },
      { type:"paragraph", text:"Most people starting this program have weeks or months of accumulated inflammation from processed food. Cutting all of that cold for 7 days resets the body's baseline — your energy improves, your sleep gets better, and your gym performance in Week 2 will already be noticeably different." },
      { type:"subheading", text:"Habit Detox" },
      { type:"paragraph", text:"The second detox is behavioural. Most people have a Maggi-at-midnight habit, an evening snack habit, a vending machine at work habit. This week breaks those automatic patterns. When you realize you survived 7 days without any of it, you have already built more self-control than you thought you had." },
      { type:"quote", text:"If you can't follow a simple home food rule for 7 days, the next 93 days are going to be impossible. This is less about food and more about proving to yourself that you can follow a plan." },
      { type:"divider" },
      { type:"heading", text:"Hydration" },
      { type:"paragraph", text:"Drink at least 3 litres of water per day. Hydration directly affects energy, performance, and recovery. Plain water only — no flavoured water, no squash." },
      { type:"metric_card", icon:"clock", label:"Daily Water Target", value:"3", unit:"Litres minimum" }
    ]
  },
  // 1.3
  {
    phase: 1, lesson_number: "1.3", title: "Workout Plan For This Phase",
    slug: "workout-plan", estimated_read_minutes: 10, published: true,
    tags: ["workout","training","phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Workout Plan" },
      { type:"heading", text:"One Workout. Six Days. On Repeat." },
      { type:"paragraph", text:"Phase 1 training is intentionally simple. There is one workout. You do it six days a week. The seventh day is rest. If you are expecting complex programming or muscle-group splits — that comes later. This week is about learning how to move correctly." },
      { type:"callout", style:"coach", title:"Coach's Priority Order This Week", text:"1. Form over everything. 2. Mind-muscle connection. 3. Controlled movement. 4. Light to moderate weight only. In that exact order. Don't jump ahead." },
      { type:"divider" },
      { type:"heading", text:"Why The Same Workout Every Day?" },
      { type:"paragraph", text:"The answer is neuromuscular learning — your brain builds motor patterns through repetition. A movement you have done once feels unfamiliar. A movement you have done 50 times feels automatic. By doing the same 10 exercises every day for 6 days, you are training your nervous system to execute the movement correctly every single time." },
      { type:"callout", style:"tip", title:"Full Body, Every Day", text:"These 10 exercises hit every major muscle group. Because you are using light-to-moderate weight and keeping reps in the 12-20 range, your muscles can recover in time for the next session. Don't worry about overtraining this week." },
      { type:"divider" },
      { type:"heading", text:"The Phase 1 Workout" },
      { type:"subheading", text:"Full Body — 6 Days Per Week" },
      { type:"list", style:"number", items:["Incline Dumbbell Press — 3 sets x 12-15 reps (Upper Chest)","Pec Deck Fly — 3 sets x 12-15 reps (Chest)","Lat Pulldown — 3 sets x 12-15 reps (Back)","Face Pulls — 3 sets x 15-20 reps (Rear Delts / Upper Back)","Leg Extension — 3 sets x 12-15 reps (Quads)","Leg Curl — 3 sets x 12-15 reps (Hamstrings)","Calf Raises — 3 sets x 15-20 reps (Calves)","Lateral Delt Raises — 3 sets x 12-15 reps (Shoulders)","Plank — 3 sets x 30-60 seconds (Core)","Cardio — 10-15 minutes (Conditioning)"] },
      { type:"metric_card", icon:"clock", label:"Rest Between Sets", value:"60-90", unit:"seconds" },
      { type:"metric_card", icon:"clock", label:"Cardio Duration", value:"10-15", unit:"minutes" },
      { type:"divider" },
      { type:"heading", text:"Warm-Up: Never Skip This" },
      { type:"paragraph", text:"Do the following warm-up before every single session. It takes 5-7 minutes and prevents injuries that could set you back months." },
      { type:"list", style:"number", items:["3 minutes light cardio — treadmill walk or cross trainer at easy pace","Arm circles — 15 reps each direction (forward and backward)","Band pull-aparts — 15 reps","Push-ups — 10-15 reps, slow and controlled","Light lateral raises — 15 reps at less than half your working weight","1 warm-up set of Incline Dumbbell Press at 50% of your working weight"] },
      { type:"quote", text:"5 minutes of warm-up can save you 5 months of injury recovery. Do not skip it." },
      { type:"divider" },
      { type:"heading", text:"Cool-Down: 5 Minutes After Every Session" },
      { type:"list", style:"bullet", items:["Chest stretch (doorway stretch) — 30 seconds each side","Overhead tricep stretch — 30 seconds each arm","Cross-body shoulder stretch — 30 seconds each arm","Chest opener (hands clasped behind back) — 30 seconds","Neck rolls — 30 seconds, slow and gentle"] },
      { type:"divider" },
      { type:"heading", text:"Cardio Guidelines" },
      { type:"paragraph", text:"Cardio this week is for conditioning, not fat burning. Keep it moderate — you should be able to hold a conversation while doing it. Treadmill walk or light jog, cycling, or cross trainer all work perfectly." },
      { type:"callout", style:"warning", title:"Do Not Go Heavy This Week", text:"If your form breaks on any exercise, the weight is too heavy. Drop it immediately. Ego lifts in Week 1 lead to injuries in Week 2. Form is the only priority." },
      { type:"divider" },
      { type:"heading", text:"Weight Selection Rule" },
      { type:"paragraph", text:"Choose a weight where you can complete all reps with perfect form and still feel like you have 2-3 more reps left in the tank. In Phase 1, you always train at 2-3 reps in reserve. Maximum effort sets come in later phases." },
      { type:"callout", style:"tip", title:"Mind-Muscle Connection", text:"Before each set, mentally focus on the muscle being trained. During the movement, actively squeeze and feel that muscle working. This is what separates beginners who go through motions from athletes who actually grow." }
    ]
  },
  // 1.4
  {
    phase: 1, lesson_number: "1.4", title: "Exercise Demonstration",
    slug: "exercise-demo", estimated_read_minutes: 15, published: true,
    tags: ["form","technique","exercises","phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Form Guide" },
      { type:"heading", text:"Perfect Form: The Only Priority" },
      { type:"paragraph", text:"This is the longest lesson in Phase 1 — and the most important. Every exercise in the Phase 1 workout is broken down below with exact cues Coach emphasises. Read through this before your first session and return to it whenever a movement feels off." },
      { type:"callout", style:"coach", title:"Coach's Golden Rule", text:"Form breaks? Weight is too heavy. Drop the weight, get the movement right, then gradually add load. Never sacrifice form for weight — especially in Phase 1 when your patterns are being set." },
      { type:"divider" },
      { type:"heading", text:"1. Incline Dumbbell Press" },
      { type:"paragraph", text:"Target: Upper Chest | Sets: 3 | Reps: 12-15" },
      { type:"subheading", text:"Setup" },
      { type:"list", style:"bullet", items:["Set the bench at 30-45 degrees incline","Feet planted below the hips — angled slightly outward, not straight forward","Retract your shoulder blades (pull them together and down) before you begin","Chest out, slight natural arch in lower back"] },
      { type:"subheading", text:"The Movement" },
      { type:"list", style:"bullet", items:["Inhale as you lower the dumbbells — take 2-3 seconds on the way down","At the bottom: full stretch in the chest, dumbbells at roughly chest height","Exhale and explode up — controlled power, not throwing","At the top: dumbbells should NOT touch — keep tension on the chest throughout"] },
      { type:"callout", style:"tip", title:"Key Cue", text:"Imagine you are trying to push the ceiling away from you, not just push the dumbbells up. This mental shift naturally engages the chest rather than the shoulders." },
      { type:"divider" },
      { type:"heading", text:"2. Pec Deck Fly" },
      { type:"paragraph", text:"Target: Chest (stretch and pump) | Sets: 3 | Reps: 12-15" },
      { type:"list", style:"bullet", items:["Set the handles at chest height — not too high, not too low","Sit back fully into the pad — lower and upper back both touching","Do NOT stretch too far back — find a comfortable stretch that does not strain the front shoulder","Keep shoulders retracted throughout — no rounding or rolling forward","This is a pump exercise: lighter weight, higher control, full squeeze at the centre"] },
      { type:"callout", style:"warning", title:"Don't Go Heavy Here", text:"Pec deck is not a strength movement. The goal is blood flow into the muscle — that pump and stretch feeling is exactly what you want. Drop the ego, feel the chest work." },
      { type:"divider" },
      { type:"heading", text:"3. Lat Pulldown" },
      { type:"paragraph", text:"Target: Back (Lats) | Sets: 3 | Reps: 12-15" },
      { type:"list", style:"bullet", items:["Grip: overhand, shoulder-width apart (underhand is also fine if more comfortable)","Pull the bar down to your upper chest — not your chin, not your stomach","Hold 1-2 seconds at the bottom — squeeze the lats","Controlled return to the top — fully extend your arms","No swinging, no using momentum — pure lat contraction"] },
      { type:"callout", style:"tip", title:"Lat Activation Tip", text:"Before pulling, think about pulling your elbows down to your back pockets. This cue instantly activates the lats and prevents you from using biceps to do the work." },
      { type:"divider" },
      { type:"heading", text:"4. Face Pulls" },
      { type:"paragraph", text:"Target: Rear Delts, Rhomboids, Posture | Sets: 3 | Reps: 15-20" },
      { type:"paragraph", text:"This is one of the most important yet underrated exercises in the entire program. Face pulls directly counteract forward head posture and rounded shoulders — problems most people have from sitting at desks and overtraining chest." },
      { type:"list", style:"bullet", items:["Cable attachment at eye level or slightly above","Grip the rope with both hands, palms facing in","Pull towards your face — your hands should end up beside your ears","At the endpoint: palms open and facing forward, elbows flared high","Start very light — rear delts and rhomboids are often severely underdeveloped"] },
      { type:"callout", style:"tip", title:"Why This Matters", text:"Coach strongly emphasises face pulls for posture. If you have been training chest-heavy for years without training your rear delts, you may have forward-rounded shoulders. This exercise is the corrective." },
      { type:"divider" },
      { type:"heading", text:"5. Leg Extension" },
      { type:"paragraph", text:"Target: Quadriceps | Sets: 3 | Reps: 12-15" },
      { type:"list", style:"bullet", items:["Adjust the pad to sit just above the ankle (not on top of the foot)","Sitting position: slightly back or slightly forward — both are acceptable","Exhale as you lift and extend, inhale as you lower","Hold at the top for 1 second — this brief pause dramatically improves quad contraction","Lower slowly — do not let the weight crash down"] },
      { type:"divider" },
      { type:"heading", text:"6. Leg Curl" },
      { type:"paragraph", text:"Target: Hamstrings | Sets: 3 | Reps: 12-15" },
      { type:"list", style:"bullet", items:["Seated or lying — both variants are effective","Do NOT fully extend legs at the bottom — this releases all tension from the hamstrings","Keep a slight bend in the knee at the starting position to maintain constant tension","Exhale as you curl up, inhale as you release slowly","Rest your back comfortably against the pad — no arching"] },
      { type:"callout", style:"warning", title:"Common Mistake", text:"Letting the legs go completely straight at the bottom removes all tension from the hamstrings. Keep a small bend at the bottom of every rep." },
      { type:"divider" },
      { type:"heading", text:"7. Calf Raises" },
      { type:"paragraph", text:"Target: Calves | Sets: 3 | Reps: 15-20" },
      { type:"list", style:"bullet", items:["Use a platform or step so the heel drops below level at the bottom","At the bottom: go as deep as possible — maximum stretch in the calf","At the top: rise as high as possible on the toes, hold 1 second","Exhale at the top, inhale at the bottom","Slow and deliberate — no bouncing, no momentum"] },
      { type:"callout", style:"tip", title:"Calves Are Slow-Twitch", text:"Calf muscles respond to slow, deliberate movement with full range of motion. Speed and momentum are your enemies here." },
      { type:"divider" },
      { type:"heading", text:"8. Lateral Delt Raises" },
      { type:"paragraph", text:"Target: Side Deltoids | Sets: 3 | Reps: 12-15" },
      { type:"list", style:"bullet", items:["Hold dumbbells at your sides with a very slight bend in the elbows","Do NOT bend the elbows further as you raise — keep arms relatively straight","Key cue: throw the dumbbell away from your body sideways — not straight up","Rotate slightly as you raise: thumb points slightly down, pinky points up","Stop when arms are parallel to the floor (shoulder height) — do not go higher","Lower slowly — 2-3 seconds down"] },
      { type:"callout", style:"warning", title:"Light Weight Is Correct", text:"Most people use way too much weight on lateral raises and end up using their traps and upper back instead of the side delts. If you can feel your neck and traps working, the weight is too heavy." },
      { type:"divider" },
      { type:"heading", text:"9. Plank" },
      { type:"paragraph", text:"Target: Core | Sets: 3 | Duration: 30-60 seconds" },
      { type:"list", style:"bullet", items:["Forearms on the floor, elbows directly below the shoulders","Feet on the floor, legs straight","Body in a completely straight line from head to heels","SQUEEZE THE GLUTES — this is the most important cue Coach gives","Draw the belly button up slightly — engage the abs","Do not let hips sag or pike too high"] },
      { type:"callout", style:"tip", title:"30 Seconds Perfect vs 60 Seconds Sloppy", text:"Coach is clear: the goal is 30-60 seconds of perfect, engaged plank — not holding any position for as long as possible. Drop to your knees and reset rather than hold a broken position." },
      { type:"divider" },
      { type:"heading", text:"10. Cardio Finisher" },
      { type:"paragraph", text:"Target: Cardiovascular Conditioning | Duration: 10-15 minutes" },
      { type:"list", style:"bullet", items:["Treadmill — light jog or brisk walk at an incline","Stationary bike — moderate resistance, comfortable pace","Cross trainer / elliptical — full body, easy on the joints","Pace: you should be able to hold a conversation but still feel warm"] },
      { type:"callout", style:"coach", title:"Purpose of Cardio This Week", text:"This is not fat-burning cardio. This week it is purely about building your cardiovascular baseline. Hard cardio comes in later phases when your body is ready for it." }
    ]
  },
  // 1.5
  {
    phase: 1, lesson_number: "1.5", title: "Supplements For This Phase",
    slug: "supplements-phase", estimated_read_minutes: 5, published: true,
    tags: ["supplements","nutrition","phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Supplements" },
      { type:"heading", text:"The Phase 1 Supplement Stack" },
      { type:"paragraph", text:"Supplements do not replace food, training, or sleep. They fill specific gaps that diet alone cannot address efficiently. Coach's Phase 1 stack has 5 supplements — each with a clear purpose and precise timing. Nothing exotic. Nothing dangerous." },
      { type:"callout", style:"warning", title:"Quality Over Brand", text:"Brand is less important than product quality. Do not buy cheap local brands or unknown labelled supplements. Stick to established, third-party tested brands." },
      { type:"divider" },
      { type:"heading", text:"Supplement 1: Whey Protein" },
      { type:"metric_card", icon:"clock", label:"Dose", value:"1 scoop", unit:"25-30g protein" },
      { type:"paragraph", text:"Timing: Post-workout, mixed in 300ml water. On rest days, take any time." },
      { type:"paragraph", text:"Whey protein is fast-absorbing and delivers amino acids to muscle tissue quickly after training. This is the window when your muscles are most primed to use protein for repair and growth." },
      { type:"callout", style:"tip", title:"Don't Overthink It", text:"Whey protein is just food in powder form. It is not a steroid, it will not make you bulky, and it is completely safe. It simply helps you hit your daily protein target." },
      { type:"divider" },
      { type:"heading", text:"Supplement 2: Creatine Monohydrate" },
      { type:"metric_card", icon:"clock", label:"Dose", value:"5g", unit:"daily (no loading phase)" },
      { type:"paragraph", text:"Timing: Mix with your post-workout whey shake." },
      { type:"paragraph", text:"Creatine is the single most researched supplement in sports science history. It increases phosphocreatine stores in muscles, which directly improves strength and power output. Over weeks of consistent use, you will be able to lift more, do more reps, and recover between sets faster." },
      { type:"callout", style:"warning", title:"Expect Weight To Go Up", text:"Creatine causes water retention inside muscle cells — this is a good thing, as it is intracellular water that makes muscles look fuller. But this is why your scale weight may increase in Week 1. Do not panic." },
      { type:"divider" },
      { type:"heading", text:"Supplement 3: Multivitamin" },
      { type:"metric_card", icon:"clock", label:"Dose", value:"1 serving", unit:"daily with breakfast" },
      { type:"paragraph", text:"Training increases your body's demand for micronutrients — B vitamins for energy metabolism, Vitamin C for immune function, zinc for testosterone and recovery, magnesium for sleep quality. A good multivitamin covers the gaps." },
      { type:"divider" },
      { type:"heading", text:"Supplement 4: Fish Oil (Omega-3)" },
      { type:"metric_card", icon:"clock", label:"Dose", value:"1 serving", unit:"daily with breakfast" },
      { type:"paragraph", text:"Omega-3 fatty acids reduce systemic inflammation — directly relevant to workout recovery, joint health, and hormonal balance. If you are training 6 days per week, inflammation management is not optional." },
      { type:"divider" },
      { type:"heading", text:"Supplement 5: Vitamin D3 + K2" },
      { type:"metric_card", icon:"clock", label:"Dose", value:"5000 IU", unit:"D3 + K2 with a fatty meal" },
      { type:"paragraph", text:"Timing: With lunch or dinner — must be taken with a meal containing fat, as D3 is fat-soluble." },
      { type:"paragraph", text:"Approximately 90% of people are Vitamin D deficient without knowing it. Low Vitamin D causes fatigue, poor immunity, hormone disruption, and slow recovery. K2 is included to direct calcium to bones rather than arteries." },
      { type:"callout", style:"coach", title:"Coach Says — Get Your D3 Checked", text:"About 90% of people are deficient in Vitamin D3 without knowing it. Get a blood test done. This supplement alone can dramatically improve your energy, mood, and sleep within 2-3 weeks." },
      { type:"divider" },
      { type:"heading", text:"Don't Waste Your Money On" },
      { type:"callout", style:"warning", title:"Fat Burners", text:"They don't work. Save your money." },
      { type:"callout", style:"warning", title:"Testosterone Boosters", text:"Fix your sleep, diet, and training instead." },
      { type:"callout", style:"warning", title:"Pre-Workouts", text:"Not needed. Black coffee works fine." },
      { type:"callout", style:"warning", title:"BCAAs", text:"Waste of money if you're eating enough protein." },
      { type:"callout", style:"warning", title:"Mass Gainers", text:"Overpriced sugar. Eat real food instead." },
      { type:"callout", style:"tip", text:"Supplements are OPTIONAL in Phase 1. Consistency is MANDATORY." }
    ]
  },
  // 1.6
  {
    phase: 1, lesson_number: "1.6", title: "Mistakes To Avoid",
    slug: "mistakes-avoid", estimated_read_minutes: 7, published: true,
    tags: ["mindset","mistakes","phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Common Mistakes" },
      { type:"heading", text:"7 Mistakes That Kill Phase 1" },
      { type:"paragraph", text:"Coach has seen thousands of people start this program. The ones who fail in Phase 1 all make the same predictable mistakes. Here are every one of them — and exactly how to avoid them." },
      { type:"divider" },
      { type:"heading", text:"Mistake #1 — Going Too Hard, Too Fast" },
      { type:"callout", style:"warning", text:"Why it hurts: You'll burn out or get injured. This is Week 1, not the finale." },
      { type:"callout", style:"tip", text:"The fix: Start with light weights. Focus on form. Build up gradually." },
      { type:"divider" },
      { type:"heading", text:"Mistake #2 — Skipping Workout Because You're Sore" },
      { type:"callout", style:"warning", text:"Why it hurts: Soreness is normal for beginners. It goes away when you move." },
      { type:"callout", style:"tip", text:"The fix: Show up anyway. Do a lighter workout if needed, but show up." },
      { type:"divider" },
      { type:"heading", text:"Mistake #3 — Overcomplicating Nutrition" },
      { type:"callout", style:"warning", text:"Why it hurts: You don't need to count calories, track macros, or time meals yet." },
      { type:"callout", style:"tip", text:"The fix: Just cut the junk. Eat clean, home-cooked food. That's it." },
      { type:"divider" },
      { type:"heading", text:"Mistake #4 — Weighing Yourself Every Day" },
      { type:"callout", style:"warning", text:"Why it hurts: Weight fluctuates daily due to water, food, stress. It'll drive you crazy." },
      { type:"callout", style:"tip", text:"The fix: Weigh once on Day 1, once on Day 7. Focus on habits, not numbers." },
      { type:"divider" },
      { type:"heading", text:"Mistake #5 — Not Posting In The Community" },
      { type:"callout", style:"warning", text:"Why it hurts: The guys who engage are the guys who transform. Every single time." },
      { type:"callout", style:"tip", text:"The fix: Post your Day 1. Ask questions. Share struggles. Get support." },
      { type:"divider" },
      { type:"heading", text:"Mistake #6 — Waiting For Motivation" },
      { type:"callout", style:"warning", text:"Why it hurts: Motivation comes AFTER you start, not before. It's a result, not a requirement." },
      { type:"callout", style:"tip", text:"The fix: Discipline first. Just start. Motivation will follow." },
      { type:"divider" },
      { type:"heading", text:"Mistake #7 — Thinking 1 Week Doesn't Matter" },
      { type:"callout", style:"warning", text:"Why it hurts: This week builds the foundation for the next 93 days." },
      { type:"callout", style:"tip", text:"The fix: How you do this week is how you'll do the entire program." },
      { type:"divider" },
      { type:"quote", text:"Avoid these mistakes and you're already ahead of 90% of people who start. Now go crush Phase 1." },
      { type:"phase_tag", text:"📋 Coach" }
    ]
  },
  // 1.7
  {
    phase: 1, lesson_number: "1.7", title: "Checklist & Action Plan",
    slug: "checklist-action", estimated_read_minutes: 6, published: true,
    tags: ["checklist","action","phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Action Plan" },
      { type:"heading", text:"Your Week 1 Action Plan" },
      { type:"paragraph", text:"Everything you need to do to start Phase 1 correctly. Complete these steps in order. Do not skip any of them — especially the documentation steps. These become your before photos and baseline measurements that you will compare everything against." },
      { type:"callout", style:"coach", title:"Coach Says — Start Date Matters", text:"Coach recommends starting on a Monday so your workout week aligns with calendar weeks. If you are starting mid-week, that is fine — just be consistent from Day 1. Do not wait for next Monday if you are ready now." },
      { type:"divider" },
      { type:"heading", text:"Before You Start" },
      { type:"list", style:"number", items:["Pick your start date — Monday is recommended but any day works","Take Day 1 photos — front, side, and back view against a plain wall, natural lighting, no flexing","Record your starting weight and key measurements: chest, waist, hips, thighs (both), and arms (both) in cm or inches","Post your introduction in the community tab — name, location, starting point, and goal","Clear out your kitchen — remove anything on the avoid list from your home if possible","Plan your first week of home-cooked meals so you do not get caught without food"] },
      { type:"callout", style:"warning", title:"Don't Skip The Photos", text:"The before photos are non-negotiable. Coach is emphatic about this. Many people skip them thinking they will remember how they looked. They do not. When Week 8 results come in and you cannot see the transformation clearly — that is a loss you cannot get back." },
      { type:"divider" },
      { type:"heading", text:"During Week 1 — Daily Checklist" },
      { type:"list", style:"bullet", items:["Complete your workout (6 of 7 days — Day 7 is rest)","Warm up for 5-7 minutes before every session — no exceptions","Cool down for 5 minutes after every session","Eat home-cooked food only — follow the avoid list strictly","Drink at least 3 litres of water","Take your 5 supplements at the correct times","Take a daily progress photo (morning or post-workout)","Check in with the community — post your workout completion or ask a question"] },
      { type:"divider" },
      { type:"heading", text:"Supplement Timing Cheat Sheet" },
      { type:"list", style:"bullet", items:["With breakfast: Multivitamin + Fish Oil","Post-workout: Whey Protein (1 scoop in 300ml water) + Creatine (5g mixed in)","With lunch or dinner: Vitamin D3 + K2 (5000 IU) — must be with a meal containing fat"] },
      { type:"metric_card", icon:"clock", label:"Workouts To Complete", value:"6", unit:"out of 7 days" },
      { type:"metric_card", icon:"calendar", label:"Program Length", value:"100", unit:"Total Days" },
      { type:"divider" },
      { type:"heading", text:"Week 1 Success Criteria" },
      { type:"paragraph", text:"At the end of Day 7, ask yourself these three questions. If the answer to all three is yes, you have successfully completed Phase 1:" },
      { type:"list", style:"number", items:["Did I complete at least 6 out of 7 workouts?","Did I eat home-cooked food only for all 7 days?","Did I not quit?"] },
      { type:"callout", style:"tip", title:"Results Don't Come This Week", text:"Do not expect visible physical change after 7 days. Week 1 is about proving to yourself that you can follow a plan. That internal shift — that proof — is the real result of Phase 1." },
      { type:"divider" },
      { type:"heading", text:"What Comes Next" },
      { type:"paragraph", text:"Phase 2 begins on Day 8. It is significantly more intensive — structured calorie and macro targets, workout splits instead of full-body daily, and higher intensity cardio. But if you have done Phase 1 correctly, none of it will feel overwhelming." },
      { type:"callout", style:"coach", title:"Coach's Final Word for Phase 1", text:"I do not want you to be perfect. I want you to show up 6 times, eat home food, and not quit. That is it. See you in Phase 2." },
      { type:"quote", text:"Phase 1 is the runway. Phase 2 is the flight. Do not skip the runway." }
    ]
  },
  // 1.a
  {
    phase: 1, lesson_number: "1.a", title: "Warm-Up & Cool-Down Guide",
    slug: "phase-1-warmup-cooldown", estimated_read_minutes: 6, published: true,
    tags: ["warm-up", "cool-down", "reference", "phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Reference" },
      { type:"heading", text:"Why Warm-Up Matters" },
      { type:"list", style:"bullet", items:[
        "Increases blood flow to muscles — better performance",
        "Raises body temperature — muscles work more efficiently",
        "Activates the muscles you're about to train — stronger mind-muscle connection",
        "Reduces risk of injury — warm muscles are flexible muscles",
        "Prepares joints for heavy loads — lubricates and protects"
      ]},
      { type:"heading", text:"Why Cool-Down Matters" },
      { type:"list", style:"bullet", items:[
        "Gradually lowers heart rate — prevents blood pooling",
        "Reduces muscle soreness (DOMS) — faster recovery",
        "Improves flexibility over time — lengthens muscles",
        "Removes lactic acid — less stiffness next day",
        "Signals your body that workout is complete — mental reset"
      ]},
      { type:"divider" },
      { type:"heading", text:"Push Day Warm-Up" },
      { type:"list", style:"bullet", items:[
        "General: Treadmill walk or Cross trainer — 3 minutes (light pace) — Purpose: Raise heart rate, increase blood flow",
        "Shoulder Mobility: Arm Circles (forward + backward) — 15 each direction — Purpose: Loosen shoulder joints",
        "Shoulder Mobility: Band Pull-Aparts (or no band — squeeze) — 15 reps — Purpose: Activate rear delts, warm rotator cuff",
        "Chest Activation: Push-Ups (slow, controlled) — 10-15 reps — Purpose: Activate chest, triceps, shoulders",
        "Shoulder Activation: Light DB Lateral Raises — 15 reps (very light) — Purpose: Warm up side delts",
        "Specific Warm-Up: 1 warm-up set of first exercise — 15 reps (50% weight) — Purpose: Prepare muscles for working sets"
      ]},
      { type:"heading", text:"Push Day Cool-Down" },
      { type:"list", style:"bullet", items:[
        "Chest Doorway Stretch — Arm on door frame at 90°, lean forward through doorway — Hold: 30 sec each arm — Target: Chest, front delt",
        "Overhead Tricep Stretch — Arm overhead, bend elbow, use other hand to push elbow down — Hold: 30 sec each arm — Target: Triceps",
        "Cross-Body Shoulder Stretch — Pull arm across body with opposite hand — Hold: 30 sec each arm — Target: Rear delt, shoulder",
        "Chest Opener — Hands clasped behind back, lift arms while squeezing shoulder blades — Hold: 30 seconds — Target: Chest, front delts",
        "Neck Rolls — Slow, controlled circles (both directions) — Hold: 30 seconds — Target: Neck, upper traps"
      ]},
      { type:"divider" },
      { type:"heading", text:"Pull Day Warm-Up" },
      { type:"list", style:"bullet", items:[
        "General: Rowing machine or Cross trainer — 3 minutes (light pace) — Purpose: Raise heart rate, activate back muscles",
        "Shoulder Mobility: Arm Circles (forward + backward) — 15 each direction — Purpose: Loosen shoulder joints",
        "Back Mobility: Cat-Cow Stretch (on hands and knees) — 10 reps (slow) — Purpose: Mobilize spine",
        "Back Activation: Band Pull-Aparts — 15 reps — Purpose: Activate rear delts, rhomboids",
        "Lat Activation: Straight Arm Pulldown (light weight) or Band — 15 reps — Purpose: Wake up lats",
        "Specific Warm-Up: 1 warm-up set of first exercise — 15 reps (50% weight) — Purpose: Prepare muscles for working sets"
      ]},
      { type:"heading", text:"Pull Day Cool-Down" },
      { type:"list", style:"bullet", items:[
        "Lat Stretch — Grab pole/door frame overhead, lean away to feel stretch in lats — Hold: 30 sec each side — Target: Lats",
        "Child's Pose — Kneel, sit back on heels, reach arms forward on floor — Hold: 45 seconds — Target: Lats, lower back",
        "Bicep Wall Stretch — Arm straight against wall, palm flat, rotate body away — Hold: 30 sec each arm — Target: Biceps, forearm",
        "Upper Trap Stretch — Tilt head to side, gently pull with hand — Hold: 30 sec each side — Target: Traps, neck",
        "Thread the Needle — On all fours, reach one arm under body and rotate — Hold: 30 sec each side — Target: Upper back, thoracic"
      ]},
      { type:"divider" },
      { type:"heading", text:"Leg Day Warm-Up" },
      { type:"list", style:"bullet", items:[
        "General: Treadmill incline walk or Cycling — 3-5 minutes (moderate pace) — Purpose: Raise heart rate, warm up legs",
        "Hip Mobility: Hip Circles (standing, each leg) — 10 each direction each leg — Purpose: Loosen hip joints",
        "Hip Mobility: Leg Swings (front-back + side-side) — 10 each direction each leg — Purpose: Dynamic hip stretch",
        "Glute Activation: Glute Bridges (bodyweight) — 15 reps (squeeze at top) — Purpose: Activate glutes",
        "Quad/Hip Activation: Bodyweight Squats (slow, full depth) — 15 reps — Purpose: Warm up quads, groove squat pattern",
        "Knee Warm-Up: Walking Lunges (bodyweight) — 10 each leg — Purpose: Warm knees, hips, quads, glutes",
        "Specific Warm-Up: 2 warm-up sets of Squats — 15 reps (bar only) / 10 reps (50% weight) — Purpose: Prepare for heavy working sets"
      ]},
      { type:"heading", text:"Leg Day Cool-Down" },
      { type:"list", style:"bullet", items:[
        "Standing Quad Stretch — Stand on one leg, pull foot to glute, knees together — Hold: 30 sec each leg — Target: Quads",
        "Standing Hamstring Stretch — Foot on bench/step, lean forward with straight back — Hold: 30 sec each leg — Target: Hamstrings",
        "Pigeon Pose — Front leg bent 90°, back leg extended, lean forward — Hold: 45 sec each leg — Target: Glutes, hip flexors",
        "Hip Flexor Stretch — Lunge position, back knee down, push hips forward — Hold: 30 sec each leg — Target: Hip flexors, quads",
        "Seated Butterfly Stretch — Sit, soles of feet together, gently push knees down — Hold: 45 seconds — Target: Inner thighs, hips",
        "Calf Stretch — Foot against wall, lean in keeping heel on ground — Hold: 30 sec each leg — Target: Calves"
      ]},
      { type:"divider" },
      { type:"callout", style:"warning", text: "5 minutes of warm-up can save you 5 months of injury recovery. Don't skip it." },
      { type:"heading", text:"Warm-Up Rules" },
      { type:"list", style:"bullet", items:[
        "Start with 3-5 min of light cardio to raise body temperature",
        "Do dynamic stretches (movement-based), NOT static holds",
        "Activate the muscles you're about to train with light exercises",
        "Always do 1-2 warm-up sets of your first exercise before working sets",
        "If you're still cold/stiff, add more warm-up — don't rush into heavy weights"
      ]},
      { type:"heading", text:"Cool-Down Rules" },
      { type:"list", style:"bullet", items:[
        "Do static stretches (hold positions) — this is NOT the time for bouncing",
        "Hold each stretch for 30-45 seconds minimum",
        "Breathe deeply — exhale into the stretch to go deeper",
        "Focus on muscles you just trained — they're warm and ready to stretch",
        "Never stretch through sharp pain — discomfort is okay, pain is not"
      ]},
      { type:"metric_card", icon:"clock", label:"Workout Order", value:"Warm-Up → Weight Training → Ab Workout → Cool-Down → Cardio (LISS)", unit:"" },
      { type:"phase_tag", text:"📋 Coach" },
      { type:"callout", style:"tip", title:"Important Note", text:"This guide applies across all phases of the program. Refer back to it every time you start a new training split." }
    ]
  },
  // 1.b
  {
    phase: 1, lesson_number: "1.b", title: "Phase 1 Workout Plan — Quick Reference",
    slug: "phase-1-workout-reference", estimated_read_minutes: 3, published: true,
    tags: ["workout", "reference", "phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Reference" },
      { type:"callout", style:"tip", text:"Same workout every day, 6 days a week. Day 7 is rest. This is intentional — repetition builds form and confidence." },
      { type:"heading", text:"The Workout" },
      { type:"metric_card", icon:"clock", label:"1. Incline Dumbbell Press", value:"3 × 12–15", unit:"Upper Chest" },
      { type:"metric_card", icon:"clock", label:"2. Pec Deck Fly", value:"3 × 12–15", unit:"Chest" },
      { type:"metric_card", icon:"clock", label:"3. Lat Pulldown", value:"3 × 12–15", unit:"Back" },
      { type:"metric_card", icon:"clock", label:"4. Face Pulls", value:"3 × 15–20", unit:"Rear Delts / Upper Back" },
      { type:"metric_card", icon:"clock", label:"5. Leg Extension", value:"3 × 12–15", unit:"Quads" },
      { type:"metric_card", icon:"clock", label:"6. Leg Curl", value:"3 × 12–15", unit:"Hamstrings" },
      { type:"metric_card", icon:"clock", label:"7. Calf Raises", value:"3 × 15–20", unit:"Calves" },
      { type:"metric_card", icon:"clock", label:"8. Lateral Delt Raises", value:"3 × 12–15", unit:"Shoulders" },
      { type:"metric_card", icon:"clock", label:"9. Plank", value:"3 × 30–60 sec", unit:"Core" },
      { type:"metric_card", icon:"clock", label:"10. Cardio", value:"1 × 10–15 min", unit:"Conditioning" },
      { type:"metric_card", icon:"clock", label:"Rest between sets", value:"60–90", unit:"seconds" },
      { type:"heading", text:"Weekly Schedule" },
      { type:"list", style:"bullet", items:[
        "Day 1: Full Body Workout",
        "Day 2: Full Body Workout",
        "Day 3: Full Body Workout",
        "Day 4: Full Body Workout",
        "Day 5: Full Body Workout",
        "Day 6: Full Body Workout",
        "Day 7: Rest"
      ]},
      { type:"heading", text:"Focus This Week" },
      { type:"list", style:"bullet", items:[
        "Learn the form",
        "Controlled movement",
        "Feel the muscle",
        "Light to moderate weights"
      ]},
      { type:"callout", style:"warning", text:"Don't add exercises. Don't change the plan. Follow it exactly as prescribed." },
      { type:"phase_tag", text:"📋 Coach" },
      { type:"callout", style:"tip", title:"Important Note", text:"This is your Phase 1 workout quick reference. Return here anytime you need a reminder of the plan." }
    ]
  },
  // 1.c
  {
    phase: 1, lesson_number: "1.c", title: "Phase 1 Supplements — Quick Reference",
    slug: "phase-1-supplements-reference", estimated_read_minutes: 3, published: true,
    tags: ["supplements", "reference", "phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Reference" },
      { type:"callout", style:"tip", text:"Supplements are the last 5% — food and training are 95%. You don't NEED supplements. But if you want to take something, here's what actually helps." },
      { type:"heading", text:"Recommended Supplements" },
      { type:"metric_card", icon:"clock", label:"Whey Protein", value:"1 scoop (25–30g)", unit:"Post-workout" },
      { type:"metric_card", icon:"clock", label:"Creatine Monohydrate", value:"5g", unit:"Post-workout" },
      { type:"metric_card", icon:"clock", label:"Multivitamins", value:"1 serving", unit:"With breakfast" },
      { type:"metric_card", icon:"clock", label:"Fish Oil", value:"1 serving (1000mg)", unit:"With breakfast" },
      { type:"metric_card", icon:"clock", label:"Vitamin D3 + K2", value:"5000 IU D3", unit:"With a meal" },
      { type:"heading", text:"Quick Notes" },
      { type:"list", style:"bullet", items:[
        "Whey Protein — Only if you struggle to get enough protein from food",
        "Creatine — Most researched supplement. Safe, effective",
        "Multivitamins — Covers basic deficiencies. Think of it as insurance",
        "Fish Oil — Omega-3s for heart health, joints, and inflammation",
        "Vitamin D3 + K2 — Most people are deficient. Essential for bones and immunity"
      ]},
      { type:"heading", text:"Don't Waste Your Money On" },
      { type:"callout", style:"warning", title:"Fat Burners", text:"They don't work. Save your money." },
      { type:"callout", style:"warning", title:"Testosterone Boosters", text:"Fix your sleep, diet, and training instead." },
      { type:"callout", style:"warning", title:"Pre-Workouts", text:"Not needed. Black coffee works fine." },
      { type:"callout", style:"warning", title:"BCAAs", text:"Waste of money if you're eating enough protein." },
      { type:"callout", style:"warning", title:"Mass Gainers", text:"Overpriced sugar. Eat real food instead." },
      { type:"callout", style:"tip", text:"Supplements are OPTIONAL in Phase 1. Consistency is MANDATORY. Save your money — buy chicken, eggs, and vegetables instead." },
      { type:"phase_tag", text:"📋 Coach" },
      { type:"callout", style:"tip", title:"Important Note", text:"This supplement guide is for Phase 1. Coach will update recommendations in later phases as training intensity increases." }
    ]
  },
  // 1.d
  {
    phase: 1, lesson_number: "1.d", title: "Mistakes to Avoid — Quick Reference",
    slug: "phase-1-mistakes-reference", estimated_read_minutes: 3, published: true,
    tags: ["mindset", "reference", "phase-1"], cover_image_url: null,
    content: [
      { type:"phase_tag", text:"Phase 1 — Reference" },
      { type:"callout", style:"tip", text:"These mistakes will slow you down or stop your progress completely. Read this carefully and avoid them at all costs." },
      { type:"heading", text:"Mistake #1 — Going Too Hard, Too Fast" },
      { type:"callout", style:"warning", text:"Why it hurts: You'll burn out or get injured. This is Week 1, not the finale." },
      { type:"callout", style:"tip", text:"The fix: Start with light weights. Focus on form. Build up gradually." },
      { type:"divider" },
      { type:"heading", text:"Mistake #2 — Skipping Workout Because You're Sore" },
      { type:"callout", style:"warning", text:"Why it hurts: Soreness is normal for beginners. It goes away when you move." },
      { type:"callout", style:"tip", text:"The fix: Show up anyway. Do a lighter workout if needed, but show up." },
      { type:"divider" },
      { type:"heading", text:"Mistake #3 — Overcomplicating Nutrition" },
      { type:"callout", style:"warning", text:"Why it hurts: You don't need to count calories, track macros, or time meals yet." },
      { type:"callout", style:"tip", text:"The fix: Just cut the junk. Eat clean, home-cooked food. That's it." },
      { type:"divider" },
      { type:"heading", text:"Mistake #4 — Weighing Yourself Every Day" },
      { type:"callout", style:"warning", text:"Why it hurts: Weight fluctuates daily due to water, food, stress. It'll drive you crazy." },
      { type:"callout", style:"tip", text:"The fix: Weigh once on Day 1, once on Day 7. Focus on habits, not numbers." },
      { type:"divider" },
      { type:"heading", text:"Mistake #5 — Not Posting In The Community" },
      { type:"callout", style:"warning", text:"Why it hurts: The guys who engage are the guys who transform. Every single time." },
      { type:"callout", style:"tip", text:"The fix: Post your Day 1. Ask questions. Share struggles. Get support." },
      { type:"divider" },
      { type:"heading", text:"Mistake #6 — Waiting For Motivation" },
      { type:"callout", style:"warning", text:"Why it hurts: Motivation comes AFTER you start, not before. It's a result, not a requirement." },
      { type:"callout", style:"tip", text:"The fix: Discipline first. Just start. Motivation will follow." },
      { type:"divider" },
      { type:"heading", text:"Mistake #7 — Thinking 1 Week Doesn't Matter" },
      { type:"callout", style:"warning", text:"Why it hurts: This week builds the foundation for the next 93 days." },
      { type:"callout", style:"tip", text:"The fix: How you do this week is how you'll do the entire program." },
      { type:"divider" },
      { type:"quote", text:"Avoid these mistakes and you're already ahead of 90% of people who start. Now go crush Phase 1." },
      { type:"phase_tag", text:"📋 Coach" },
      { type:"callout", style:"tip", title:"Important Note", text:"Keep this as a checklist. Before each workout week, run through these 7 points and make sure you're not slipping into old habits." }
    ]
  }
];

async function seed() {
  console.log("Seeding Phase 1 course articles...\n");
  for (const article of articles) {
    const { error } = await supabase.from("course_articles").upsert(
      { phase: article.phase, lesson_number: article.lesson_number, title: article.title, slug: article.slug, content: article.content, cover_image_url: article.cover_image_url, estimated_read_minutes: article.estimated_read_minutes, tags: article.tags, published: article.published, updated_at: new Date().toISOString() },
      { onConflict: "slug" }
    );
    if (error) { console.error(`  FAIL ${article.lesson_number} — ${error.message}`); }
    else { console.log(`  OK   ${article.lesson_number} — ${article.title}`); }
  }
  console.log("\nSeed complete!");
}

if (process.argv[1] && (process.argv[1].endsWith("seed_course.ts") || process.argv[1].endsWith("seed_course"))) {
  seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
}
