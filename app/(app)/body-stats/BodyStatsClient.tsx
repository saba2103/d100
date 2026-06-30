"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, ArrowUp, ArrowDown, ArrowRight, TrendUp } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { TimelineCalendar } from "@/components/ui/TimelineCalendar";

interface Measurement {
  id: string;
  measured_at: string;
  source: string;
  weight_kg: number | null;
  standard_weight_kg: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  body_fat_kg: number | null;
  lean_mass_kg: number | null;
  heart_rate_bpm: number | null;
  health_score: number | null;
  total_body_water_kg: number | null;
  weight_control_kg: number | null;
  bone_mass_kg: number | null;
  skeletal_muscle_mass_kg: number | null;
  skeletal_muscle_pct: number | null;
  subcutaneous_fat_pct: number | null;
  subcutaneous_fat_kg: number | null;
  visceral_fat_level: number | null;
  trunk_fat_mass_kg: number | null;
  trunk_fat_ratio_pct: number | null;
  body_water_pct: number | null;
  protein_pct: number | null;
  recommended_calorie_intake_kcal: number | null;
  bmr_kcal: number | null;
  metabolic_age: number | null;
  waist_hip_ratio: number | null;
  intracellular_water_kg: number | null;
  extracellular_water_kg: number | null;
  protein_mass_kg: number | null;
  mineral_mass_kg: number | null;
  left_arm_fat_ratio_pct: number | null;
  right_arm_fat_ratio_pct: number | null;
  left_arm_fat_mass_kg: number | null;
  right_arm_fat_mass_kg: number | null;
  left_arm_muscle_ratio_pct: number | null;
  right_arm_muscle_ratio_pct: number | null;
  left_arm_muscle_mass_kg: number | null;
  right_arm_muscle_mass_kg: number | null;
  left_leg_fat_ratio_pct: number | null;
  right_leg_fat_ratio_pct: number | null;
  left_leg_fat_mass_kg: number | null;
  right_leg_fat_mass_kg: number | null;
  left_leg_muscle_ratio_pct: number | null;
  right_leg_muscle_ratio_pct: number | null;
  left_leg_muscle_mass_kg: number | null;
  right_leg_muscle_mass_kg: number | null;
  flags: any;
}

interface Props {
  userId: string;
  today: string;
  programStartDate: string | null;
  measurements: Measurement[];
}

const STATUS_COLORS: Record<string, string> = {
  Standard: "text-[var(--green)] bg-[var(--green-soft)]",
  Normal: "text-[var(--green)] bg-[var(--green-soft)]",
  Low: "text-[var(--blue)] bg-[rgba(59,130,246,0.12)]",
  High: "text-[var(--red)] bg-[rgba(239,68,68,0.12)]",
};

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const cls = STATUS_COLORS[status] ?? "text-[var(--text-muted)] bg-[#18181b]";
  
  const renderIcon = () => {
    const s = status.toLowerCase();
    if (s === "standard" || s === "normal") {
      return <Check size={10} weight="bold" className="shrink-0" />;
    }
    if (s === "high") {
      return <ArrowUp size={10} weight="bold" className="shrink-0" />;
    }
    if (s === "low") {
      return <ArrowDown size={10} weight="bold" className="shrink-0" />;
    }
    return null;
  };

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-body-bold uppercase tracking-wider w-max border-none", cls)}>
      {renderIcon()}
      {status}
    </span>
  );
}

function StatPill({ label, value, unit, flag }: {
  label: string; value: number | null; unit?: string; flag?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
      <span className="font-body text-[10px] text-[var(--text-muted)] uppercase tracking-wider leading-none">
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="font-display text-xl font-black text-[var(--text-primary)] leading-none">
          {value !== null ? value : "—"}
        </span>
        {unit && value !== null && (
          <span className="font-body text-[10px] text-[var(--text-muted)]">{unit}</span>
        )}
      </div>
      {flag && <StatusBadge status={flag} />}
    </div>
  );
}

