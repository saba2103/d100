"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Lock, BookOpen, CheckCircle, GraduationCap } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";
import type { CoursePhase } from "@/lib/course";

interface CourseClientProps {
  phases: CoursePhase[];
  publishedSlugs: string[];
}

export function CourseClient({ phases, publishedSlugs }: CourseClientProps) {
  const router = useRouter();
  const [activePhaseId, setActivePhaseId] = useState<number>(1);
  const [readSlugs, setReadSlugs] = useState<string[]>([]);

  // Load read articles state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("d100-read-articles");
    if (stored) {
      try {
        setReadSlugs(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const activePhase = phases.find((p) => p.id === activePhaseId);

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide uppercase">
          COURSE
        </h1>
        <p className="font-body text-xs font-body-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
          Phase-gated education & guides
        </p>
      </div>

      {/* Phase Selector Tabs */}
      <div className="flex p-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl w-max gap-1">
        {phases.map((phase) => {
          const isActive = phase.id === activePhaseId;
          return (
            <button
              key={phase.id}
              onClick={() => {
                if (!phase.locked) {
                  setActivePhaseId(phase.id);
                }
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-sm uppercase tracking-wider transition-all duration-200",
                isActive
                  ? "bg-[var(--accent-start)] text-white shadow-lg shadow-[var(--accent-start)]/15 font-bold"
                  : phase.locked
                  ? "text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {phase.name}
              {phase.locked && <Lock size={13} className="shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Active Phase Article List */}
      {activePhase && (() => {
        const isReference = (num: string) => /[a-zA-Z]/.test(num);
        const videoLessons = activePhase.lessons.filter((l) => !isReference(l.lesson_number));
        const referenceLessons = activePhase.lessons.filter((l) => isReference(l.lesson_number));

        return (
          <div className="space-y-8">
            {/* Video Lessons */}
            {videoLessons.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                  <GraduationCap size={20} className="text-[var(--accent-text)]" />
                  <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] font-black uppercase">
                    VIDEO LESSONS
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoLessons.map((lesson) => {
                    const isPublished = publishedSlugs.includes(lesson.slug);
                    const isRead = readSlugs.includes(lesson.slug);

                    return (
                      <div
                        key={lesson.slug}
                        onClick={() => {
                          if (isPublished) {
                            router.push(`/course/${lesson.slug}`);
                          }
                        }}
                        className={cn(
                          "relative block rounded-3xl overflow-hidden transition-all duration-300 border",
                          isPublished
                            ? "cursor-pointer border-[var(--border)] hover:border-[var(--accent-start)]/40 hover:shadow-lg hover:-translate-y-0.5 bg-[var(--bg-surface)]"
                            : "border-[var(--border)]/50 bg-[var(--bg-surface)]/60 opacity-70"
                        )}
                      >
                        <Card variant="surface" className="p-6 h-full flex flex-col justify-between space-y-4 border-none bg-transparent">
                          {/* Top Row: Lesson Number & Attribution Badge */}
                          <div className="flex justify-between items-center">
                            <span className="px-2.5 py-0.5 text-[10px] font-display font-black bg-[var(--accent-start)]/10 text-[var(--accent-text)] border border-[var(--accent-start)]/15 rounded-full tracking-widest uppercase">
                              Lesson {lesson.lesson_number}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-body bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] rounded-md">
                                📋 Coach
                              </span>
                              {/* Progress Dot */}
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  isRead ? "bg-[var(--green)]" : "bg-[var(--text-muted)]/30"
                                )}
                                title={isRead ? "Completed" : "Unread"}
                              />
                            </div>
                          </div>

                          {/* Middle Row: Lesson Title */}
                          <div className="space-y-1">
                            <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase leading-tight tracking-wide">
                              {lesson.title}
                            </h3>
                            <p className="font-body text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                              <BookOpen size={12} />
                              {lesson.estimated_read_minutes} min read
                            </p>
                          </div>

                          {/* Locked Overlay for unpublished lessons */}
                          {!isPublished && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-3xl z-10 space-y-1">
                              <Lock size={20} className="text-[var(--text-muted)]" />
                              <span className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Coming soon
                              </span>
                            </div>
                          )}
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reference Sheets */}
            {referenceLessons.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                  <GraduationCap size={20} className="text-[var(--amber)]" />
                  <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] font-black uppercase">
                    REFERENCE SHEETS
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {referenceLessons.map((lesson) => {
                    const isPublished = publishedSlugs.includes(lesson.slug);
                    const isRead = readSlugs.includes(lesson.slug);

                    return (
                      <div
                        key={lesson.slug}
                        onClick={() => {
                          if (isPublished) {
                            router.push(`/course/${lesson.slug}`);
                          }
                        }}
                        className={cn(
                          "relative block rounded-3xl overflow-hidden transition-all duration-300 border",
                          isPublished
                            ? "cursor-pointer border-[var(--border)] hover:border-[rgba(245,158,11,0.4)] hover:shadow-lg hover:-translate-y-0.5 bg-[var(--bg-surface)]"
                            : "border-[var(--border)]/50 bg-[var(--bg-surface)]/60 opacity-70"
                        )}
                      >
                        <Card variant="surface" className="p-6 h-full flex flex-col justify-between space-y-4 border-none bg-transparent">
                          {/* Top Row: Lesson Number & Attribution Badge */}
                          <div className="flex justify-between items-center">
                            <span className="px-2.5 py-0.5 text-[10px] font-display font-black bg-[var(--amber-soft)] text-[var(--amber)] border border-[rgba(245,158,11,0.2)] rounded-full tracking-widest uppercase flex items-center gap-1">
                              📄 Lesson {lesson.lesson_number}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-body bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] rounded-md">
                                📋 Coach
                              </span>
                              {/* Progress Dot */}
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  isRead ? "bg-[var(--green)]" : "bg-[var(--text-muted)]/30"
                                )}
                                title={isRead ? "Completed" : "Unread"}
                              />
                            </div>
                          </div>

                          {/* Middle Row: Lesson Title */}
                          <div className="space-y-1">
                            <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase leading-tight tracking-wide">
                              {lesson.title}
                            </h3>
                            <p className="font-body text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                              <BookOpen size={12} />
                              📄 Reference
                            </p>
                          </div>

                          {/* Locked Overlay for unpublished lessons */}
                          {!isPublished && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-3xl z-10 space-y-1">
                              <Lock size={20} className="text-[var(--text-muted)]" />
                              <span className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Coming soon
                              </span>
                            </div>
                          )}
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
