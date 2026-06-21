import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Barbell,
  PencilSimple,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { date: string };
}): Promise<Metadata> {
  return {
    title: `Workout Log ${params.date} | D100`,
    description: `Detailed workout log for ${params.date}`,
  };
}

export default async function PastWorkoutPage({
  params,
}: {
  params: { date: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { date } = params;

  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("active_profile")
    .eq("user_id", user.id)
    .single();

  const activeProfile = settingsData?.active_profile || "S";

  // Retrieve workout logs for this date
  const { data: log, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("profile_tag", activeProfile)
    .eq("logged_at", date)
    .maybeSingle();

  if (error || !log) {
    // If no log exists for this date, show a simple fallback screen
    return (
      <div className="pb-24 pt-12 px-4 max-w-md mx-auto text-center space-y-4">
        <WarningSection date={date} />
      </div>
    );
  }

  const exercises = (log.exercises as any[]) || [];

  // Calculate Volume and Total Stats
  let totalVolume = 0;
  let totalSets = 0;
  let completedSets = 0;

  exercises.forEach((ex) => {
    if (ex.sets && Array.isArray(ex.sets)) {
      ex.sets.forEach((set: any) => {
        totalSets++;
        if (set.completed) {
          completedSets++;
        }
        const reps = Number(set.reps) || 0;
        const weight = Number(set.weight_kg) || 0;
        totalVolume += reps * weight;
      });
    }
  });

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/workout"
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-body font-body-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Workouts
        </Link>

        <Link href={`/workout/log?edit=true&date=${date}`}>
          <Button size="sm" variant="secondary">
            <PencilSimple size={14} className="mr-1" /> Edit Log
          </Button>
        </Link>
      </div>

      {/* Main Stats Summary Header */}
      <div className="space-y-2 select-none">
        <div className="flex items-center gap-1.5">
          <Calendar size={18} className="text-[var(--accent-text)]" />
          <span className="font-body font-body-bold text-xs uppercase tracking-widest text-[var(--accent-text)]">
            Past Session
          </span>
        </div>
        <h1 className="font-display text-3xl font-black text-[var(--text-primary)] tracking-tight">
          {exercises[0]?.name || "Strength Log"}
        </h1>
        <p className="font-body text-xs text-[var(--text-muted)]">
          {formattedDate}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Duration */}
        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="font-body text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Duration</span>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              {log.duration_minutes || "--"}
            </span>
            <span className="font-body text-xs text-[var(--text-muted)]">min</span>
          </div>
        </Card>

        {/* Exercises */}
        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="font-body text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Exercises</span>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              {exercises.length}
            </span>
            <span className="font-body text-xs text-[var(--text-muted)]">logged</span>
          </div>
        </Card>

        {/* Volume */}
        <Card variant="surface" className="p-4 flex flex-col justify-between">
          <span className="font-body text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Volume</span>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              {totalVolume.toLocaleString()}
            </span>
            <span className="font-body text-xs text-[var(--text-muted)]">kg</span>
          </div>
        </Card>
      </div>

      {/* Completion Trophy Card */}
      {completedSets === totalSets && totalSets > 0 && (
        <Card variant="surface" className="p-4 bg-gradient-to-r from-[rgba(16,185,129,0.06)] to-transparent border-[var(--green)]/20 flex items-center gap-3">
          <div className="p-2 bg-[var(--green-soft)] text-[var(--green)] rounded-xl shrink-0">
            <Trophy size={20} weight="fill" />
          </div>
          <div>
            <h4 className="font-body-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">Perfect Log</h4>
            <p className="font-body text-xs text-[var(--text-secondary)] mt-0.5">Every set completed and logged according to target metrics.</p>
          </div>
        </Card>
      )}

      {/* Exercises Set Details */}
      <div className="space-y-4">
        <h2 className="font-display text-base tracking-wider text-[var(--text-muted)] uppercase">
          Exercises & Sets
        </h2>

        {exercises.map((ex, exIdx) => (
          <Card key={exIdx} variant="surface" className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)]/50 pb-2">
              <h3 className="font-display text-base font-black text-[var(--text-primary)]">
                {ex.name}
              </h3>
              <span className="font-body text-xs text-[var(--text-muted)]">
                {ex.sets?.length || 0} sets
              </span>
            </div>

            <div className="space-y-2">
              {(ex.sets || []).map((set: any, setIdx: number) => (
                <div
                  key={setIdx}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[var(--bg-base)] text-xs font-body"
                >
                  <span className="text-[var(--text-secondary)] font-medium">
                    Set {setIdx + 1}
                  </span>

                  <div className="flex items-center gap-6">
                    <span className="text-[var(--text-primary)] font-body-bold">
                      {set.reps || "0"} <span className="text-[var(--text-muted)] font-normal font-body text-[10px]">reps</span>
                    </span>
                    <span className="text-[var(--text-primary)] font-body-bold">
                      {set.weight_kg || "0"} <span className="text-[var(--text-muted)] font-normal font-body text-[10px]">kg</span>
                    </span>
                    <span className="w-16 text-right">
                      {set.completed ? (
                        <span className="px-2 py-0.5 rounded bg-[var(--green-soft)] text-[var(--green)] font-body-bold text-[9px] uppercase">
                          Done
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[var(--border)] text-[var(--text-muted)] font-body-bold text-[9px] uppercase">
                          Missed
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}

function WarningSection({ date }: { date: string }) {
  return (
    <>
      <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full inline-block text-[var(--text-muted)]">
        <Barbell size={32} />
      </div>
      <div>
        <h3 className="font-display text-xl text-[var(--text-primary)] font-black uppercase">
          No Log Found
        </h3>
        <p className="font-body text-xs text-[var(--text-secondary)] mt-1">
          There are no workout logs registered for {date}.
        </p>
      </div>
      <Link href={`/workout/log?date=${date}`}>
        <Button size="sm" variant="primary" className="mt-2 mx-auto">
          Start Log for {date}
        </Button>
      </Link>
    </>
  );
}
