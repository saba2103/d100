"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Robot, ArrowClockwise, Warning, Gear } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface AIInsightCardProps {
  userId: string;
  profileId: "S" | "P";
  initialInsight: string | null;
  initialGeneratedAt: string | null;
  hasApiKey: boolean;
  className?: string;
  onGenerated?: (insight: string, generatedAt: string) => void;
}

export function AIInsightCard({
  userId,
  profileId,
  initialInsight,
  initialGeneratedAt,
  hasApiKey,
  className,
  onGenerated,
}: AIInsightCardProps) {
  const router = useRouter();
  const [insight, setInsight] = useState<string | null>(initialInsight);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        ) : insight ? (
          /* Display Insight */
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border)]">
              <p className="font-display text-[13px] leading-relaxed text-[var(--text-secondary)] font-medium">
                {insight}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-body text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                {getRelativeTime(generatedAt)}
              </span>

              {isStale && (
                <div className="flex items-center gap-1 text-[var(--amber)] bg-[var(--amber)]/5 border border-[var(--amber)]/10 px-2 py-0.5 rounded-lg text-[9px] font-body uppercase font-bold tracking-wider animate-pulse">
                  <Warning size={10} />
                  Refresh for latest
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State / Initial Trigger */
          <div className="py-6 text-center space-y-3.5">
            <p className="font-body text-xs text-[var(--text-muted)]">
              Press generate to scan your logs and create a personalized transformation insight.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={handleGenerate}
              className="uppercase font-display tracking-wider text-xs px-6 py-2"
            >
              Generate Coaching Insight
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
