"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ClipboardText, PencilSimple, Check, UploadSimple, Image as ImageIcon, Trash, Sparkle, CircleNotch, FilePdf, Plus } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { type ParsedMeasurement } from "@/lib/utils/cultScaleParser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

type Tab = "manual" | "scale";

interface Props {
  userId: string;
  editId?: string;
}

interface UploadedItem {
  id: string;
  file: File;
  preview: string;
  isPdf: boolean;
}

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
  const f: FormState = { measured_at: p.measured_at || new Date().toISOString().split("T")[0] };
  FIELD_GROUPS.forEach(g => g.fields.forEach(field => {
    const val = (p as any)[field.key];
    f[field.key] = val !== null && val !== undefined ? String(val) : "";
  }));
  return f;
};

export function LogMeasurementClient({ userId, editId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("manual");
  const [form, setForm] = useState<FormState>(emptyForm());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedItem[]>([]);
  
  const [parsed, setParsed] = useState<ParsedMeasurement | null>(null);
  const [parsingAI, setParsingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!editId) return;
    const loadMeasurement = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("body_measurements").select("*").eq("id", editId).single();
      if (data) {
        setForm({
          measured_at: data.measured_at || new Date().toISOString().split("T")[0],
          weight_kg: data.weight_kg != null ? String(data.weight_kg) : "",
          bmi: data.bmi != null ? String(data.bmi) : "",
          body_fat_pct: data.body_fat_pct != null ? String(data.body_fat_pct) : "",
          body_fat_kg: data.body_fat_kg != null ? String(data.body_fat_kg) : "",
          lean_mass_kg: data.lean_mass_kg != null ? String(data.lean_mass_kg) : "",
          bone_mass_kg: data.bone_mass_kg != null ? String(data.bone_mass_kg) : "",
          skeletal_muscle_mass_kg: data.skeletal_muscle_mass_kg != null ? String(data.skeletal_muscle_mass_kg) : "",
          skeletal_muscle_pct: data.skeletal_muscle_pct != null ? String(data.skeletal_muscle_pct) : "",
          subcutaneous_fat_pct: data.subcutaneous_fat_pct != null ? String(data.subcutaneous_fat_pct) : "",
          visceral_fat_level: data.visceral_fat_level != null ? String(data.visceral_fat_level) : "",
          protein_pct: data.protein_pct != null ? String(data.protein_pct) : "",
          body_water_pct: data.body_water_pct != null ? String(data.body_water_pct) : "",
          bmr_kcal: data.bmr_kcal != null ? String(data.bmr_kcal) : "",
          metabolic_age: data.metabolic_age != null ? String(data.metabolic_age) : "",
        });
        if (data.source === "cult_scale") {
          setParsed({
            measured_at: data.measured_at,
            weight_kg: data.weight_kg,
            bmi: data.bmi,
            body_fat_pct: data.body_fat_pct,
            body_fat_kg: data.body_fat_kg,
            lean_mass_kg: data.lean_mass_kg,
            bone_mass_kg: data.bone_mass_kg,
            skeletal_muscle_mass_kg: data.skeletal_muscle_mass_kg,
            skeletal_muscle_pct: data.skeletal_muscle_pct,
            subcutaneous_fat_pct: data.subcutaneous_fat_pct,
            visceral_fat_level: data.visceral_fat_level,
            protein_pct: data.protein_pct,
            body_water_pct: data.body_water_pct,
            bmr_kcal: data.bmr_kcal,
            metabolic_age: data.metabolic_age,
            flags: (data.flags as Record<string, string>) || {},
          });
        }
      }
    };
    loadMeasurement();
  }, [editId]);

  const handleFieldChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = (files: File[]) => {
    setAiError(null);
    files.forEach((file) => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            file,
            preview,
            isPdf,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAIExtract = async () => {
    if (uploadedFiles.length === 0) {
      setAiError("Please upload at least one report screenshot or PDF.");
      return;
    }

    setParsingAI(true);
    setAiError(null);

    try {
      const payloadFiles = uploadedFiles.map((item) => ({
        dataUrl: item.preview,
        name: item.file.name,
      }));

      // Rough size estimate — base64 is ~1.33× raw size
      const totalBytes = payloadFiles.reduce((sum, f) => sum + f.dataUrl.length, 0);
      const totalMB = totalBytes / 1024 / 1024;
      if (totalMB > 18) {
        throw new Error(
          `Files are too large (${totalMB.toFixed(1)} MB combined). Please remove some files and try again with fewer or smaller screenshots.`
        );
      }

      const res = await fetch("/api/body-stats/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: payloadFiles }),
      });

      // Guard against non-JSON responses (e.g. "Request Entity Too Large")
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        if (res.status === 413 || text.toLowerCase().includes("entity too large")) {
          throw new Error("Files are too large. Please use fewer screenshots or a smaller PDF.");
        }
        throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`);
      }

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to extract metrics");
      }

      const data = json.data;
      const parsedMeasurement: ParsedMeasurement = {
        measured_at: data.measured_at || new Date().toISOString().split("T")[0],
        weight_kg: data.weight_kg ?? null,
        bmi: data.bmi ?? null,
        body_fat_pct: data.body_fat_pct ?? null,
        body_fat_kg: data.body_fat_kg ?? null,
        lean_mass_kg: data.lean_mass_kg ?? null,
        bone_mass_kg: data.bone_mass_kg ?? null,
        skeletal_muscle_mass_kg: data.skeletal_muscle_mass_kg ?? null,
        skeletal_muscle_pct: data.skeletal_muscle_pct ?? null,
        subcutaneous_fat_pct: data.subcutaneous_fat_pct ?? null,
        visceral_fat_level: data.visceral_fat_level ?? null,
        protein_pct: data.protein_pct ?? null,
        body_water_pct: data.body_water_pct ?? null,
        bmr_kcal: data.bmr_kcal ?? null,
        metabolic_age: data.metabolic_age ?? null,
        flags: data.flags ?? {},
      };

      setParsed(parsedMeasurement);
      setForm(parsedToForm(parsedMeasurement));
      setTab("manual");
    } catch (err: any) {
      setAiError(err.message || "AI extraction failed. Try another file.");
    } finally {
      setParsingAI(false);
    }
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
    const payload = buildPayload() as any;
    const query = editId
      ? supabase.from("body_measurements").update(payload).eq("id", editId)
      : supabase.from("body_measurements").insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) { alert(error.message); return; }
    
    fetch("/api/events/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "body_stats_logged",
        weightKg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
      }),
    }).catch(() => {});

    setSuccess(true);
    setTimeout(() => router.push(editId ? `/body-stats/${editId}` : "/body-stats"), 1200);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(editId ? `/body-stats/${editId}` : "/body-stats")}
          className="p-2 rounded-xl border border-[#27272a] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)] font-black">
            {editId ? "EDIT MEASUREMENT" : "LOG MEASUREMENT"}
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">
            {editId ? "Update previously logged measurement details" : "Manual entry or Cult Smart Scale AI import"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-[#27272a] overflow-hidden bg-[var(--bg-base)] p-0.5 gap-0.5">
        {([
          { key: "manual", label: editId ? "Edit Values" : "Manual Entry", icon: PencilSimple },
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
            <Card variant="surface" className="p-5 space-y-4 border-[#27272a]">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body-bold bg-[rgba(249,115,22,0.12)] text-[var(--accent-text)]">
                  ⚖️ Cult Smart Scale AI Extractor
                </span>
                <span className="text-[10px] font-body text-[var(--text-muted)] flex items-center gap-1">
                  <Sparkle size={12} className="text-[var(--accent-text)]" /> Powered by Claude AI
                </span>
              </div>
              <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
                Upload one or more screenshots or PDF reports from your Cult App. Anthropic AI will extract all composition values and prefill your manual entry automatically.
              </p>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,application/pdf"
                multiple
                className="hidden"
              />

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-body-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                      Selected Files ({uploadedFiles.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-body-bold text-[var(--accent-text)] hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add More
                    </button>
                  </div>

                  <div className="space-y-2">
                    {uploadedFiles.map((item) => (
                      <div key={item.id} className="relative p-3 rounded-2xl bg-[#09090b] border border-[#27272a] flex items-center gap-3">
                        {item.isPdf ? (
                          <div className="w-12 h-12 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 flex items-center justify-center text-[var(--red)] shrink-0">
                            <FilePdf size={24} weight="bold" />
                          </div>
                        ) : (
                          <img src={item.preview} alt={item.file.name} className="w-12 h-12 object-cover rounded-xl border border-[#27272a] shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-xs font-bold text-[var(--text-primary)] truncate">{item.file.name}</p>
                          <p className="font-body text-[10px] text-[var(--text-muted)] mt-0.5">
                            {(item.file.size / 1024).toFixed(1)} KB • {item.isPdf ? "PDF Document" : "Image"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="p-2 rounded-xl text-[var(--red)] hover:bg-[var(--red)]/10 transition-colors shrink-0"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed border-[#27272a] hover:border-[var(--accent-start)]/50 bg-[#09090b] rounded-2xl text-center cursor-pointer transition-all space-y-2 group",
                  uploadedFiles.length > 0 ? "p-4" : "p-8 space-y-3"
                )}
              >
                <div className={cn(
                  "rounded-full bg-[var(--accent-start)]/10 text-[var(--accent-text)] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform",
                  uploadedFiles.length > 0 ? "w-9 h-9" : "w-12 h-12"
                )}>
                  <UploadSimple size={uploadedFiles.length > 0 ? 18 : 24} weight="bold" />
                </div>
                <div>
                  <p className="font-body text-xs font-bold text-[var(--text-primary)]">
                    {uploadedFiles.length > 0 ? "+ Upload More Screenshots / PDFs" : "Click or drag files to upload screenshots or PDFs"}
                  </p>
                  <p className="font-body text-[10px] text-[var(--text-muted)] mt-0.5">Supports PNG, JPG, WEBP, and PDF documents (Multi-select enabled)</p>
                </div>
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-[var(--red)]/10 border border-[#27272a] text-xs font-body text-[var(--red)]">
                  {aiError}
                </div>
              )}

              <Button
                fullWidth
                variant="primary"
                onClick={handleAIExtract}
                disabled={parsingAI || uploadedFiles.length === 0}
                className="py-3"
              >
                {parsingAI ? (
                  <span className="flex items-center gap-2">
                    <CircleNotch size={16} className="animate-spin" /> Extracting with Claude AI…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkle size={16} weight="fill" /> Extract &amp; Prefill Manual Entry ({uploadedFiles.length}) →
                  </span>
                )}
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
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[rgba(249,115,22,0.12)] border border-[rgba(249,115,22,0.3)] text-xs font-body text-[var(--accent-text)] shadow-sm">
                <Sparkle size={18} weight="fill" className="shrink-0" />
                <span><strong>AI Extracted!</strong> Review your prefilled metrics below and tap Save to log.</span>
              </div>
            )}

            {/* Date */}
            <Card variant="surface" className="p-4 border-[#27272a]">
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
              <Card key={group.label} variant="surface" className="p-4 space-y-3 border-[#27272a]">
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
                        className="w-full font-body text-sm px-3 py-2 rounded-xl border border-[#27272a] bg-[#09090b] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] transition-colors"
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
              {success ? "✓ Saved!" : saving ? "Saving…" : editId ? "Update Measurement" : "Save Measurement"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
