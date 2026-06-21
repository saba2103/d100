"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ClipboardText, PencilSimple, Check } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { parseCultScaleExport, type ParsedMeasurement } from "@/lib/utils/cultScaleParser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

type Tab = "manual" | "scale";

interface Props { userId: string; }

// All editable fields in order
const FIELD_GROUPS = [
  {
    label: "Essentials",
    fields: [
      { key: "weight_kg",   label: "Weight",       unit: "kg",   type: "decimal" },
      { key: "bmi",         label: "BMI",           unit: "",     type: "decimal" },
      { key: "body_fat_pct",label: "Body Fat",      unit: "%",    type: "decimal" },
      { key: "body_fat_kg", label: "Body Fat",      unit: "kg",   type: "decimal" },
      { key: "lean_mass_kg",label: "Lean Mass",     unit: "kg",   type: "decimal" },
    ],
  },
  {
    label: "Bone & Muscle",
    fields: [
      { key: "bone_mass_kg",              label: "Bone Mass",         unit: "kg", type: "decimal" },
      { key: "skeletal_muscle_mass_kg",   label: "Skeletal Muscle",   unit: "kg", type: "decimal" },
      { key: "skeletal_muscle_pct",       label: "Skeletal Muscle",   unit: "%",  type: "decimal" },
    ],
  },
  {
    label: "Fat & Composition",
    fields: [
      { key: "subcutaneous_fat_pct", label: "Subcutaneous Fat", unit: "%",  type: "decimal" },
      { key: "visceral_fat_level",   label: "Visceral Fat Level", unit: "", type: "integer" },
      { key: "body_water_pct",       label: "Body Water",         unit: "%", type: "decimal" },
      { key: "protein_pct",          label: "Protein",            unit: "%", type: "decimal" },
    ],
  },
  {
    label: "Metabolic",
    fields: [
      { key: "bmr_kcal",     label: "BMR",          unit: "kcal", type: "integer" },
      { key: "metabolic_age",label: "Metabolic Age", unit: "yrs", type: "integer" },
    ],
  },
];

type FormState = Record<string, string>;

const emptyForm = (): FormState => {
  const f: FormState = { measured_at: new Date().toISOString().split("T")[0] };
  FIELD_GROUPS.forEach(g => g.fields.forEach(field => { f[field.key] = ""; }));
  return f;
};

const parsedToForm = (p: ParsedMeasurement): FormState => {
  const f: FormState = { measured_at: p.measured_at };
  FIELD_GROUPS.forEach(g => g.fields.forEach(field => {
    const val = (p as any)[field.key];
    f[field.key] = val !== null && val !== undefined ? String(val) : "";
  }));
  return f;
};

export function LogMeasurementClient({ userId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("manual");
  const [form, setForm] = useState<FormState>(emptyForm());
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState<ParsedMeasurement | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFieldChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleParseScale = () => {
    if (!pasteText.trim()) return;
    const result = parseCultScaleExport(pasteText);
    setParsed(result);
    setForm(parsedToForm(result));
    setTab("manual"); // Switch to review in the form
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {
      user_id: userId,
      measured_at: form.measured_at || new Date().toISOString().split("T")[0],
      source: parsed ? "cult_scale" : "manual",
      flags: parsed?.flags ?? {},
    };
    FIELD_GROUPS.forEach(g => g.fields.forEach(({ key, type }) => {
      const raw = form[key];
      if (raw !== "" && raw !== undefined) {
        payload[key] = type === "integer" ? parseInt(raw, 10) : parseFloat(raw);
      }
    }));
    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("body_measurements").insert(buildPayload());
    setSaving(false);
    if (error) { alert(error.message); return; }
    setSuccess(true);
    setTimeout(() => router.push("/body-stats"), 1200);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/body-stats")}
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)] font-black">LOG MEASUREMENT</h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">Manual entry or Cult Smart Scale import</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-base)] p-0.5 gap-0.5">
        {([
          { key: "manual", label: "Manual Entry", icon: PencilSimple },
          { key: "scale",  label: "Cult Scale Import", icon: ClipboardText },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-body-bold transition-all",
              tab === key
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "scale" ? (
          /* ── Scale Import Tab ── */
          <motion.div key="scale"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <Card variant="surface" className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-[rgba(249,115,22,0.12)] text-[var(--accent-text)] border border-[rgba(249,115,22,0.2)]">
                  ⚖️ Cult Smart Scale
                </span>
              </div>
              <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
                Open the <strong>Cult App</strong> → Body Composition → tap the reading → Share/Export → Copy Text.
                Then paste the full export below.
              </p>

              <div className="bg-[var(--bg-base)] rounded-xl border border-[var(--border)] p-3 font-body text-[10px] text-[var(--text-muted)] leading-relaxed space-y-0.5">
                <p className="font-body-bold text-[var(--text-secondary)] mb-1">Expected format example:</p>
                <p>Essentials</p>
                <p>Date/Time&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19/06/2026 08:30</p>
                <p>Weight&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;72.5 kg&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Standard</p>
                <p>BMI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;23.4&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Standard</p>
                <p>Body Fat %&nbsp;&nbsp;&nbsp;&nbsp;18.5 %&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;High</p>
                <p>...</p>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your Cult Smart Scale export text here…"
                rows={10}
                className="w-full font-body text-xs px-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] transition-colors resize-none leading-relaxed"
              />

              <Button fullWidth variant="primary" onClick={handleParseScale} disabled={!pasteText.trim()}>
                Parse &amp; Review →
              </Button>
            </Card>
          </motion.div>
        ) : (
          /* ── Manual Entry / Review Tab ── */
          <motion.div key="manual"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {parsed && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(249,115,22,0.08)] border border-[rgba(249,115,22,0.2)] text-xs font-body text-[var(--accent-text)]">
                <Check size={14} weight="bold" /> Scale data parsed — review and edit values before saving.
              </div>
            )}

            {/* Date */}
            <Card variant="surface" className="p-4">
              <Input
                label="Measurement Date"
                id="measured_at"
                type="date"
                value={form.measured_at}
                onChange={(e) => handleFieldChange("measured_at", e.target.value)}
              />
            </Card>

            {/* Field groups */}
            {FIELD_GROUPS.map((group) => (
              <Card key={group.label} variant="surface" className="p-4 space-y-3">
                <p className="font-body-bold text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {group.fields.map(({ key, label, unit }) => (
                    <div key={key}>
                      <label className="block font-body text-[10px] text-[var(--text-muted)] mb-1">
                        {label}{unit ? ` (${unit})` : ""}
                      </label>
                      <input
                        type="number"
                        step="any"
                        inputMode="decimal"
                        placeholder="—"
                        value={form[key]}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full font-body text-sm px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {/* Save */}
            <Button
              fullWidth variant="primary" size="lg"
              onClick={handleSave} disabled={saving || success}
            >
              {success ? "✓ Saved!" : saving ? "Saving…" : "Save Measurement"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
