"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus } from "@phosphor-icons/react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface Measurement {
  id: string;
  measured_at: string;
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
}

interface Props {
  userId: string;
  measurements: Measurement[];
}

interface MetricConfig {
  key: keyof Measurement;
  label: string;
  unit: string;
  color: string;
  lowerIsBetter?: boolean;
}

const METRIC_GROUPS: { groupLabel: string; metrics: MetricConfig[] }[] = [
  {
    groupLabel: "Essentials",
    metrics: [
      { key: "weight_kg", label: "Weight", unit: "kg", color: "var(--accent-start)", lowerIsBetter: true },
      { key: "bmi", label: "BMI", unit: "", color: "#3b82f6", lowerIsBetter: true },
      { key: "body_fat_pct", label: "Body Fat Percentage", unit: "%", color: "var(--red)", lowerIsBetter: true },
      { key: "body_fat_kg", label: "Body Fat Mass", unit: "kg", color: "#f97316", lowerIsBetter: true },
      { key: "lean_mass_kg", label: "Lean Mass", unit: "kg", color: "var(--green)", lowerIsBetter: false },
    ],
  },
  {
    groupLabel: "Bone & Muscle Mass",
    metrics: [
      { key: "bone_mass_kg", label: "Bone Mass", unit: "kg", color: "#8b5cf6", lowerIsBetter: false },
      { key: "skeletal_muscle_mass_kg", label: "Skeletal Muscle Mass", unit: "kg", color: "var(--green)", lowerIsBetter: false },
      { key: "skeletal_muscle_pct", label: "Skeletal Muscle Percentage", unit: "%", color: "#10b981", lowerIsBetter: false },
    ],
  },
  {
    groupLabel: "Fat Derivatives & Composition",
    metrics: [
      { key: "subcutaneous_fat_pct", label: "Subcutaneous Fat", unit: "%", color: "#ec4899", lowerIsBetter: true },
      { key: "visceral_fat_level", label: "Visceral Fat Level", unit: "", color: "#ef4444", lowerIsBetter: true },
      { key: "body_water_pct", label: "Body Water Percentage", unit: "%", color: "#06b6d4", lowerIsBetter: false },
      { key: "protein_pct", label: "Protein Percentage", unit: "%", color: "#a855f7", lowerIsBetter: false },
    ],
  },
  {
    groupLabel: "Metabolic Indicators",
    metrics: [
      { key: "bmr_kcal", label: "Basal Metabolic Rate (BMR)", unit: "kcal", color: "#f59e0b", lowerIsBetter: false },
      { key: "metabolic_age", label: "Metabolic Age", unit: "yrs", color: "#6366f1", lowerIsBetter: true },
    ],
  },
];

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs font-body shadow-xl">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-body-bold text-sm">
          {p.value} {unit}
        </p>
      ))}
    </div>
  );
}

function MetricTrendChart({
  metric,
  measurementsAsc,
}: {
  metric: MetricConfig;
  measurementsAsc: Measurement[];
}) {
  // Extract non-null values for this metric
  const validData = measurementsAsc.filter((m) => m[metric.key] !== null && m[metric.key] !== undefined);
  if (validData.length === 0) return null;

  const chartData = validData.map((m) => ({
    date: new Date(m.measured_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    val: m[metric.key] as number,
  }));

  const latestVal = validData[validData.length - 1][metric.key] as number;
  const oldestVal = validData[0][metric.key] as number;
  const hasMultiple = validData.length >= 2;
  const delta = hasMultiple ? +(latestVal - oldestVal).toFixed(1) : 0;

  // Determine delta status formatting
  let isGood = false;
  if (hasMultiple && delta !== 0) {
    if (metric.lowerIsBetter) {
      isGood = delta < 0;
    } else {
      isGood = delta > 0;
    }
  }

  return (
    <Card variant="surface" className="p-4 rounded-3xl border-[#27272a] bg-[#09090b]/60 backdrop-blur-sm space-y-3">
      {/* Top Header & Day 1 Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272a]/60 pb-3">
        <div>
          <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wider">{metric.label}</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display text-2xl font-black text-[var(--text-primary)] tracking-wide">{latestVal}</span>
            {metric.unit && <span className="font-body text-xs text-[var(--text-muted)]">{metric.unit}</span>}
          </div>
        </div>

        {/* Individual Badge for 'x since Day 1' */}
        {hasMultiple ? (
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body-bold border border-[#27272a]",
              delta === 0
                ? "text-[var(--text-muted)] bg-[#18181b]"
                : isGood
                ? "text-[var(--green)] bg-[var(--green-soft)]"
                : "text-[var(--red)] bg-[rgba(239,68,68,0.08)]"
            )}
          >
            {delta > 0 ? (
              <ArrowUpRight size={14} weight="bold" />
            ) : delta < 0 ? (
              <ArrowDownRight size={14} weight="bold" />
            ) : (
              <Minus size={14} weight="bold" />
            )}
            <span>
              {delta > 0 ? `+${delta}` : delta} {metric.unit} since Day 1
            </span>
          </div>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-body-bold text-[var(--text-muted)] bg-[#18181b] border border-[#27272a]">
            Day 1 Baseline
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="pt-2">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip content={<ChartTooltip unit={metric.unit} />} />
            <Line
              type="monotone"
              dataKey="val"
              name={metric.label}
              stroke={metric.color}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: metric.color, stroke: "#09090b", strokeWidth: 1.5 }}
              connectNulls
              activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function TrendsClient({ userId, measurements }: Props) {
  const router = useRouter();
  // Ascending measurements by date for charts
  const measurementsAsc = [...measurements].reverse();

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/body-stats")}
          className="p-2 rounded-xl border border-[#27272a] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)] font-black tracking-wide">PROGRESS TRENDS</h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">Comprehensive analytics &amp; changes since Day 1</p>
        </div>
      </div>

      {measurements.length === 0 ? (
        <Card variant="surface" className="p-8 text-center border-dashed border-[#27272a]">
          <p className="font-display text-xl text-[var(--text-primary)] font-black uppercase">No Trend Data</p>
          <p className="font-body text-xs text-[var(--text-muted)] mt-2">Log body measurements to view long-term composition trends.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {METRIC_GROUPS.map((group) => {
            // Check if any metric in this group has data
            const groupHasData = group.metrics.some((m) =>
              measurements.some((meas) => meas[m.key] !== null && meas[m.key] !== undefined)
            );
            if (!groupHasData) return null;

            return (
              <div key={group.groupLabel} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#27272a] pb-2">
                  <h2 className="font-display text-sm font-black text-[var(--text-primary)] tracking-wider uppercase">
                    {group.groupLabel}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.metrics.map((metric) => (
                    <MetricTrendChart key={metric.key} metric={metric} measurementsAsc={measurementsAsc} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
