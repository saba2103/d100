export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptSafe } from "@/lib/utils/encryption";

export async function GET() {
  try {
    const supabase = createClient();
    
    // Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // Decrypt key to get last 4 characters
    const decryptedKey = decryptSafe(settings.ai_api_key_encrypted);
    const keyExists = !!decryptedKey;
    const keyLast4 = decryptedKey ? decryptedKey.slice(-4) : "";

    // Return sanitized settings
    return NextResponse.json({
      theme: settings.theme,
      ai_provider: settings.ai_provider,
      water_goal_ml: settings.water_goal_ml,
      steps_goal: settings.steps_goal,
      calories_goal: settings.calories_goal,
      active_profile: settings.active_profile,
      keyExists,
      keyLast4,
    });
  } catch (err: any) {
    console.error("Get Settings Route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}
