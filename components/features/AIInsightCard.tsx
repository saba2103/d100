"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Robot, ArrowClockwise, Warning, Gear, Barbell, Fire, Drop, Pill, CheckCircle, XCircle, Target } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface AIInsightCardProps {
  userId: string;
  profileId: "S" | "P";
  initialInsight: string | null;
  initialGeneratedAt: string | null;
  hasApiKey: boolean;
  today: string;
  dayNumber: number;
  className?: string;
  onGenerated?: (insight: string, generatedAt: string) => void;
}

const FOCUS_ICONS: Record<string, any> = {
  workout: Barbell,
  nutrition: Fire,
  hydration: Drop,
  supplements: Pill,
};

const FOCUS_LABELS: Record<string, string> = {
  workout: "Workout",
  nutrition: "Nutrition",
  hydration: "Hydration",
  supplements: "Supplements",
};

export function AIInsightCard({
  userId,
  profileId,
  initialInsight,
  initialGeneratedAt,
  hasApiKey,
  today,
  dayNumber,
  className,
  onGenerated,
}: AIInsightCardProps) {
  const router = useRouter();
  const [insight, setInsight] = useState<string | null>(initialInsight);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse insight JSON matching selected day
  const parsedInsight = useMemo(() => {
    if (!insight) return null;
    try {
      const parsed = JSON.parse(insight);
      // Validate it has structural attributes and is for this date
      if (parsed && parsed.date === today) {
        return parsed;
      }
      return null;
    } catch {
      // Fallback: if it's raw text (old format), we do not parse it as daily card summary
      return null;
    }
  }, [insight, today]);

  // Sync state if initial props change
  useEffect(() => {
    setInsight(initialInsight);
    setGeneratedAt(initialGeneratedAt);
    setErrorMsg(null);
  }, [initialInsight, initialGeneratedAt]);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, profileId, timeframe: "7d" }),
      });

      const data = await res.json();

      if (res.ok) {
        setInsight(data.insight);
        setGeneratedAt(data.generatedAt);
        if (onGenerated) {
          onGenerated(data.insight, data.generatedAt);
        }
      } else {
        // Handle specific rate limits and error states
        if (res.status === 429) {
          setErrorMsg("Daily limit reached. Come back tomorrow.");
        } else if (data.error && data.error.includes("Settings")) {
          setErrorMsg("Add your AI API key in Settings to enable AI insights");
        } else {
          setErrorMsg("Couldn't generate insight right now. Try again later.");
        }
      }
    } catch (err) {
      console.error("AI Insight client generate error:", err);
      setErrorMsg("Couldn't generate insight right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get formatted relative time
  const getRelativeTime = (isoString: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `Generated ${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `Generated ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `Generated on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  // Check if insight is stale (> 24 hours)
  const isStale = (() => {
    if (!generatedAt) return false;
    const diffMs = new Date().getTime() - new Date(generatedAt).getTime();
    return diffMs > 24 * 60 * 60 * 1000;
  })();

  return (
    <Card variant="surface" className={cn("p-6 relative overflow-hidden select-none", className)}>
      {/* Decorative Robot Watermark */}
      <div className="absolute top-0 right-0 p-3 text-[var(--accent-start)]/10 pointer-events-none">
        <Robot size={64} weight="fill" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Robot size={22} className="text-[var(--accent-text)] animate-pulse" />
          <h3 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
            AI INSIGHT
          </h3>
        </div>

        {hasApiKey && insight && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 hover:bg-[var(--bg-base)] transition-all"
            title="Refresh Coach Advice"
          >
            <ArrowClockwise size={14} className={cn("transition-transform", loading && "animate-spin")} />
          </button>
        )}
      </div>

      {/* Content States */}
      <div className="space-y-4">
        {!hasApiKey ? (
          /* Lock State: No API Key */
          <div className="p-4 border border-[var(--red)]/20 rounded-2xl bg-[var(--bg-base)] text-center space-y-3">
            <Warning size={28} className="mx-auto text-[var(--red)]" />
            <div className="space-y-1">
              <h4 className="font-display font-black text-sm uppercase text-[var(--text-primary)]">
                AI Coach Locked
              </h4>
              <p className="font-body text-[10px] text-[var(--text-muted)] leading-relaxed">
                Add your OpenAI or Anthropic API key in Settings to unlock automated training reviews and key habits insights.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push("/settings")}
              className="flex items-center gap-1.5 mx-auto font-display text-[10px] uppercase tracking-wider py-1.5 px-3"
            >
              <Gear size={12} />
              Open Settings
            </Button>
          </div>
        ) : errorMsg ? (
          /* Error State */
          <div className="p-4 border border-[var(--red)]/20 rounded-2xl bg-[var(--bg-base)] text-center space-y-2">
            <p className="font-body text-xs text-[var(--text-primary)] font-bold">{errorMsg}</p>
            {errorMsg.includes("Settings") ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => router.push("/settings")}
                className="mt-2 text-[10px] py-1.5"
              >
                Go to Settings
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={handleGenerate} className="mt-2 text-[10px] py-1.5">
                Try Again
              </Button>
            )}
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-[var(--accent-start)]" />
            <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-widest animate-pulse">
              Analyzing daily logs...
            </p>
          </div>
        ) : parsedInsight ? (
          /* Structured Daily Summary rendering */
          <div className="space-y-4">
            {/* Headline */}
            <h4 className="font-display font-black text-white text-[13px] uppercase leading-tight tracking-wide">
              &ldquo;{parsedInsight.headline || "Today's Coaching Summary"}&rdquo;
            </h4>

            {/* Score card / badge */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border)]">
              <div className={cn(
                "px-3 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider",
                parsedInsight.overallScore >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                parsedInsight.overallScore >= 60 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-red-500/10 text-red-400 border border-red-500/20"
              )}>
                Score: {parsedInsight.overallScore}%
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Performance Label</p>
                <p className="font-display text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wide mt-0.5">
                  {parsedInsight.scoreLabel || "Solid Effort"}
                </p>
              </div>
            </div>

            {/* Focus Areas horizontal list/grid */}
            {parsedInsight.focusAreas && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(parsedInsight.focusAreas).map(([key, val]: [string, any]) => {
                  if (!val) return null;
                  const Icon = FOCUS_ICONS[key] || Target;
                  const isGood = val.status === "completed" || val.status === "on_track" || val.status === "hit" || val.status === "taken";
                  const isMid = val.status === "partial";
                  return (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-body",
                        isGood ? "bg-emerald-500/5 border-emerald-500/10" :
                        isMid ? "bg-amber-500/5 border-amber-500/10" :
                        "bg-[var(--bg-base)] border-[var(--border)]"
                      )}
                    >
                      <Icon size={12} className={isGood ? "text-emerald-400 shrink-0" : isMid ? "text-amber-400 shrink-0" : "text-zinc-500 shrink-0"} />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[8px] font-black uppercase text-[var(--text-muted)] leading-none">{FOCUS_LABELS[key]}</p>
                        <p className="font-body text-[9px] text-[var(--text-secondary)] truncate mt-0.5">{val.detail || val.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Coach Note callout block */}
            {parsedInsight.coachNote && (
              <div className="relative overflow-hidden rounded-2xl border border-[#FF6B00]/10 bg-gradient-to-br from-[#FF6B00]/5 to-[#FFAA00]/0 p-4">
                <p className="font-display text-[9px] font-black uppercase tracking-widest text-[#FF6B00]/70 mb-1">Coach Note</p>
                <p className="font-body text-xs text-white/80 leading-relaxed italic">&ldquo;{parsedInsight.coachNote}&rdquo;</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-1">
              <span className="font-body text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                {getRelativeTime(generatedAt)}
              </span>
            </div>
          </div>
        ) : (
          /* Empty / Not Generated State (placeholder) */
          <div className="py-4 text-center space-y-4 bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--accent-text)]">
              <Robot size={20} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Day {dayNumber} Summary Unprepared
              </h4>
              <p className="font-body text-[9px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
                Your daily coaching breakdown, habits score, and coach notes for today have not been generated yet.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => router.push(`/insights?generate=true&day=${dayNumber}`)}
              className="uppercase font-display font-black tracking-wider text-[10px] px-5 py-2"
            >
              Generate Daily Coach Summary
            </Button>
          </div>
        )}

        {/* Supplementary Disclaimer */}
        <p className="font-body text-[8px] text-[var(--text-muted)] leading-tight text-center pt-2 border-t border-[var(--border)]/40">
          AI insights are for motivation only. Consult a fitness professional for medical advice.
        </p>
      </div>
    </Card>
  );
}
