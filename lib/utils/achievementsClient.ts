export async function triggerBadgeCheck(): Promise<string[]> {
  if (typeof window === "undefined") return [];

  try {
    const res = await fetch("/api/badges/check", { method: "POST" });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.badgeIds && data.badgeIds.length > 0) {
      window.dispatchEvent(
        new CustomEvent("badges-unlocked", { detail: { badgeIds: data.badgeIds } })
      );
    }
    return data.badgeIds || [];
  } catch (error) {
    console.error("Error triggering badge check:", error);
    return [];
  }
}
