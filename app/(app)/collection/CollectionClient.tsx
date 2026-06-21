"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  GridFour,
  List,
  MagnifyingGlass,
  Plus,
  Trash,
  PencilSimple,
  Download,
  ShareNetwork,
  Calendar,
  User,
  Folder,
  FilePdf,
  Image as ImageIcon,
  ChartBar,
  FileText,
  X,
  FileArrowDown,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";

interface CollectionItem {
  id: string;
  user_id: string;
  profile_tag: "S" | "A" | "both" | null;
  title: string | null;
  file_url: string;
  file_type: "photo" | "pdf" | "screenshot" | "report" | "other";
  album: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  metadata: any;
  taken_at: string | null;
  created_at: string;
}

interface CollectionClientProps {
  userId: string;
  initialItems: CollectionItem[];
}

export function CollectionClient({ userId, initialItems }: CollectionClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<CollectionItem[]>(initialItems);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  
  // Filters & State
  const [activeAlbum, setActiveAlbum] = useState<string>("All");
  const [profileFilter, setProfileFilter] = useState<"S" | "A" | "Both">("Both");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "size">("newest");

  // Modals
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);

  // Edit details form states
  const [editTitle, setEditTitle] = useState("");
  const [editAlbum, setEditAlbum] = useState("");
  const [editProfileTag, setEditProfileTag] = useState<"S" | "A" | "both" | "neither">("neither");
  const [editTakenAt, setEditTakenAt] = useState("");

  // Album Tabs definitions
  const albumTabs = ["All", "Progress", "Body Scans", "Meals", "PDFs", "Reports"];

  // Batch generate signed URLs for private storage items
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!items.length) return;
      const paths = items.map((item) => item.file_url);
      
      const { data, error } = await supabase.storage
        .from("collection")
        .createSignedUrls(paths, 3600); // 1 hour expiry

      if (data) {
        const urlMap: Record<string, string> = {};
        data.forEach((d) => {
          if (d.signedUrl) {
            // Find item by matching file_url prefix path
            const match = items.find((item) => item.file_url === d.path);
            if (match) {
              urlMap[match.id] = d.signedUrl;
            }
          }
        });
        setSignedUrls(urlMap);
      }
    };

    fetchSignedUrls();
  }, [items]);

  // Format File Size
  const formatBytes = (bytes: number, decimals = 1) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Icon type mapper
  const getTypeBadgeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return "📸";
      case "pdf":
        return "📄";
      case "screenshot":
        return "🖥️";
      case "report":
        return "📊";
      default:
        return "📁";
    }
  };

  const getAlbumTypeLabel = (album: string) => {
    switch (album.toLowerCase()) {
      case "progress":
        return "progress photo";
      case "body scans":
      case "body_scan":
      case "body_scans":
        return "body scan";
      case "meals":
        return "meal photo";
      case "pdfs":
        return "PDF document";
      case "reports":
        return "AI report";
      default:
        return "item";
    }
  };

  // Thumbnail/Placeholder renderer
  const renderThumbnail = (item: CollectionItem, sizeClasses = "w-full h-full") => {
    const signedUrl = signedUrls[item.id];
    const isImage = item.file_type === "photo" || item.file_type === "screenshot" || (item.mime_type || "").startsWith("image/");

    if (isImage && signedUrl) {
      return (
        <img
          src={signedUrl}
          alt={item.title || "Item"}
          className={cn("object-cover", sizeClasses)}
        />
      );
    }

    // Default icon states for PDFs and documents
    return (
      <div className={cn("bg-[var(--bg-elevated)] flex flex-col items-center justify-center text-[var(--text-muted)] p-4", sizeClasses)}>
        {item.file_type === "pdf" ? (
          <FilePdf size={40} className="text-[var(--accent-text)]" />
        ) : item.file_type === "report" ? (
          <ChartBar size={40} className="text-[var(--green)]" />
        ) : (
          <FileText size={40} className="text-[var(--text-secondary)]" />
        )}
        <span className="font-body text-[10px] uppercase tracking-widest mt-2">
          {(item.mime_type || "").split("/")[1] || item.file_type}
        </span>
      </div>
    );
  };

  // Handle Edit details modal open
  const startEdit = (item: CollectionItem) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditAlbum(item.album || "");
    setEditProfileTag(item.profile_tag || "neither");
    setEditTakenAt(item.taken_at || new Date().toISOString().split("T")[0]);
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    const profileTagValue = editProfileTag === "neither" ? null : editProfileTag;

    const { error } = await supabase
      .from("collection_items")
      .update({
        title: editTitle,
        album: editAlbum,
        profile_tag: profileTagValue,
        taken_at: editTakenAt,
      })
      .eq("id", editingItem.id);

    if (!error) {
      // Update local state
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                title: editTitle,
                album: editAlbum,
                profile_tag: profileTagValue,
                taken_at: editTakenAt,
              }
            : i
        )
      );

      // If selected view is also open, update that
      if (selectedItem?.id === editingItem.id) {
        setSelectedItem((prev) =>
          prev
            ? {
                ...prev,
                title: editTitle,
                album: editAlbum,
                profile_tag: profileTagValue,
                taken_at: editTakenAt,
              }
            : null
        );
      }

      setEditingItem(null);
    } else {
      alert("Error updating item: " + error.message);
    }
  };

  // Handle Delete
  const deleteItem = async (item: CollectionItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title || "Untitled"}"?`)) return;

    // Remove from database
    const { error: dbError } = await supabase
      .from("collection_items")
      .delete()
      .eq("id", item.id);

    if (dbError) {
      alert("Error deleting from database: " + dbError.message);
      return;
    }

    // Remove from Storage
    await supabase.storage.from("collection").remove([item.file_url]);

    // Update state
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedItem(null);
  };

  // Share
  const shareItem = (item: CollectionItem) => {
    const url = signedUrls[item.id];
    if (navigator.share && url) {
      navigator.share({
        title: item.title || "Untitled",
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url || "");
      alert("Signed URL copied to clipboard!");
    }
  };

  // Download File
  const downloadItem = async (item: CollectionItem) => {
    const signedUrl = signedUrls[item.id];
    if (!signedUrl) return;
    
    // Open in new window or force trigger download
    window.open(signedUrl, "_blank");
  };

  // Navigation between items in same filtered list
  const navigateItem = (dir: "next" | "prev") => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    if (currentIndex === -1) return;

    let targetIndex = dir === "next" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < filteredItems.length) {
      setSelectedItem(filteredItems[targetIndex]);
    }
  };

  // Filter & Sort Items
  const filteredItems = items
    .filter((item) => {
      // 1. Album Tab filter
      if (activeAlbum !== "All") {
        const normAlbum = (item.album || "").toLowerCase().replace("_", " ");
        const normActive = activeAlbum.toLowerCase().replace("s", ""); // simple singular normalization
        if (activeAlbum === "PDFs") {
          if (item.file_type !== "pdf") return false;
        } else if (activeAlbum === "Body Scans") {
          if (!normAlbum.includes("body scan")) return false;
        } else {
          if (!normAlbum.includes(normActive)) return false;
        }
      }

      // 2. Profile 3-way filter
      if (profileFilter !== "Both") {
        if (profileFilter === "S" && item.profile_tag !== "S") return false;
        if (profileFilter === "A" && item.profile_tag !== "A") return false;
      }

      // 3. Search query
      if (searchQuery.trim() !== "") {
        if (!(item.title || "").toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.taken_at || b.created_at || Date.now()).getTime() - new Date(a.taken_at || a.created_at || Date.now()).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.taken_at || a.created_at || Date.now()).getTime() - new Date(b.taken_at || b.created_at || Date.now()).getTime();
      }
      if (sortBy === "name") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "size") {
        return (b.file_size_bytes || 0) - (a.file_size_bytes || 0);
      }
      return 0;
    });

  return (
    <div className="pb-28 pt-4 px-4 max-w-6xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide uppercase">
            COLLECTION
          </h1>
          <p className="font-body text-xs font-body-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
            Secure media vault
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => router.push("/collection/upload")}
          className="flex items-center gap-1.5 uppercase font-display font-black tracking-wider text-xs px-4 py-2.5"
        >
          <Plus size={16} weight="bold" />
          Upload
        </Button>
      </div>

      {/* Search, Sort, Profile, Layout Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] font-body"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">File Size</option>
          </select>

          {/* Profile Selector (3-way filter) */}
          <div className="flex bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-0.5">
            {(["S", "A", "Both"] as const).map((tag) => (
              <button
                key={tag}
                onClick={() => setProfileFilter(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider transition-colors",
                  profileFilter === tag
                    ? "bg-[var(--accent-start)] text-white font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Grid/List View Toggles */}
          <div className="flex bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-[var(--text-secondary)] transition-colors",
                viewMode === "grid" && "bg-[var(--bg-elevated)] text-[var(--accent-text)]"
              )}
            >
              <GridFour size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg text-[var(--text-secondary)] transition-colors",
                viewMode === "list" && "bg-[var(--bg-elevated)] text-[var(--accent-text)]"
              )}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Album tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border)] -mx-4 px-4 md:mx-0 md:px-0">
        {albumTabs.map((album) => {
          const isActive = activeAlbum === album;
          return (
            <button
              key={album}
              onClick={() => setActiveAlbum(album)}
              className={cn(
                "px-4 py-2 border-b-2 font-display text-sm uppercase tracking-wider whitespace-nowrap transition-colors",
                isActive
                  ? "border-[var(--accent-start)] text-[var(--accent-text)] font-bold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {album}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {filteredItems.length === 0 ? (
        /* Empty State */
        <div className="py-24 text-center space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <Folder size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-black text-[var(--text-primary)] uppercase tracking-wider">
              No {activeAlbum === "All" ? "files" : activeAlbum} yet
            </h3>
            <p className="font-body text-xs text-[var(--text-muted)] leading-relaxed">
              Upload your first {getAlbumTypeLabel(activeAlbum === "All" ? "progress" : activeAlbum)} to secure it inside the vault.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => router.push("/collection/upload")}
            className="uppercase font-display tracking-wider text-xs px-6 py-2.5 border border-[var(--border)]"
          >
            Upload Item
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Layout */
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="relative aspect-square rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] cursor-pointer group hover:border-[var(--accent-start)]/40 hover:shadow-lg transition-all duration-300"
            >
              {renderThumbnail(item)}

              {/* Bottom text overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex flex-col justify-end min-h-[50%]">
                <span className="font-body font-body-bold text-[10px] text-white line-clamp-2 leading-tight">
                  {item.title || "Untitled"}
                </span>
                <span className="font-body text-[8px] text-white/60 mt-0.5">
                  {new Date(item.taken_at || item.created_at || Date.now()).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Top-left Type badge */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-[2px] rounded-lg w-6 h-6 flex items-center justify-center text-[11px]">
                {getTypeBadgeIcon(item.file_type)}
              </div>

              {/* Top-right Profile Pill */}
              {item.profile_tag && (
                <div
                  className={cn(
                    "absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-display font-black uppercase tracking-wider",
                    item.profile_tag === "both"
                      ? "bg-[var(--amber)] text-black"
                      : "bg-[var(--accent-start)] text-white"
                  )}
                >
                  {item.profile_tag === "both" ? "Both" : item.profile_tag}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="flex items-center gap-4 p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent-start)]/40 cursor-pointer transition-all duration-200"
            >
              {/* Thumbnail Container */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[var(--border)]">
                {renderThumbnail(item)}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <h4 className="font-display text-sm font-black text-[var(--text-primary)] uppercase truncate leading-tight">
                  {item.title || "Untitled"}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-body text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(item.taken_at || item.created_at || Date.now()).toLocaleDateString()}
                  </span>
                  <span>{formatBytes(item.file_size_bytes || 0)}</span>
                  <span className="capitalize">{(item.album || "").replace("_", " ")}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 pr-2 shrink-0">
                {/* Type icon */}
                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg w-7 h-7 flex items-center justify-center text-[12px]">
                  {getTypeBadgeIcon(item.file_type)}
                </div>

                {/* Profile Pill */}
                {item.profile_tag && (
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-[9px] font-display font-black uppercase tracking-wider",
                      item.profile_tag === "both"
                        ? "bg-[var(--amber)] text-black"
                        : "bg-[var(--accent-start)] text-white"
                    )}
                  >
                    {item.profile_tag}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN VIEWER MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-[4px] z-50 flex flex-col justify-between select-none">
          {/* Modal Header */}
          <header className="p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <button
              onClick={() => setSelectedItem(null)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={20} weight="bold" />
            </button>
            <div className="text-center">
              <h2 className="font-display text-md font-black text-white uppercase tracking-wider truncate max-w-xs">
                {selectedItem.title || "Untitled"}
              </h2>
              <span className="font-body text-[10px] text-white/60">
                {new Date(selectedItem.taken_at || selectedItem.created_at || Date.now()).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {/* Delete button (header area) */}
            <button
              onClick={() => deleteItem(selectedItem)}
              className="p-2 rounded-full bg-[var(--red)]/20 text-[var(--red)] hover:bg-[var(--red)]/35 transition-colors"
            >
              <Trash size={20} />
            </button>
          </header>

          {/* Modal Content / Preview Area */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Swipe Left navigation */}
            <button
              onClick={() => navigateItem("prev")}
              disabled={filteredItems.findIndex((i) => i.id === selectedItem.id) === 0}
              className="absolute left-4 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all hidden sm:block"
            >
              <ArrowLeft size={20} weight="bold" />
            </button>

            {/* Content box based on mime_type/type */}
            <div className="max-w-full max-h-[70vh] flex items-center justify-center">
              {selectedItem.file_type === "pdf" && signedUrls[selectedItem.id] ? (
                <iframe
                  src={signedUrls[selectedItem.id]}
                  className="w-[85vw] h-[65vh] max-w-3xl border border-white/10 rounded-2xl bg-white"
                />
              ) : signedUrls[selectedItem.id] ? (
                <img
                  src={signedUrls[selectedItem.id]}
                  alt={selectedItem.title || "Item"}
                  className="max-w-[90vw] max-h-[70vh] object-contain rounded-2xl select-none"
                />
              ) : (
                <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                  <FileArrowDown size={48} className="text-[var(--accent-text)] mx-auto mb-2" />
                  <p className="font-display text-sm uppercase text-white font-bold">Document vault</p>
                </div>
              )}
            </div>

            {/* Swipe Right navigation */}
            <button
              onClick={() => navigateItem("next")}
              disabled={filteredItems.findIndex((i) => i.id === selectedItem.id) === filteredItems.length - 1}
              className="absolute right-4 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all hidden sm:block"
            >
              <ArrowRight size={20} weight="bold" />
            </button>
          </div>

          {/* Modal Footer Controls */}
          <footer className="p-6 bg-gradient-to-t from-black/80 to-transparent space-y-4">
            {/* Metadata Tags */}
            <div className="flex justify-center items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-display uppercase tracking-widest">
                {selectedItem.album || "general"}
              </span>
              {selectedItem.profile_tag && (
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-start)] text-white text-[10px] font-display font-black uppercase tracking-wider">
                  Profile: {selectedItem.profile_tag}
                </span>
              )}
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <Button
                variant="ghost"
                onClick={() => shareItem(selectedItem)}
                className="flex flex-col items-center gap-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white"
              >
                <ShareNetwork size={16} />
                <span className="text-[9px] font-display uppercase tracking-wider">Share</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => downloadItem(selectedItem)}
                className="flex flex-col items-center gap-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white"
              >
                <Download size={16} />
                <span className="text-[9px] font-display uppercase tracking-wider">Download</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => startEdit(selectedItem)}
                className="flex flex-col items-center gap-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white"
              >
                <PencilSimple size={16} />
                <span className="text-[9px] font-display uppercase tracking-wider">Edit</span>
              </Button>
            </div>
          </footer>
        </div>
      )}

      {/* FILE DETAILS EDIT BOTTOM SHEET/MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5 animate-slide-up">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <h3 className="font-display text-lg font-black text-[var(--text-primary)] uppercase tracking-wider">
                Edit Details
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
                />
              </div>

              {/* Album selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Album
                </label>
                <select
                  value={editAlbum}
                  onChange={(e) => setEditAlbum(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)] font-body"
                >
                  <option value="progress">Progress</option>
                  <option value="body_scans">Body Scans</option>
                  <option value="meals">Meals</option>
                  <option value="pdfs">PDFs</option>
                  <option value="reports">Reports</option>
                </select>
              </div>

              {/* Profile tag picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Profile Tag
                </label>
                <div className="flex gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-1 w-max">
                  {([
                    { label: "S", val: "S" },
                    { label: "A", val: "A" },
                    { label: "Both", val: "both" },
                    { label: "None", val: "neither" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setEditProfileTag(opt.val)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider transition-colors",
                        editProfileTag === opt.val
                          ? "bg-[var(--accent-start)] text-white font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Taken */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Date Taken
                </label>
                <input
                  type="date"
                  value={editTakenAt}
                  onChange={(e) => setEditTakenAt(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 font-body"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setEditingItem(null)}
                className="flex-1 uppercase font-display tracking-wider text-xs py-3 border border-[var(--border)]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={saveEdit}
                className="flex-1 uppercase font-display font-black tracking-wider text-xs py-3"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Arrow helper components
function ArrowLeft({ size, weight, className }: { size: number; weight: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      style={{ width: size, height: size, fill: "currentColor" }}
    >
      <path d="M168,220a8,8,0,0,1-5.66-2.34l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L99.31,128l74.35,74.34A8,8,0,0,1,168,220Z" />
    </svg>
  );
}

function ArrowRight({ size, weight, className }: { size: number; weight: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      style={{ width: size, height: size, fill: "currentColor" }}
    >
      <path d="M88,220a8,8,0,0,1-5.66-13.66L156.69,128,82.34,53.66a8,8,0,0,1,11.32-11.32l80,80a8,8,0,0,1,0,11.32l-80,80A8,8,0,0,1,88,220Z" />
    </svg>
  );
}
