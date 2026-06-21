"use client";

import React, { useState, useEffect } from "react";
import { AIInsightCard } from "@/components/features/AIInsightCard";
import { Card } from "@/components/ui/Card";
import { CalendarBlank, Robot, Clock, Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";

interface InsightItem {
  id: string;
  user_id: string;
  profile_tag: "S" | "A";
  insight: string;
  created_at: string;
}

interface InsightsClientProps {
  userId: string;
  profileId: "S" | "A";
  hasApiKey: boolean;
  initialHistory: InsightItem[];
}

export function InsightsClient({
  userId,
  profileId,
  hasApiKey,
  initialHistory,
}: InsightsClientProps) {
  const [history, setHistory] = useState<InsightItem[]>(initialHistory);
  const [autoGenerating, setAutoGenerating] = useState(false);

  // Latest insight is the first item in the history
  const latestInsight = history[0] || null;

  // Auto-generate on load if stale (>24h) or missing
  useEffect(() => {
    const checkAndAutoGenerate = async () => {
      if (!hasApiKey) return;

      const isStaleOrMissing = !latestInsight || 
        (new Date().getTime() - new Date(latestInsight.created_at).getTime()) > 24 * 60 * 60 * 1000;

      if (isStaleOrMissing) {
        setAutoGenerating(true);
        try {
          const res = await fetch("/api/insights/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, profileId, timeframe: "7d" }),
          });

          if (res.ok) {
            const newInsight = await res.json();
            // Prepend new insight to history
            const newItem: InsightItem = {
              id: Math.random().toString(), // temporary or fetched id
              user_id: userId,
              profile_tag: profileId,
              insight: newInsight.insight,
              created_at: newInsight.generatedAt,
            };
            setHistory((prev) => [newItem, ...prev]);
          }
        } catch (err) {
          console.error("Auto-generation of insight failed:", err);
        } finally {
          setAutoGenerating(false);
        }
      }
    };

    checkAndAutoGenerate();
  }, [hasApiKey, latestInsight, userId, profileId]);

  // Callback when user manually triggers generate inside AIInsightCard
  const handleNewInsightGenerated = (insightText: string, generatedAtStr: string) => {
    const newItem: InsightItem = {
      id: Math.random().toString(),
      user_id: userId,
      profile_tag: profileId,
      insight: insightText,
      created_at: generatedAtStr,
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide uppercase">
          AI INSIGHTS
        </h1>
        <p className="font-body text-xs font-body-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
          Review personalized coaching insights for Profile: {profileId}
        </p>
      </div>

      {/* Main Insight Card */}
      <div className="space-y-2">
        <h2 className="font-display text-sm tracking-widest text-[var(--text-muted)] uppercase">
          Current Insight
        </h2>
        {autoGenerating ? (
          <Card variant="surface" className="p-8 text-center flex flex-col items-center justify-center space-y-3 min-h-[160px]">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-[var(--accent-start)]" />
            <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-widest animate-pulse">
              Auto-generating fresh insight...
            </p>
          </Card>
        ) : (
          <AIInsightCard
            userId={userId}
            profileId={profileId}
            initialInsight={latestInsight?.insight || null}
            initialGeneratedAt={latestInsight?.created_at || null}
            hasApiKey={hasApiKey}
            onGenerated={handleNewInsightGenerated}
          />
        )}
      </div>

      {/* Insight History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Clock size={18} className="text-[var(--text-muted)]" />
          <h2 className="font-display text-md tracking-wider text-[var(--text-primary)] uppercase">
            Insight History
          </h2>
        </div>

        {history.length <= 1 ? (
          /* Empty History State */
          <div className="py-12 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-surface)]">
            <CalendarBlank size={28} className="mx-auto text-[var(--text-muted)]" />
            <p className="text-xs font-body text-[var(--text-secondary)] mt-2">No historical insights available</p>
            <p className="text-[10px] text-[var(--text-muted)] font-body mt-0.5">
              Insights generated over time will accumulate here.
            </p>
          </div>
        ) : (
          /* History List (skips the 1st one, which is currently displayed in the card above) */
          <div className="space-y-3">
            {history.slice(1).map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent-start)]/20 transition-all space-y-2.5"
              >
                <div className="flex justify-between items-center text-[10px] font-body text-[var(--text-muted)] uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <CalendarBlank size={12} />
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-body-bold text-[9px] bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded-lg">
                    Coach AI
                  </span>
                </div>
                <p className="font-display text-xs leading-relaxed text-[var(--text-secondary)]">
                  {item.insight}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
