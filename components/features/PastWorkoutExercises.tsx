"use client";

import React, { useState } from "react";
import { Play } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { WORKOUT_VIDEO_MAPPING } from "@/lib/workoutVideos";
import { VideoPlayerModal } from "@/components/features/VideoPlayerModal";

interface PastWorkoutExercisesProps {
  exercises: any[];
}

export function PastWorkoutExercises({ exercises }: PastWorkoutExercisesProps) {
  // Video Demo Player Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState("");

  const handlePlayDemo = (exerciseName: string) => {
    const url = WORKOUT_VIDEO_MAPPING[exerciseName];
    if (url) {
      setSelectedVideoUrl(url);
      setSelectedExerciseName(exerciseName);
      setVideoModalOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-base tracking-wider text-[var(--text-muted)] uppercase">
        Exercises & Sets
      </h2>

      {exercises.map((ex, exIdx) => (
        <Card key={exIdx} variant="surface" className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-black text-[var(--text-primary)]">
                {ex.name}
              </h3>
              {WORKOUT_VIDEO_MAPPING[ex.name] && (
                <button
                  onClick={() => handlePlayDemo(ex.name)}
                  className="px-2 py-0.5 rounded-lg bg-[rgba(249,115,22,0.1)] hover:bg-[rgba(249,115,22,0.2)] text-[var(--accent-text)] flex items-center gap-1 font-body text-[9px] uppercase font-bold tracking-wider transition-all duration-150"
                >
                  <Play size={8} weight="fill" /> Demo
                </button>
              )}
            </div>
            <span className="font-body text-xs text-[var(--text-muted)]">
              {ex.sets?.length || 0} sets
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {(ex.sets || []).map((set: any, setIdx: number) => {
              const isPlank = ex.name.toLowerCase().includes("plank");
              const isCardio = ex.name.toLowerCase().includes("cardio");
              return (
                <div
                  key={setIdx}
                  className="grid grid-cols-12 gap-3 items-center py-2.5 px-4 rounded-xl bg-[var(--bg-base)] text-xs font-body"
                >
                  {/* Set Title */}
                  <span className="col-span-3 text-[var(--text-secondary)] font-body-bold">
                    Set {setIdx + 1}
                  </span>

                  {/* Metric 1: Reps / Secs / Mins */}
                  <div className="col-span-3 text-center">
                    <span className="font-display font-black text-sm text-[var(--text-primary)]">
                      {set.reps || "0"}
                    </span>
                    <span className="text-[var(--text-muted)] text-[9px] uppercase font-bold tracking-wider ml-1">
                      {isPlank ? "sec" : isCardio ? "min" : "rep"}
                    </span>
                  </div>

                  {/* Metric 2: Weight / Secs / Mins */}
                  <div className="col-span-3 text-center">
                    <span className="font-display font-black text-sm text-[var(--text-primary)]">
                      {set.weight_kg || "0"}
                    </span>
                    <span className="text-[var(--text-muted)] text-[9px] uppercase font-bold tracking-wider ml-1">
                      {isPlank ? "sec" : isCardio ? "min" : "kg"}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-3 text-right">
                    {set.completed ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--green-soft)] text-[var(--green)] font-body-bold text-[9px] uppercase tracking-wider">
                        Done
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--red-soft)] text-[var(--red)] font-body-bold text-[9px] uppercase tracking-wider">
                        Missed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <VideoPlayerModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={selectedVideoUrl}
        exerciseName={selectedExerciseName}
      />
    </div>
  );
}
