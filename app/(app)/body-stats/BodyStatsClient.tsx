"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpRight, ArrowDownRight, ArrowRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface Measurement {
  id: string;
  measured_at: string;
  source: string;
  weight_kg: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  body_fat_kg: number | null;
  lean_mass_kg: number | null;
  bone_mass_kg: number | null;
  skeletal_muscle_mass_kg: number | null;
  skeletal_muscle_pct: number | null;
  subcutaneous_fat_pct: number | null;
  visceral_fat_level: number | null;
  protein_pct: number | null;
  body_water_pct: number | null;
  bmr_kcal: number | null;
  metabolic_age: number | null;
  flags: any;
}

interface Props {
  userId: string;
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
  const cls = STATUS_COLORS[status] ?? "text-[var(--text-muted)] bg-[var(--bg-base)]";
  return (
    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-body-bold uppercase", cls)}>
      {status}
    </span>
  );
}

function StatPill({ label, value, unit, flag }: {
  label: string; value: number | null; unit?: string; flag?: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]">
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

// Custom recharts tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-body shadow-lg">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-body-bold">
          {p.name}: {p.value} {p.name === "Weight" ? "kg" : "%"}
        </p>
      ))}
    </div>
  );
}

export function BodyStatsClient({ userId, measurements }: Props) {
  const router = useRouter();

  const latest = measurements[0];
  const oldest = measurements[measurements.length - 1];
  const hasTrend = measurements.length >= 2;

  // Build chart data (ascending by date for charts)
  const chartData = [...measurements].reverse().map((m) => ({
    date: new Date(m.measured_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Weight: m.weight_kg ?? null,
    "Body Fat": m.body_fat_pct ?? null,
  }));

  // Deltas
  const weightDelta = hasTrend && latest?.weight_kg != null && oldest?.weight_kg != null
    ? +(latest.weight_kg - oldest.weight_kg).toFixed(1) : null;
  const fatDelta = hasTrend && latest?.body_fat_pct != null && oldest?.body_fat_pct != null
    ? +(latest.body_fat_pct - oldest.body_fat_pct).toFixed(1) : null;

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
        <Button size="sm" variant="primary" onClick={() => router.push("/body-stats/log")}>
          <Plus size={16} weight="bold" /> Log Today
        </Button>
      </div>

      {/* Current Stats card */}
      {latest ? (
        <Card variant="surface" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider">
                Latest Measurement
              </p>
              <p className="font-body-bold text-sm text-[var(--text-primary)] mt-0.5">
                {new Date(latest.measured_at).toLocaleDateString("en-US", {
                  weekday: "short", month: "long", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            <span className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-body-bold border",
              latest.source === "cult_scale"
                ? "border-[var(--accent-start)]/30 text-[var(--accent-text)] bg-[rgba(249,115,22,0.08)]"
                : "border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-base)]"
            )}>
              {latest.source === "cult_scale" ? "⚖️ Cult Scale" : "✏️ Manual"}
            </span>
          </div>

          {/* Essentials grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <StatPill label="Weight" value={latest.weight_kg} unit="kg" flag={latest.flags?.weight} />
            <StatPill label="BMI" value={latest.bmi} flag={latest.flags?.bmi} />
            <StatPill label="Body Fat" value={latest.body_fat_pct} unit="%" flag={latest.flags?.body_fat} />
            <StatPill label="Lean Mass" value={latest.lean_mass_kg} unit="kg" flag={latest.flags?.lean_mass} />
            <StatPill label="Bone Mass" value={latest.bone_mass_kg} unit="kg" flag={latest.flags?.bone_mass} />
          </div>

          {/* Muscle & composition */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <StatPill label="Muscle Mass" value={latest.skeletal_muscle_mass_kg} unit="kg" flag={latest.flags?.skeletal_muscle} />
            <StatPill label="Visceral Fat" value={latest.visceral_fat_level} flag={latest.flags?.visceral_fat} />
            <StatPill label="Body Water" value={latest.body_water_pct} unit="%" flag={latest.flags?.body_water} />
            <StatPill label="BMR" value={latest.bmr_kcal} unit="kcal" flag={latest.flags?.bmr} />
            <StatPill label="Met. Age" value={latest.metabolic_age} unit="yrs" flag={latest.flags?.metabolic_age} />
          </div>
        </Card>
      ) : (
        <Card variant="surface" className="p-8 text-center border-dashed">
          <p className="font-display text-xl text-[var(--text-primary)] font-black uppercase">No Data Yet</p>
          <p className="font-body text-xs text-[var(--text-muted)] mt-2">
            Log your first measurement to start tracking body composition.
          </p>
          <Button size="sm" variant="primary" className="mt-4 mx-auto"
            onClick={() => router.push("/body-stats/log")}>
            Log First Measurement
          </Button>
        </Card>
      )}

      {/* Progress trend charts */}
      {hasTrend && (
        <div className="space-y-4">
          <h2 className="font-display text-base tracking-wider text-[var(--text-muted)] uppercase">
            Progress Trends
          </h2>

          {/* Delta badges */}
          <div className="flex gap-3 flex-wrap">
            {weightDelta !== null && (
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body-bold border",
                weightDelta <= 0
                  ? "text-[var(--green)] bg-[var(--green-soft)] border-[var(--green)]/20"
                  : "text-[var(--red)] bg-[rgba(239,68,68,0.08)] border-[var(--red)]/20"
              )}>
                {weightDelta <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                {weightDelta > 0 ? "+" : ""}{weightDelta} kg since Day 1
              </div>
            )}
            {fatDelta !== null && (
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body-bold border",
                fatDelta <= 0
                  ? "text-[var(--green)] bg-[var(--green-soft)] border-[var(--green)]/20"
                  : "text-[var(--red)] bg-[rgba(239,68,68,0.08)] border-[var(--red)]/20"
              )}>
                {fatDelta <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                {fatDelta > 0 ? "+" : ""}{fatDelta}% body fat since Day 1
              </div>
            )}
          </div>

          {/* Weight chart */}
          {chartData.some(d => d.Weight !== null) && (
            <Card variant="surface" className="p-4">
              <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Weight (kg)
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "inherit" }}
                    axisLine={false} tickLine={false} />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="Weight" stroke="var(--accent-start)"
                    strokeWidth={2} dot={{ r: 3, fill: "var(--accent-start)" }}
                    connectNulls activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Body fat chart */}
          {chartData.some(d => d["Body Fat"] !== null) && (
            <Card variant="surface" className="p-4">
              <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Body Fat %
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "inherit" }}
                    axisLine={false} tickLine={false} />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="Body Fat" stroke="var(--red)"
                    strokeWidth={2} dot={{ r: 3, fill: "var(--red)" }}
                    connectNulls activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* History list */}
      {measurements.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-base tracking-wider text-[var(--text-muted)] uppercase">
            Measurement History
          </h2>
          <div className="space-y-2">
            {measurements.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => router.push(`/body-stats/${m.id}`)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent-start)]/40 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <p className="font-body-bold text-sm text-[var(--text-primary)]">
                    {new Date(m.measured_at).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-body">
                    {m.weight_kg && <span>{m.weight_kg} kg</span>}
                    {m.body_fat_pct && <span>· {m.body_fat_pct}% fat</span>}
                    {m.skeletal_muscle_mass_kg && <span>· {m.skeletal_muscle_mass_kg} kg muscle</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-body-bold border",
                    m.source === "cult_scale"
                      ? "border-[var(--accent-start)]/30 text-[var(--accent-text)] bg-[rgba(249,115,22,0.08)]"
                      : "border-[var(--border)] text-[var(--text-muted)]"
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