export function BodyStatsClient({ userId, today, programStartDate, measurements }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(today);

  // Sorted measurements indexed by date for quick lookup
  const measurementsByDate = React.useMemo(() => {
    const map: Record<string, Measurement> = {};
    measurements.forEach((m) => { map[m.measured_at] = m; });
    return map;
  }, [measurements]);

  const latest = measurements[0];
  const selectedMeasurement = measurementsByDate[selectedDate] ?? (selectedDate === today ? latest : null);
  const displayMeasurement = selectedMeasurement;

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide">
            BODY STATS
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">Body composition tracker</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/body-stats/trends")}
            title="View Trend Graphs"
            className="p-2.5 rounded-xl border border-[#27272a] bg-[var(--bg-surface)] text-[var(--accent-text)] hover:bg-[var(--accent-start)]/10 hover:border-[var(--accent-start)]/30 transition-all flex items-center justify-center shadow-sm"
          >
            <TrendUp size={20} weight="bold" />
          </button>

          <Button size="sm" variant="primary" onClick={() => router.push(`/body-stats/log${selectedDate !== today ? `?date=${selectedDate}` : ``}`)}
          >
            <Plus size={16} weight="bold" /> Log
          </Button>
        </div>
      </div>

      {/* Timeline Calendar */}
      <TimelineCalendar
        selectedDate={selectedDate}
        today={today}
        programStartDate={programStartDate}
        onSelectDate={setSelectedDate}
        hasDataOnDate={(d) => !!measurementsByDate[d]}
      />

      {/* Current Stats card */}
      {displayMeasurement ? (
        <Card variant="surface" className="p-5 space-y-4 border-[#27272a]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {selectedDate === today ? "Latest Measurement" : "Measurement"}
              </p>
              <p className="font-body-bold text-sm text-[var(--text-primary)] mt-0.5">
                {(() => {
                  const [y, m, d] = displayMeasurement.measured_at.split("-").map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
                    weekday: "short", month: "long", day: "numeric", year: "numeric",
                  });
                })()}
              </p>
            </div>
            <span className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-body-bold border border-[#27272a]",
              displayMeasurement.source === "cult_scale"
                ? "text-[var(--accent-text)] bg-[rgba(249,115,22,0.12)]"
                : "text-[var(--text-muted)] bg-[#18181b]"
            )}>
              {displayMeasurement.source === "cult_scale" ? "⚖️ Cult Scale" : "✏️ Manual"}
            </span>
          </div>

          {/* Essentials */}
          <div className="space-y-1.5">
            <p className="font-body-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Essentials</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <StatPill label="Weight" value={displayMeasurement.weight_kg} unit="kg" flag={displayMeasurement.flags?.weight} />
              <StatPill label="Std Weight" value={displayMeasurement.standard_weight_kg} unit="kg" />
              <StatPill label="BMI" value={displayMeasurement.bmi} flag={displayMeasurement.flags?.bmi} />
              <StatPill label="Body Fat" value={displayMeasurement.body_fat_pct} unit="%" flag={displayMeasurement.flags?.body_fat} />
              <StatPill label="Lean Mass" value={displayMeasurement.lean_mass_kg} unit="kg" flag={displayMeasurement.flags?.lean_mass} />
              <StatPill label="Bone Mass" value={displayMeasurement.bone_mass_kg} unit="kg" flag={displayMeasurement.flags?.bone_mass} />
              <StatPill label="Heart Rate" value={displayMeasurement.heart_rate_bpm} unit="bpm" />
              <StatPill label="Health Score" value={displayMeasurement.health_score} unit="/100" />
              <StatPill label="Total Water" value={displayMeasurement.total_body_water_kg} unit="kg" />
              <StatPill label="Wt Control" value={displayMeasurement.weight_control_kg} unit="kg" />
            </div>
          </div>

          {/* Bone & Muscle */}
          <div className="space-y-1.5">
            <p className="font-body-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Bone &amp; Muscle</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <StatPill label="Muscle Mass" value={displayMeasurement.skeletal_muscle_mass_kg} unit="kg" flag={displayMeasurement.flags?.skeletal_muscle} />
              <StatPill label="Muscle %" value={displayMeasurement.skeletal_muscle_pct} unit="%" />
            </div>
          </div>

          {/* Fat & Composition */}
          <div className="space-y-1.5">
            <p className="font-body-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Fat &amp; Composition</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <StatPill label="Subcut Fat" value={displayMeasurement.subcutaneous_fat_pct} unit="%" flag={displayMeasurement.flags?.subcutaneous_fat} />
              <StatPill label="Subcut Fat" value={displayMeasurement.subcutaneous_fat_kg} unit="kg" />
              <StatPill label="Visceral Fat" value={displayMeasurement.visceral_fat_level} flag={displayMeasurement.flags?.visceral_fat} />
              <StatPill label="Trunk Fat" value={displayMeasurement.trunk_fat_mass_kg} unit="kg" />
              <StatPill label="Trunk Fat " value={displayMeasurement.trunk_fat_ratio_pct} unit="%" />
              <StatPill label="Body Water" value={displayMeasurement.body_water_pct} unit="%" flag={displayMeasurement.flags?.body_water} />
              <StatPill label="Protein" value={displayMeasurement.protein_pct} unit="%" flag={displayMeasurement.flags?.protein} />
              <StatPill label="Rec. Cal" value={displayMeasurement.recommended_calorie_intake_kcal} unit="kcal" />
            </div>
          </div>

          {/* Metabolic */}
          <div className="space-y-1.5">
            <p className="font-body-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Metabolic</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <StatPill label="BMR" value={displayMeasurement.bmr_kcal} unit="kcal" flag={displayMeasurement.flags?.bmr} />
              <StatPill label="Met. Age" value={displayMeasurement.metabolic_age} unit="yrs" flag={displayMeasurement.flags?.metabolic_age} />
            </div>
          </div>

          {/* More */}
          <div className="space-y-1.5">
            <p className="font-body-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">More</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <StatPill label="Waist/Hip" value={displayMeasurement.waist_hip_ratio} />
              <StatPill label="Intracel. H₂O" value={displayMeasurement.intracellular_water_kg} unit="kg" />
              <StatPill label="Extracel. H₂O" value={displayMeasurement.extracellular_water_kg} unit="kg" />
              <StatPill label="Protein Mass" value={displayMeasurement.protein_mass_kg} unit="kg" />
              <StatPill label="Mineral Mass" value={displayMeasurement.mineral_mass_kg} unit="kg" />
            </div>
          </div>

          {/* Segmental — Arms */}
          <div className="space-y-1.5">
            <p className="font-body-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Segmental — Arms</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <StatPill label="L-Arm Fat %" value={displayMeasurement.left_arm_fat_ratio_pct} unit="%" />
              <StatPill label="R-Arm Fat %" value={displayMeasurement.right_arm_fat_ratio_pct} unit="%" />
              <StatPill label="L-Arm Fat" value={displayMeasurement.left_arm_fat_mass_kg} unit="kg" />
              <StatPill label="R-Arm Fat" value={displayMeasurement.right_arm_fat_mass_kg} unit="kg" />
              <StatPill label="L-Arm Muscle %" value={displayMeasurement.left_arm_muscle_ratio_pct} unit="%" />
              <StatPill label="R-Arm Muscle %" value={displayMeasurement.right_arm_muscle_ratio_pct} unit="%" />
              <StatPill label="L-Arm Muscle" value={displayMeasurement.left_arm_muscle_mass_kg} unit="kg" />
              <StatPill label="R-Arm Muscle" value={displayMeasurement.right_arm_muscle_mass_kg} unit="kg" />
            </div>
          </div>

          {/* Segmental — Legs */}
          <div className="space-y-1.5">
            <p className="font-body-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Segmental — Legs</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <StatPill label="L-Leg Fat %" value={displayMeasurement.left_leg_fat_ratio_pct} unit="%" />
              <StatPill label="R-Leg Fat %" value={displayMeasurement.right_leg_fat_ratio_pct} unit="%" />
              <StatPill label="L-Leg Fat" value={displayMeasurement.left_leg_fat_mass_kg} unit="kg" />
              <StatPill label="R-Leg Fat" value={displayMeasurement.right_leg_fat_mass_kg} unit="kg" />
              <StatPill label="L-Leg Muscle %" value={displayMeasurement.left_leg_muscle_ratio_pct} unit="%" />
              <StatPill label="R-Leg Muscle %" value={displayMeasurement.right_leg_muscle_ratio_pct} unit="%" />
              <StatPill label="L-Leg Muscle" value={displayMeasurement.left_leg_muscle_mass_kg} unit="kg" />
              <StatPill label="R-Leg Muscle" value={displayMeasurement.right_leg_muscle_mass_kg} unit="kg" />
            </div>
          </div>
        </Card>
      ) : (
        <Card variant="surface" className="p-8 text-center border-dashed border-[#27272a]">
          <p className="font-display text-xl text-[var(--text-primary)] font-black uppercase">
            {selectedDate === today ? "No Data Yet" : "No Data for this Day"}
          </p>
          <p className="font-body text-xs text-[var(--text-muted)] mt-2">
            {selectedDate === today
              ? "Log your first measurement to start tracking body composition."
              : "No measurement was logged on this day."}
          </p>
          <Button size="sm" variant="primary" className="mt-4 mx-auto"
            onClick={() => router.push(`/body-stats/log${selectedDate !== today ? `?date=${selectedDate}` : ``}`)}
          >
            {selectedDate === today ? "Log First Measurement" : "Log for this Day"}
          </Button>
        </Card>
      )}

      {/* History list */}
      {measurements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base tracking-wider text-[var(--text-muted)] uppercase">
              Measurement History
            </h2>
            <button
              onClick={() => router.push("/body-stats/trends")}
              className="text-xs font-body-bold text-[var(--accent-text)] hover:underline flex items-center gap-1"
            >
              <TrendUp size={14} /> View Analytics
            </button>
          </div>

          <div className="space-y-2">
            {measurements.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => router.push(`/body-stats/${m.id}`)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl border border-[#27272a] bg-[var(--bg-surface)] hover:border-[var(--accent-start)]/40 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <p className="font-body-bold text-sm text-[var(--text-primary)]">
                    {(() => {
                      const [y, monthVal, d] = m.measured_at.split("-").map(Number);
                      return new Date(y, monthVal - 1, d).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      });
                    })()}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-body">
                    {m.weight_kg && <span>{m.weight_kg} kg</span>}
                    {m.body_fat_pct && <span>· {m.body_fat_pct}% fat</span>}
                    {m.skeletal_muscle_mass_kg && <span>· {m.skeletal_muscle_mass_kg} kg muscle</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-body-bold border border-[#27272a]",
                    m.source === "cult_scale"
                      ? "text-[var(--accent-text)] bg-[rgba(249,115,22,0.12)]"
                      : "text-[var(--text-muted)] bg-[#18181b]"
                  )}>
                    {m.source === "cult_scale" ? "Scale" : "Manual"}
                  </span>
                  <ArrowRight size={16} className="text-[var(--text-muted)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
