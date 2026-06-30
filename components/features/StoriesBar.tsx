"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Lock, Check, Sparkle, Fire, Crown, Trophy, Rocket, Star, Heart, Flame, Lightning, Barbell, ForkKnife, Drop, Pill, Image } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

interface StoriesBarProps {
  activeProfile: string;
  programDay: number;
  workoutStreak: number;
  profileName: string;
  userId: string;
  programStartDate: string | null;
  isPartnerConnected: boolean;
}

interface StorySlide {
  id: string;
  bgImage: string;
  tag: string;
  tagColor: string;
  title: string;
  subtitle?: string;
  quote?: string;
  author?: string;
  keyPoints?: { icon: any; title: string; desc: string }[];
  accentGradient: string;
  // Photo-specific
  isPhotoSlide?: boolean;
  photoDay?: number;
  photoDate?: string;
  isPlaceholder?: boolean;
}

interface StoryGroup {
  id: string;
  title: string;
  avatarText: string;
  avatarBg: string;
  avatarUrl?: string | null;
  locked: boolean;
  unlockedDayMin: number;
  slides: StorySlide[];
}

// Helper: calculate the day number given a date and program start
function getDayNumber(dateStr: string, startDate: string): number {
  const d = new Date(dateStr);
  const s = new Date(startDate);
  d.setHours(0, 0, 0, 0);
  s.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function StoriesBar({ activeProfile, programDay, workoutStreak, profileName, userId, programStartDate, isPartnerConnected }: StoriesBarProps) {
  const [viewedStories, setViewedStories] = useState<Record<string, boolean>>({});
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Map of dayNumber → signed photo URL (only days that have photos)
  const [photoByDay, setPhotoByDay] = useState<Record<number, { url: string; date: string }>>({});

  const [sabaAvatar, setSabaAvatar] = useState<string | null>(null);
  const [ancyAvatar, setAncyAvatar] = useState<string | null>(null);

  // Load viewed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("d100_viewed_stories");
      if (saved) setViewedStories(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Fetch + sign all progress photos, map them by day number
  useEffect(() => {
    if (!userId || !programStartDate) return;
    const supabase = createClient();

    (async () => {
      // 1. Fetch member avatars
      const { data: memberProfiles } = await supabase
        .from("member_profiles")
        .select("profile_tag, avatar_url")
        .eq("user_id", userId);

      if (memberProfiles) {
        for (const mp of memberProfiles) {
          if (mp.avatar_url) {
            if (mp.profile_tag === "S") setSabaAvatar(mp.avatar_url);
            if (mp.profile_tag === "A") setAncyAvatar(mp.avatar_url);
          }
        }
      }

      // 2. Fetch progress photos
      const { data } = await supabase
        .from("collection_items")
        .select("id, file_url, taken_at, created_at, album, profile_tag, title")
        .eq("user_id", userId)
        .eq("file_type", "photo")
        .order("taken_at", { ascending: true });

      if (!data || data.length === 0) return;

      const map: Record<number, { url: string; date: string }> = {};
      for (const photo of data) {
        const dateStr = photo.taken_at || photo.created_at?.split("T")[0] || "";
        if (!dateStr) continue;
        const dayNum = getDayNumber(dateStr, programStartDate);
        if (dayNum < 1 || dayNum > 100) continue;

        // Get a signed URL (or use raw if already a full http URL)
        let signedUrl = "";
        if (photo.file_url.startsWith("http")) {
          signedUrl = photo.file_url;
        } else {
          const { data: sd } = await supabase.storage
            .from("collection")
            .createSignedUrl(photo.file_url, 3600);
          if (sd?.signedUrl) signedUrl = sd.signedUrl;
        }
        if (!signedUrl) continue;

        const formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        });
        // Keep newest photo per day if multiple exist
        map[dayNum] = { url: signedUrl, date: formattedDate };
      }
      setPhotoByDay(map);
    })();
  }, [userId, activeProfile, programStartDate]);

  // Build slides only for days that have a photo — skip days with no photo
  const allDaySlides: StorySlide[] = Object.entries(photoByDay)
    .sort(([a], [b]) => Number(a) - Number(b)) // ascending day order
    .map(([dayStr, photo]) => {
      const day = Number(dayStr);
      return {
        id: `day_${day}`,
        bgImage: photo.url,
        tag: `DAY ${day} • PROFILE ${activeProfile}`,
        tagColor: "text-[#FF6B00] bg-[#FF6B00]/15 border-[#FF6B00]/30",
        title: `DAY ${day}`,
        subtitle: photo.date,
        accentGradient: "from-[#FF6B00] to-[#FFAA00]",
        isPhotoSlide: true,
        photoDay: day,
        photoDate: photo.date,
      };
    });

  const markStoryAsViewed = (groupId: string) => {
    setViewedStories((prev) => {
      const updated = { ...prev, [groupId]: true };
      try {
        localStorage.setItem("d100_viewed_stories", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Static motivational slides appended after the 100-day timeline
  const staticProgressSlides: StorySlide[] = [
    {
      id: "yp_streak",
      bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
      tag: "DAILY RECAP",
      tagColor: "text-amber-400 bg-amber-500/15 border-amber-500/30",
      title: `${workoutStreak} DAY STREAK`,
      subtitle: "Consistency builds champions",
      keyPoints: [
        { icon: Fire, title: "Workout Target", desc: "Crush today's planned set & rep protocol." },
        { icon: Drop, title: "Hydration Check", desc: "Hit your 3,000 ml water goal before night." },
        { icon: Pill, title: "Supplements", desc: "Stay compliant with your morning & evening stacks." },
      ],
      accentGradient: "from-amber-500 to-[#FF6B00]",
    },
  ];

  const storyGroups: StoryGroup[] = [
    {
      id: "your_progress",
      title: "you",
      avatarText: activeProfile,
      avatarBg: "bg-gradient-to-tr from-[#FF6B00] to-[#FFAA00]",
      avatarUrl: activeProfile === "S" ? sabaAvatar : ancyAvatar,
      locked: false,
      unlockedDayMin: 1,
      // Day 1–100 slides first, then streak recap
      slides: [...allDaySlides, ...staticProgressSlides],
    },
    {
      id: "partner_progress",
      title: "partner",
      avatarText: activeProfile === "S" ? "A" : "S",
      avatarBg: "bg-gradient-to-tr from-purple-600 to-pink-500",
      avatarUrl: activeProfile === "S" && isPartnerConnected ? ancyAvatar : activeProfile === "A" && isPartnerConnected ? sabaAvatar : null,
      locked: !isPartnerConnected,
      unlockedDayMin: 1,
      slides: [
        {
          id: "pp_1",
          bgImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop",
          tag: `PARTNER ${activeProfile === "S" ? "ANCY" : "SABA"}`,
          tagColor: "text-purple-400 bg-purple-500/15 border-purple-500/30",
          title: "STRONGER TOGETHER",
          quote: "Surround yourself with people on the same mission. When one rises, both win.",
          author: "D100 Accountability Rule",
          accentGradient: "from-purple-500 to-pink-500",
        },
      ],
    },
    {
      id: "phase_1",
      title: "Phase 1",
      avatarText: "P1",
      avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-400",
      locked: programDay < 1,
      unlockedDayMin: 1,
      slides: [
        // ─── Lesson 1.1 — Goal & Duration ───────────────────────────────────
        {
          id: "p1_1",
          bgImage: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.1 • DAYS 1–7",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "FOUNDATION WEEK",
          quote: "This is a 100-day program. Phase 1 is the runway, not the destination. Show up 6 times, follow the nutrition rules, and do not quit. That is it.",
          author: "Coach — Lesson 1.1",
          accentGradient: "from-emerald-500 to-teal-400",
        },
        {
          id: "p1_2",
          bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.1 • MINDSET",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "YOUR 4 GOALS THIS WEEK",
          keyPoints: [
            { icon: Barbell, title: "Show Up Daily", desc: "Complete every assigned task without negotiation." },
            { icon: Sparkle, title: "Learn Proper Form", desc: "Same workout daily — movement patterns become second nature." },
            { icon: ForkKnife, title: "Clean Up Nutrition", desc: "No calorie counting. Just cut the garbage from your diet." },
            { icon: Star, title: "Build Momentum", desc: "Create proof to yourself that you can follow a structured plan." },
          ],
          accentGradient: "from-teal-500 to-emerald-500",
        },
        {
          id: "p1_3",
          bgImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.1 • COACH'S WARNING",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "YOUR DISCIPLINE BASELINE TEST",
          quote: "If you can't do this for 7 days, the next 93 days are going to be impossible. This week is your baseline test — not of your fitness, but of your discipline.",
          author: "Coach — Lesson 1.1",
          accentGradient: "from-emerald-600 to-teal-400",
        },

        // ─── Lesson 1.2 — Nutrition ──────────────────────────────────────────
        {
          id: "p1_4",
          bgImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.2 • NUTRITION",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "EAT HOME. THAT'S IT.",
          quote: "I am not going to give you a complicated meal plan this week. I am going to give you one simple rule: eat home-cooked food only. Follow that one rule perfectly for 7 days and you have won Week 1 nutrition.",
          author: "Coach — Lesson 1.2",
          accentGradient: "from-emerald-400 to-green-500",
        },
        {
          id: "p1_5",
          bgImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.2 • NUTRITION DETOX",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "ZERO EXCEPTIONS",
          keyPoints: [
            { icon: ForkKnife, title: "No Sugar or Junk", desc: "Sweets, biscuits, pizza, chips — completely out for 7 days." },
            { icon: Drop, title: "No Sugary Drinks", desc: "Cold drinks, energy drinks, packaged juice — zero." },
            { icon: Flame, title: "No Alcohol", desc: "Beer, liquor, wine — avoid for the entire 100 days." },
          ],
          accentGradient: "from-green-500 to-emerald-400",
        },
        {
          id: "p1_6",
          bgImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.2 • HYDRATION",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "3 LITRES. EVERY DAY.",
          quote: "If you can't follow a simple home food rule for 7 days, the next 93 days are going to be impossible. This is less about food and more about proving to yourself that you can follow a plan.",
          author: "Coach — Lesson 1.2",
          accentGradient: "from-teal-400 to-emerald-500",
        },

        // ─── Lesson 1.3 — Workout ────────────────────────────────────────────
        {
          id: "p1_7",
          bgImage: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.3 • WORKOUT",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "ONE WORKOUT. SIX DAYS.",
          quote: "5 minutes of warm-up can save you 5 months of injury recovery. Do not skip it.",
          author: "Coach — Lesson 1.3",
          accentGradient: "from-emerald-500 to-teal-400",
        },
        {
          id: "p1_8",
          bgImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.3 • FORM PRIORITY",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "COACH'S PRIORITY ORDER",
          keyPoints: [
            { icon: Barbell, title: "1. Form Over Everything", desc: "If form breaks, the weight is too heavy. Drop it immediately." },
            { icon: Sparkle, title: "2. Mind-Muscle Connection", desc: "Mentally focus on the muscle you are training before every set." },
            { icon: Lightning, title: "3. Controlled Movement", desc: "Light to moderate weight only — no ego lifts in Week 1." },
          ],
          accentGradient: "from-emerald-400 to-teal-500",
        },

        // ─── Lesson 1.4 — Exercise Demo ──────────────────────────────────────
        {
          id: "p1_9",
          bgImage: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.4 • FORM GUIDE",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "THE GOLDEN RULE",
          quote: "Form breaks? Weight is too heavy. Drop the weight, get the movement right, then gradually add load. Never sacrifice form for weight — especially in Phase 1 when your patterns are being set.",
          author: "Coach — Lesson 1.4",
          accentGradient: "from-teal-500 to-emerald-600",
        },

        // ─── Lesson 1.5 — Supplements ────────────────────────────────────────
        {
          id: "p1_10",
          bgImage: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.5 • SUPPLEMENTS",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "YOUR PHASE 1 STACK",
          keyPoints: [
            { icon: Pill, title: "Whey Protein", desc: "1 scoop post-workout. Fast amino acid delivery during the repair window." },
            { icon: Sparkle, title: "Creatine Monohydrate", desc: "5g daily with whey. Most researched supplement in sports science." },
            { icon: Star, title: "D3 + K2 + Fish Oil", desc: "90% of people are Vitamin D deficient without knowing it. Fix this." },
          ],
          accentGradient: "from-emerald-500 to-green-400",
        },
        {
          id: "p1_11",
          bgImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.5 • COACH SAYS",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "SUPPLEMENTS ARE OPTIONAL. CONSISTENCY IS MANDATORY.",
          quote: "About 90% of people are deficient in Vitamin D3 without knowing it. Get a blood test done. This supplement alone can dramatically improve your energy, mood, and sleep within 2–3 weeks.",
          author: "Coach — Lesson 1.5",
          accentGradient: "from-green-500 to-teal-400",
        },

        // ─── Lessons 1.6 + 1.7 — Mistakes & Checklist ───────────────────────
        {
          id: "p1_12",
          bgImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
          tag: "LESSON 1.6 & 1.7 • FINAL WORD",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
          title: "PHASE 1 IS THE RUNWAY",
          keyPoints: [
            { icon: Flame, title: "Mistake to Avoid", desc: "Waiting for motivation. Discipline first — motivation follows action." },
            { icon: Trophy, title: "Week 1 Success", desc: "6 workouts done, home food only, you did not quit. That's it." },
            { icon: Rocket, title: "Coach's Final Word", desc: "\"I do not want you to be perfect. I want you to show up. See you in Phase 2.\"" },
          ],
          accentGradient: "from-emerald-400 to-teal-500",
        },
      ],
    },

    {
      id: "phase_2",
      title: "Phase 2",
      avatarText: "P2",
      avatarBg: "bg-gradient-to-tr from-purple-500 to-indigo-500",
      locked: programDay < 8,
      unlockedDayMin: 8,
      slides: [
        {
          id: "p2_1",
          bgImage: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1000&auto=format&fit=crop",
          tag: "PHASE 2 • DAYS 8–35",
          tagColor: "text-purple-400 bg-purple-500/15 border-purple-500/30",
          title: "BUILDING THE BASE",
          quote: "Repetition is the mother of skill. When motivation fades, discipline takes command.",
          author: "Course Chapter 2.1",
          accentGradient: "from-purple-500 to-indigo-500",
        },
        {
          id: "p2_2",
          bgImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
          tag: "PROGRESSIVE OVERLOAD",
          tagColor: "text-purple-400 bg-purple-500/15 border-purple-500/30",
          title: "HYPERTROPHY FOCUS",
          keyPoints: [
            { icon: Barbell, title: "Add Weight / Reps", desc: "Track every set and strive for incremental overload." },
            { icon: Lightning, title: "Controlled Eccentrics", desc: "Focus on 3-second negative tempo for maximum muscle fiber engagement." },
          ],
          accentGradient: "from-indigo-500 to-purple-600",
        },
      ],
    },
    {
      id: "phase_3",
      title: "Phase 3",
      avatarText: "P3",
      avatarBg: "bg-gradient-to-tr from-blue-500 to-cyan-400",
      locked: programDay < 36,
      unlockedDayMin: 36,
      slides: [
        {
          id: "p3_1",
          bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
          tag: "PHASE 3 • DAYS 36–63",
          tagColor: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
          title: "MUSCLE BUILDING MODE",
          quote: "You have crossed the halfway mark. You are no longer trying — you are transforming.",
          author: "Course Chapter 3.1",
          accentGradient: "from-blue-500 to-cyan-400",
        },
      ],
    },
    {
      id: "phase_4",
      title: "Phase 4",
      avatarText: "P4",
      avatarBg: "bg-gradient-to-tr from-red-500 to-orange-500",
      locked: programDay < 64,
      unlockedDayMin: 64,
      slides: [
        {
          id: "p4_1",
          bgImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop",
          tag: "PHASE 4 • DAYS 64–91",
          tagColor: "text-red-400 bg-red-500/15 border-red-500/30",
          title: "SHREDDING PHASE",
          quote: "Unveil the work you built. High intensity, strict deficits, absolute focus.",
          author: "Course Chapter 4.1",
          accentGradient: "from-red-500 to-orange-500",
        },
      ],
    },
    {
      id: "phase_5",
      title: "Phase 5",
      avatarText: "P5",
      avatarBg: "bg-gradient-to-tr from-amber-400 to-yellow-300 text-black",
      locked: programDay < 92,
      unlockedDayMin: 92,
      slides: [
        {
          id: "p5_1",
          bgImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
          tag: "PHASE 5 • DAYS 92–100",
          tagColor: "text-amber-400 bg-amber-500/15 border-amber-500/30",
          title: "PEAK WEEK",
          quote: "The final stretch to immortality. Finish what you started 100 days ago.",
          author: "Course Chapter 5.1",
          accentGradient: "from-amber-400 to-yellow-500",
        },
      ],
    },
  ];

  // Current active story group & slide
  const activeGroup = storyGroups.find((g) => g.id === activeGroupId) || null;
  const activeSlide = activeGroup ? activeGroup.slides[activeSlideIdx] || activeGroup.slides[0] : null;

  // Auto Advance Progress Timer (5 seconds per slide)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!activeGroup || isPaused) return;

    setProgress(0);
    const interval = 50; // ms update
    const step = 100 / (5000 / interval);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeGroupId, activeSlideIdx, isPaused]);

  const handleNextSlide = () => {
    if (!activeGroup) return;
    if (activeSlideIdx < activeGroup.slides.length - 1) {
      setActiveSlideIdx((prev) => prev + 1);
    } else {
      // Finished all slides in current group! Find next unlocked group
      markStoryAsViewed(activeGroup.id);
      const currentIdx = storyGroups.findIndex((g) => g.id === activeGroup.id);
      const nextGroup = storyGroups.slice(currentIdx + 1).find((g) => !g.locked);
      if (nextGroup) {
        setActiveGroupId(nextGroup.id);
        setActiveSlideIdx(0);
      } else {
        // Close modal
        setActiveGroupId(null);
      }
    }
  };

  const handlePrevSlide = () => {
    if (!activeGroup) return;
    if (activeSlideIdx > 0) {
      setActiveSlideIdx((prev) => prev - 1);
    } else {
      const currentIdx = storyGroups.findIndex((g) => g.id === activeGroup.id);
      if (currentIdx > 0) {
        const prevGroup = storyGroups[currentIdx - 1];
        if (!prevGroup.locked) {
          setActiveGroupId(prevGroup.id);
          setActiveSlideIdx(prevGroup.slides.length - 1);
        }
      }
    }
  };

  const openGroup = (group: StoryGroup) => {
    if (group.locked) {
      if (group.id === "partner_progress") {
        window.location.href = "/profile";
      }
      return;
    }
    setActiveGroupId(group.id);
    setActiveSlideIdx(0);
    markStoryAsViewed(group.id);
  };

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STORIES BUBBLES SCROLLABLE BAR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="space-y-2">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {storyGroups.map((group) => {
            const isViewed = viewedStories[group.id];

            return (
              <button
                key={group.id}
                onClick={() => openGroup(group)}
                disabled={group.locked && group.id !== "partner_progress"}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              >
                {/* Bubble Ring */}
                <div
                  className={cn(
                    "p-0.5 rounded-full transition-transform duration-200 group-hover:scale-105 relative",
                    group.locked
                      ? "opacity-40 grayscale"
                      : isViewed
                      ? "border-2 border-[#27272a]"
                      : "bg-gradient-to-tr from-[#FF6B00] via-[#FFAA00] to-pink-500 shadow-[0_0_12px_rgba(255,107,0,0.4)]"
                  )}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#09090b] p-0.5 flex items-center justify-center overflow-hidden relative">
                    {group.avatarUrl ? (
                      <img
                        src={group.avatarUrl}
                        alt={group.title}
                        className="w-full h-full rounded-full object-cover shadow-inner"
                      />
                    ) : (
                      <div className={cn("w-full h-full rounded-full flex items-center justify-center font-display font-black text-sm text-white shadow-inner", group.avatarBg)}>
                        {group.id === "partner_progress" && !isPartnerConnected ? (
                          <Lock size={18} weight="bold" />
                        ) : (
                          group.avatarText
                        )}
                      </div>
                    )}

                    {group.locked && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white backdrop-blur-[1px]">
                        <Lock size={16} weight="bold" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <span className={cn("font-body text-[11px] font-bold tracking-tight truncate max-w-[68px] text-center", isViewed ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>
                  {group.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FULL SCREEN INSTAGRAM STORY VIEWER MODAL
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {activeGroup && activeSlide && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center sm:p-4 backdrop-blur-md select-none"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Story Card Container */}
            <div className="relative w-full h-full sm:max-w-md sm:h-[850px] sm:rounded-3xl overflow-hidden bg-[#09090b] flex flex-col justify-between shadow-2xl border border-[#27272a]">
              
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={activeSlide.bgImage}
                  alt={activeSlide.title}
                  className={cn(
                    "w-full h-full object-cover scale-105 transition-all duration-700",
                    activeSlide.isPhotoSlide
                      ? "brightness-100 contrast-100"   // full-quality for real photos
                      : "brightness-50 contrast-125"    // darkened for editorial slides
                  )}
                />
                {activeSlide.isPhotoSlide ? (
                  // Photo slide: subtle gradient only at bottom for text legibility
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95" />
                )}
              </div>

              {/* Top Controls Header (z-50 to ensure close button handles clicks cleanly) */}
              <div className="relative z-50 pt-4 px-4 space-y-3 pointer-events-auto">
                {/* Segmented Progress Bars */}
                <div className="flex items-center gap-1.5">
                  {activeGroup.slides.map((slide, i) => {
                    let slideProgress = 0;
                    if (i < activeSlideIdx) slideProgress = 100;
                    else if (i === activeSlideIdx) slideProgress = progress;

                    return (
                      <div key={slide.id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-white transition-all duration-75" style={{ width: `${slideProgress}%` }} />
                      </div>
                    );
                  })}
                </div>

                {/* Author / Tag Header & Close Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {activeGroup.avatarUrl ? (
                      <img
                        src={activeGroup.avatarUrl}
                        alt={activeGroup.title}
                        className="w-9 h-9 rounded-full object-cover shadow-md border border-white/20"
                      />
                    ) : (
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-xs text-white shadow-md border border-white/20", activeGroup.avatarBg)}>
                        {activeGroup.avatarText}
                      </div>
                    )}
                    <div>
                      <h4 className="font-display text-sm font-black text-white leading-none">{activeGroup.title}</h4>
                      <p className="font-body text-[10px] text-white/70 mt-0.5">D100 Course Story</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveGroupId(null);
                    }}
                    className="w-9 h-9 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer z-50"
                  >
                    <X size={18} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Center Content — branches on photo vs editorial */}
              {activeSlide.isPhotoSlide ? (
                /* ── PHOTO SLIDE: big day number typography pinned to bottom ── */
                <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 px-6 flex flex-col items-start gap-1 pointer-events-none">
                  {activeSlide.photoDay && (
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-display font-black text-white leading-none drop-shadow-2xl"
                        style={{ fontSize: "clamp(72px, 22vw, 120px)", letterSpacing: "-0.04em", textShadow: "0 4px 32px rgba(0,0,0,0.8)" }}
                      >
                        {activeSlide.photoDay}
                      </span>
                      <div className="flex flex-col pb-3">
                        <span className="font-display font-black text-white/60 text-lg uppercase tracking-widest leading-none">DAY</span>
                        <span className="font-display font-black text-white/40 text-sm uppercase tracking-widest leading-none">/ 100</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    {activeSlide.photoDate && (
                      <span className="font-display text-xs font-black uppercase tracking-widest text-white/80 bg-black/50 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                        {activeSlide.photoDate}
                      </span>
                    )}
                    <span className={cn("font-display text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md", activeSlide.tagColor)}>
                      PROFILE {activeProfile}
                    </span>
                  </div>
                </div>

              ) : (
                /* ── EDITORIAL SLIDE: typographic poster layout ── */
                <div className="relative z-20 px-6 my-auto space-y-6 text-center py-6">
                  <span className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest font-black border backdrop-blur-md", activeSlide.tagColor)}>
                    {activeSlide.tag}
                  </span>

                  <h2 className="font-display text-4xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none drop-shadow-lg">
                    {activeSlide.title}
                  </h2>

                  {activeSlide.quote && (
                    <div className="space-y-2 max-w-xs mx-auto">
                      <p className="font-body text-base font-bold text-white/90 italic leading-relaxed">
                        &ldquo;{activeSlide.quote}&rdquo;
                      </p>
                      {activeSlide.author && (
                        <p className="font-display text-xs text-[#FF6B00] uppercase tracking-wider font-black">
                          — {activeSlide.author}
                        </p>
                      )}
                    </div>
                  )}

                  {activeSlide.keyPoints && (
                    <div className="space-y-3 text-left max-w-xs mx-auto">
                      {activeSlide.keyPoints.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
                          <div className="p-2 rounded-xl bg-white/10 text-white shrink-0 mt-0.5">
                            <pt.icon size={18} weight="bold" />
                          </div>
                          <div>
                            <p className="font-display text-xs font-black text-white uppercase tracking-wider">{pt.title}</p>
                            <p className="font-body text-[11px] text-white/80 leading-tight mt-0.5">{pt.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Click Touch Target Zones below header */}
              <div className="absolute top-20 bottom-0 left-0 w-2/5 z-30 cursor-pointer" onClick={handlePrevSlide} />
              <div className="absolute top-20 bottom-0 right-0 w-3/5 z-30 cursor-pointer" onClick={handleNextSlide} />

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
