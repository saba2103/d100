"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShareNetwork,
  Check,
  Lock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { CourseLesson, ContentBlock } from "@/lib/course";

interface ArticleReaderClientProps {
  lesson: CourseLesson;
  initialArticle: any | null;
  nextLesson: CourseLesson | null;
}

export function ArticleReaderClient({
  lesson,
  initialArticle,
  nextLesson,
}: ArticleReaderClientProps) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("d100-read-articles");
    if (stored) {
      try {
        const list = JSON.parse(stored);
        setIsRead(list.includes(lesson.slug));
      } catch (e) {
        console.error(e);
      }
    }
  }, [lesson.slug]);

  const toggleRead = () => {
    const stored = localStorage.getItem("d100-read-articles");
    let list: string[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }

    if (list.includes(lesson.slug)) {
      list = list.filter((s) => s !== lesson.slug);
      setIsRead(false);
    } else {
      list.push(lesson.slug);
      setIsRead(true);
    }

    localStorage.setItem("d100-read-articles", JSON.stringify(list));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: lesson.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    }
  };

  const isLocked = !initialArticle || !initialArticle.published;
  const contentBlocks: ContentBlock[] = initialArticle?.content || [];

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-8">
      {/* Back Link */}
      <button
        onClick={() => router.push("/course")}
        className="flex items-center gap-1.5 text-xs font-body font-body-bold text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        Back to Course
      </button>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <span className="font-body font-body-bold text-xs text-[var(--accent-text)] uppercase tracking-widest flex items-center gap-1">
            {/[a-zA-Z]/.test(lesson.lesson_number) ? "📄 " : ""}LESSON {lesson.lesson_number}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-wide leading-none uppercase">
            {lesson.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-body text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1 bg-[var(--bg-surface)] border border-[#27272a] px-2.5 py-0.5 rounded-md text-[10px]">
            📋 Coach
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {/[a-zA-Z]/.test(lesson.lesson_number) ? "📄 Reference" : `${lesson.estimated_read_minutes} min read`}
          </span>
          {initialArticle?.created_at && (
            <span className="flex items-center gap-1 text-[var(--text-muted)]">
              <Calendar size={12} />
              {new Date(initialArticle.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-[var(--border)] via-[var(--border)] to-transparent" />
      </header>

      {/* Content Blocks */}
      <main className="space-y-6">
        {isLocked ? (
          /* Locked State View */
          <div className="py-16 px-6 border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/60 rounded-3xl text-center space-y-4 max-w-md mx-auto mt-6">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Lock size={22} weight="bold" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-black text-[var(--text-primary)] uppercase tracking-wider">
                Content Coming Soon
              </h3>
              <p className="font-body text-xs text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
                This lesson is currently locked and will be available once the content is published.
              </p>
            </div>
          </div>
        ) : (
          /* Rich Article Block Rendering */
          contentBlocks.map((block, index) => {
            switch (block.type) {
              case "heading":
                return (
                  <h2
                    key={index}
                    className="font-display text-2xl sm:text-3xl font-black text-[var(--text-primary)] uppercase tracking-wide mt-8 pt-4"
                  >
                    {block.text}
                  </h2>
                );
              case "subheading":
                return (
                  <h3
                    key={index}
                    className="font-display text-lg sm:text-xl font-black text-[var(--accent-text)] uppercase tracking-wider mt-6"
                  >
                    {block.text}
                  </h3>
                );
              case "paragraph":
                return (
                  <p
                    key={index}
                    className="font-body text-[14px] text-[var(--text-secondary)] leading-relaxed"
                  >
                    {block.text}
                  </p>
                );
              case "callout":
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-5 border-l-4 rounded-r-2xl my-4 space-y-1",
                      block.style === "warning"
                        ? "bg-[rgba(239,68,68,0.04)] border-[var(--red)]"
                        : block.style === "tip"
                        ? "bg-[rgba(16,185,129,0.04)] border-[var(--green)]"
                        : "bg-[var(--accent-start)]/5 border-[var(--accent-start)]"
                    )}
                  >
                    {block.title && (
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        {block.title}
                      </h4>
                    )}
                    <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                );
              case "list":
                const isNumbered = block.style === "number";
                return isNumbered ? (
                  <ol
                    key={index}
                    className="list-decimal list-inside space-y-2.5 my-4 font-body text-[14px] text-[var(--text-secondary)] leading-relaxed pl-2"
                  >
                    {block.items?.map((item, idx) => (
                      <li key={idx} className="pl-1">
                        {item}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul
                    key={index}
                    className="list-disc list-inside space-y-2.5 my-4 font-body text-[14px] text-[var(--text-secondary)] leading-relaxed pl-2"
                  >
                    {block.items?.map((item, idx) => (
                      <li key={idx} className="pl-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              case "metric_card":
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] my-4 shadow-sm"
                  >
                    <div className="p-3 rounded-xl bg-[var(--accent-start)]/10 text-[var(--accent-text)] flex items-center justify-center">
                      {block.icon === "calendar" ? (
                        <Calendar size={24} weight="bold" />
                      ) : (
                        <Clock size={24} weight="bold" />
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">
                        {block.label}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl font-black text-[var(--text-primary)] leading-none">
                          {block.value}
                        </span>
                        <span className="font-body text-xs text-[var(--text-secondary)]">
                          {block.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              case "divider":
                return (
                  <div
                    key={index}
                    className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-8"
                  />
                );
              case "quote":
                return (
                  <blockquote
                    key={index}
                    className="border-l-4 border-[var(--accent-start)] pl-5 my-8 italic font-body text-base text-[var(--text-primary)] leading-relaxed bg-[var(--bg-surface)]/20 py-1"
                  >
                    "{block.text}"
                  </blockquote>
                );
              case "image":
                return (
                  <div key={index} className="my-6 space-y-2">
                    <img
                      src={block.url}
                      alt={block.caption || "Illustration"}
                      className="w-full rounded-2xl border border-[var(--border)] object-cover"
                    />
                    {block.caption && (
                      <p className="text-center font-body text-[10px] text-[var(--text-muted)] italic">
                        {block.caption}
                      </p>
                    )}
                  </div>
                );
              case "phase_tag":
                return (
                  <span
                    key={index}
                    className="inline-block px-2.5 py-0.5 text-[9px] font-body-bold bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] rounded-md"
                  >
                    {block.text || "📋 Coach"}
                  </span>
                );
              default:
                return null;
            }
          })
        )}
      </main>

      <div className="h-px bg-[var(--border)] my-8" />

      {/* Footer Controls */}
      <footer className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Mark As Read */}
          <Button
            variant={isRead ? "secondary" : "primary"}
            onClick={toggleRead}
            className="flex items-center justify-center gap-2 uppercase font-display tracking-wider text-xs px-6 py-3"
          >
            {isRead ? (
              <>
                <Check size={14} weight="bold" className="text-[var(--green)]" />
                Completed
              </>
            ) : (
              "Mark as Read"
            )}
          </Button>

          {/* Share button */}
          <Button
            variant="ghost"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 text-xs font-display uppercase tracking-wider py-3 border border-[var(--border)]"
          >
            <ShareNetwork size={14} />
            Share Lesson
          </Button>
        </div>

        {/* Next Lesson Router */}
        {nextLesson && (
          <div
            onClick={() => router.push(`/course/${nextLesson.slug}`)}
            className="group flex items-center justify-between p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--accent-start)]/40 bg-[var(--bg-surface)] hover:shadow-md cursor-pointer transition-all duration-200"
          >
            <div className="space-y-1">
              <span className="block text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                Next Lesson
              </span>
              <span className="block font-display text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors uppercase leading-none">
                {nextLesson.title}
              </span>
            </div>
            <div className="p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] group-hover:bg-[var(--accent-start)]/10 group-hover:border-[var(--accent-start)]/20 transition-colors text-[var(--text-muted)] group-hover:text-[var(--accent-text)]">
              <ArrowRight size={16} weight="bold" />
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
