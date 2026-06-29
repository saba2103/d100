"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  UploadSimple,
  ArrowLeft,
  X,
  FilePdf,
  Image as ImageIcon,
  File,
  CheckCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth user state
  const [userId, setUserId] = useState<string | null>(null);

  // Form States
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("progress");
  const [profileTag, setProfileTag] = useState<"S" | "A" | "both" | "neither">("neither");
  const [takenAt, setTakenAt] = useState("");
  const [notes, setNotes] = useState("");

  // UI / Upload States
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  // Retrieve user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push("/login");
      }
    };
    getUser();

    // Default takenAt to today (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];
    setTakenAt(today);
  }, []);

  // Handle file selection and auto-defaults
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);

    // 1. Auto-suggest title from filename (strip extension)
    const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name;
    // Replace underscores/dashes with spaces for clean presentation
    const cleanTitle = nameWithoutExt.replace(/[_-]/g, " ");
    setTitle(cleanTitle);

    // 2. Auto-detect album
    if (selectedFile.type === "application/pdf") {
      setAlbum("pdfs");
    } else if (selectedFile.type.startsWith("image/")) {
      setAlbum("progress");
    } else {
      setAlbum("progress");
    }
  };

  const onFilePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "application/pdf",
        "image/gif",
      ];
      if (validTypes.includes(droppedFile.type) || droppedFile.name.endsWith(".heic")) {
        handleFileChange(droppedFile);
      } else {
        alert("Unsupported file type. Please upload a JPEG, PNG, WEBP, HEIC, or PDF file.");
      }
    }
  };

  // Clear current selected file
  const clearFile = () => {
    setFile(null);
    setTitle("");
    setAlbum("progress");
    setProfileTag("neither");
    setUploadProgress(0);
  };

  // Upload Submit logic
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;

    setIsUploading(true);
    setUploadProgress(5); // Start with fake visual feedback

    try {
      // 1. Upload to Supabase Storage
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const filePath = `${userId}/${timestamp}_${sanitizedName}`;

      // Upload file to bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("collection")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error("Storage Upload failed: " + uploadError.message);
      }

      setUploadProgress(60); // Progress milestone

      // 2. Map file type
      let fileType: "photo" | "pdf" | "screenshot" | "report" | "other" = "other";
      if (file.type === "application/pdf") {
        fileType = "pdf";
      } else if (file.type.startsWith("image/")) {
        if (album === "body_scans") {
          fileType = "screenshot";
        } else if (album === "reports") {
          fileType = "report";
        } else {
          fileType = "photo";
        }
      }

      const profileTagValue = profileTag === "neither" ? null : profileTag;

      // 3. Save DB Record to collection_items
      const { error: dbError } = await supabase.from("collection_items").insert({
        user_id: userId,
        profile_tag: profileTagValue,
        title: title || file.name,
        file_url: filePath,
        file_type: fileType,
        album: album,
        file_size_bytes: file.size,
        mime_type: file.type,
        taken_at: takenAt,
        metadata: { notes: notes },
      });

      if (dbError) {
        // Rollback Storage upload on DB failure
        await supabase.storage.from("collection").remove([filePath]);
        throw new Error("Database log failed: " + dbError.message);
      }

      setUploadProgress(100);
      setSuccess(true);

      fetch("/api/events/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "progress_photo_added",
          profileTag: profileTagValue || "S",
        }),
      }).catch(() => {});

      // Redirect back to gallery after short success visual
      setTimeout(() => {
        router.push("/collection");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred during upload.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-6">
      {/* Back Link */}
      <button
        onClick={() => router.push("/collection")}
        className="flex items-center gap-1.5 text-xs font-body font-body-bold text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        Back to Collection
      </button>

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-[var(--text-primary)] font-black tracking-wide uppercase">
          UPLOAD FILE
        </h1>
        <p className="font-body text-xs font-body-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
          Vault new document or image
        </p>
      </div>

      {success ? (
        /* Success Screen */
        <div className="py-16 text-center space-y-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl">
          <CheckCircle size={56} weight="fill" className="text-[var(--green)] mx-auto animate-bounce" />
          <div className="space-y-1">
            <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase tracking-wider">
              Upload Successful!
            </h3>
            <p className="font-body text-xs text-[var(--text-muted)]">
              Securing item in your vault...
            </p>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* File drag-and-drop area */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3",
                dragActive
                  ? "border-[var(--accent-start)] bg-[var(--accent-start)]/5"
                  : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent-start)]/40"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,image/gif"
                onChange={onFilePickerChange}
                className="hidden"
              />
              <div className="p-3.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
                <UploadSimple size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Select or drag file
                </p>
                <p className="font-body text-[10px] text-[var(--text-muted)]">
                  JPEG, PNG, WEBP, HEIC, or PDF up to 50MB
                </p>
              </div>
            </div>
          ) : (
            /* Selected File card */
            <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl relative">
              <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)]">
                {file.type === "application/pdf" ? (
                  <FilePdf size={24} className="text-[var(--accent-text)]" />
                ) : file.type.startsWith("image/") ? (
                  <ImageIcon size={24} className="text-[var(--green)]" />
                ) : (
                  <File size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="font-display text-xs font-bold text-[var(--text-primary)] uppercase truncate leading-tight">
                  {file.name}
                </p>
                <p className="font-body text-[9px] text-[var(--text-muted)]">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          )}

          {/* Form fields (Only visible when file is loaded) */}
          {file && (
            <div className="space-y-4 animate-slide-up">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter custom title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
                />
              </div>

              {/* Album Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Smart Album
                </label>
                <select
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] font-body"
                >
                  <option value="progress">Progress</option>
                  <option value="body_scans">Body Scans</option>
                  <option value="meals">Meals</option>
                  <option value="pdfs">PDFs</option>
                  <option value="reports">Reports</option>
                </select>
              </div>

              {/* Profile Tag */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Profile Tag
                </label>
                <div className="flex gap-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-1 w-max">
                  {([
                    { label: "S", val: "S" },
                    { label: "A", val: "A" },
                    { label: "Both", val: "both" },
                    { label: "None", val: "neither" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setProfileTag(opt.val)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider transition-colors",
                        profileTag === opt.val
                          ? "bg-[var(--accent-start)] text-white font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date taken */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Date Taken
                </label>
                <input
                  type="date"
                  required
                  value={takenAt}
                  onChange={(e) => setTakenAt(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any remarks or context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body resize-none"
                />
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[9px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div
                      className="h-full bg-[var(--accent-start)] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={clearFile}
                  disabled={isUploading}
                  className="flex-1 uppercase font-display tracking-wider text-xs py-3 border border-[var(--border)]"
                >
                  Clear Form
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 uppercase font-display font-black tracking-wider text-xs py-3"
                >
                  {isUploading ? "Uploading..." : "Save to Vault"}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
