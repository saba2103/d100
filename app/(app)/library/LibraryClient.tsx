"use client";

import React, { useState, useMemo } from "react";
import { MagnifyingGlass, Video, Barbell, Play, FolderSimple } from "@phosphor-icons/react";
import { WORKOUT_LIBRARY, LibraryVideo } from "@/lib/workoutLibrary";
import { VideoPlayerModal } from "@/components/features/VideoPlayerModal";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

export function LibraryClient() {
  const [activeCategorySlug, setActiveCategorySlug] = useState(WORKOUT_LIBRARY[0]?.slug || "chest");
  const [searchQuery, setSearchQuery] = useState("");

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState("");

  const handlePlayVideo = (name: string, path: string) => {
    setSelectedVideoUrl(path);
    setSelectedExerciseName(name);
    setVideoModalOpen(true);
  };

  const activeCategory = useMemo(() => {
    return WORKOUT_LIBRARY.find(c => c.slug === activeCategorySlug) || WORKOUT_LIBRARY[0];
  }, [activeCategorySlug]);

  // Search filter across either active category (default) or whole library (if search is active)
  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return activeCategory?.videos || [];
    }

    // Search across ALL categories for a global search result
    const results: (LibraryVideo & { categoryName: string })[] = [];
    WORKOUT_LIBRARY.forEach(cat => {
      cat.videos.forEach(vid => {
        if (vid.name.toLowerCase().includes(query)) {
          results.push({ ...vid, categoryName: cat.name });
        }
      });
    });
    return results;
  }, [searchQuery, activeCategory]);

  return (
    <div className="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-6 select-none">
      
      {/* Title & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase flex items-center gap-2.5">
            <Video size={32} className="text-[var(--accent-text)] animate-pulse" />
            Exercise Library
          </h1>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">
            Watch proper form and posture guides for 300+ workouts.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-body bg-[var(--bg-base)] border border-[var(--border)] rounded-xl text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-start)] transition-all duration-150"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Sidebar Category Navigator */}
        {!searchQuery && (
          <div className="w-full md:w-56 shrink-0 flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 pb-2 md:pb-0 scrollbar-hide border-b md:border-b-0 border-[var(--border)]">
            {WORKOUT_LIBRARY.map(cat => {
              const isActive = cat.slug === activeCategorySlug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-2xl font-display text-xs font-black uppercase tracking-wider text-left shrink-0 transition-all duration-150 border border-transparent",
                    isActive 
                      ? "bg-[rgba(249,115,22,0.08)] text-[var(--accent-text)] border-[rgba(249,115,22,0.15)]" 
                      : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-base)]"
                  )}
                >
                  <FolderSimple size={14} weight={isActive ? "fill" : "regular"} />
                  {cat.name}
                  <span className="ml-auto text-[10px] font-body font-normal text-[var(--text-muted)]">
                    ({cat.videos.length})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right Side Video Catalog Grid */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h2 className="font-display text-sm font-black text-white uppercase tracking-wider">
              {searchQuery ? `Search Results (${filteredVideos.length})` : activeCategory?.name}
            </h2>
            <span className="font-body text-[10px] text-[var(--text-muted)]">
              Showing {filteredVideos.length} videos
            </span>
          </div>

          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredVideos.map((vid, idx) => {
                // Ensure proper typing for category name if present in global search results
                const customVid = vid as LibraryVideo & { categoryName?: string };
                return (
                  <Card 
                    key={idx} 
                    variant="surface" 
                    className="p-4 space-y-3 cursor-pointer hover:border-[var(--accent-start)]/40 transition-all duration-200 group"
                    onClick={() => handlePlayVideo(vid.name, vid.path)}
                  >
                    {/* Video Thumbnail Wrapper */}
                    <div className="relative aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-[var(--border)]">
                      <video
                        src={vid.path}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                        muted
                        playsInline
                      />
                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent-start)]/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
                          <Play size={20} weight="fill" className="ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1">
                      <h4 className="font-display text-sm font-black text-white group-hover:text-[var(--accent-text)] transition-colors duration-150 truncate leading-tight">
                        {vid.name}
                      </h4>
                      <p className="font-body text-[9px] text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                        {customVid.categoryName ? (
                          <>
                            <span>{customVid.categoryName}</span>
                            <span>•</span>
                          </>
                        ) : null}
                        <span>Click to play</span>
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-[var(--border)] rounded-3xl bg-[var(--bg-base)]">
              <FolderSimple size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
              <p className="font-body text-xs text-[var(--text-secondary)] font-bold">No videos match your search query</p>
              <p className="font-body text-[10px] text-[var(--text-muted)] mt-1">Try searching for other tags or clear the search input.</p>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal Player */}
      <VideoPlayerModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={selectedVideoUrl}
        exerciseName={selectedExerciseName}
      />
    </div>
  );
}
