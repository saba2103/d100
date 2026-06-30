import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndAwardBadges } from "@/lib/achievements";
import { BADGES } from "@/lib/badges";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("active_profile")
      .eq("user_id", user.id)
      .single();
    const activeProfile = settings?.active_profile || "S";
    const newBadgeIds = await checkAndAwardBadges(user.id, activeProfile as "S" | "P");

    // Send push notification for each newly unlocked badge
    if (newBadgeIds && newBadgeIds.length > 0) {
      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      for (const badgeId of newBadgeIds) {
        const badgeDef = BADGES.find((b) => b.id === badgeId);
        const title = `🏆 New Badge Unlocked: ${badgeDef?.name || "Achievement"}`;
        const body = badgeDef?.description || "You earned a new achievement badge in D100!";

        try {
          await fetch(`${origin}/api/push/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              title,
              body,
              action_url: "/badges",
            }),
          });
        } catch (pushErr) {
          console.error("Failed to trigger push notification for badge unlock:", pushErr);
        }
      }
    }

    return NextResponse.json({ badgeIds: newBadgeIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
