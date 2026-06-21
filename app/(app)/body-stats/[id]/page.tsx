import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `Measurement | D100` };
}

const STATUS_COLORS: Record<string, string> = {
  Standard: "text-[var(--green)] bg-[var(--green-soft)]",
  Normal:   "text-[var(--green)] bg-[var(--green-soft)]",
  Low:      "text-[var(--blue)] bg-[rgba(59,130,246,0.12)]",
  High:     "text-[var(--red)] bg-[rgba(239,68,68,0.12)]",
};

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const cls = STATUS_COLORS[status] ?? "text-[var(--text-muted)] bg-[var(--bg-base)]";
  return (
    <span className={cn("inline-block px-1.5 py-0.5 rounded text-[9px] font-body-bold uppercase", cls)}>
      {status}
    </span>
  );
}

function StatRow({ label, value, unit, flag }: {
  label: string; value: number | null; unit?: string; flag?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)]/40 last:border-0">
      <span className="font-body text-xs text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-center gap-2">
        {value !== null ? (
          <span className="font-display text-base font-black text-[var(--text-primary)]">
            {value}
            {unit && <span className="font-body text-[10px] text-[var(--text-muted)] ml-0.5">{unit}</span>}
          </span>
        ) : (
          <span className="font-body text-xs text-[var(--text-muted)]">—</span>
        )}
        <StatusBadge status={flag} />
      </div>
    </div>
  );
}

const SECTIONS = [
  {
    label: "Essentials",
    rows: [
      { key: "weight_kg",    label: "Weight",     unit: "kg",  flagKey: "weight" },
      { key: "bmi",          label: "BMI",         unit: "",    flagKey: "bmi" },
      { key: "body_fat_pct", label: "Body Fat",    unit: "%",   flagKey: "body_fat" },
      { key: "body_fat_kg",  label: "Body Fat",    unit: "kg",  flagKey: "" },
      { key: "lean_mass_kg", label: "Lean Mass",   unit: "kg",  flagKey: "lean_mass" },
    ],
  },
  {
    label: "Bone & Muscle Mass",
    rows: [
      { key: "bone_mass_kg",            label: "Bone Mass",         unit: "kg", flagKey: "bone_mass" },
      { key: "skeletal_muscle_mass_kg", label: "Skeletal Muscle",   unit: "kg", flagKey: "skeletal_muscle" },
      { key: "skeletal_muscle_pct",     label: "Skeletal Muscle",   unit: "%",  flagKey: "" },
    ],
  },
  {
    label: "Fat Derivatives",
    rows: [
      { key: "subcutaneous_fat_pct", label: "Subcutaneous Fat",  unit: "%", flagKey: "subcutaneous_fat" },
      { key: "visceral_fat_level",   label: "Visceral Fat Level", unit: "", flagKey: "visceral_fat" },
    ],
  },
  {
    label: "Body Composition",
    rows: [
      { key: "body_water_pct", label: "Body Water", unit: "%", flagKey: "body_water" },
      { key: "protein_pct",    label: "Protein",    unit: "%", flagKey: "protein" },
    ],
  },
  {
    label: "Metabolic",
    rows: [
      { key: "bmr_kcal",     label: "BMR",          unit: "kcal", flagKey: "bmr" },
      { key: "metabolic_age",label: "Metabolic Age", unit: "yrs", flagKey: "metabolic_age" },
    ],
  },
];

export default async function MeasurementDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: m, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !m) notFound();

  const flags = (m.flags as Record<string, string>) || {};
  const formattedDate = new Date(m.measured_at).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/body-stats"
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-body font-body-bold uppercase tracking-wider transition-colors">
          <ArrowLeft size={16} /> Body Stats
        </Link>
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-body-bold border",
          m.source === "cult_scale"
            ? "border-[var(--accent-start)]/30 text-[var(--accent-text)] bg-[rgba(249,115,22,0.08)]"
            : "border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-base)]"
        )}>
          {m.source === "cult_scale" ? "⚖️ Cult Scale" : "✏️ Manual"}
        </span>
      </div>

      <div>
        <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">
          {m.weight_kg ? `${m.weight_kg} kg` : "Measurement"}
        </h1>
        <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">{formattedDate}</p>
      </div>

      {/* All sections */}
      {SECTIONS.map((section) => {
        // Only render if at least one value is present
        const hasData = section.rows.some(row => (m as any)[row.key] !== null);
        if (!hasData) return null;
        return (
          <Card key={section.label} variant="surface" className="p-4">
            <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
              {section.label}
            </p>
            {section.rows.map((row) => (
              <StatRow
                key={row.key}
                label={row.label}
                value={(m as any)[row.key]}
                unit={row.unit}
                flag={row.flagKey ? flags[row.flagKey] : undefined}
              />
            ))}
          </Card>
        );
      })}

      {/* Notes */}
      {m.notes && (
        <Card variant="surface" className="p-4">
          <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Notes</p>
          <p className="font-body text-sm text-[var(--text-secondary)] leading-relaxed">{m.notes}</p>
        </Card>
      )}
    </div>
  );
}
