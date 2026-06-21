import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndAwardBadges } from "@/lib/achievements";

export async function POST() {
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
    const newBadgeIds = await checkAndAwardBadges(user.id, activeProfile as "S" | "A");
    return NextResponse.json({ badgeIds: newBadgeIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
